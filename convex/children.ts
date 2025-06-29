import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getMyChildren = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const children = await ctx.db
      .query("children")
      .withIndex("by_parent", (q) => q.eq("parentId", userId))
      .collect();

    return children;
  },
});

export const getChild = query({
  args: { childId: v.id("children") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const child = await ctx.db.get(args.childId);
    if (!child || child.parentId !== userId) return null;

    return child;
  },
});

export const addChild = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    dateOfBirth: v.string(),
    gender: v.union(v.literal("male"), v.literal("female"), v.literal("other")),
    medicalHistory: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Calculate current age in months
    const birthDate = new Date(args.dateOfBirth);
    const now = new Date();
    const ageInMonths = Math.floor((now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));

    const childId = await ctx.db.insert("children", {
      parentId: userId,
      firstName: args.firstName,
      lastName: args.lastName,
      dateOfBirth: args.dateOfBirth,
      gender: args.gender,
      medicalHistory: args.medicalHistory,
      currentAge: ageInMonths,
    });

    return childId;
  },
});

export const updateChild = mutation({
  args: {
    childId: v.id("children"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    medicalHistory: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const child = await ctx.db.get(args.childId);
    if (!child || child.parentId !== userId) {
      throw new Error("Child not found or access denied");
    }

    const updates: any = {};
    if (args.firstName !== undefined) updates.firstName = args.firstName;
    if (args.lastName !== undefined) updates.lastName = args.lastName;
    if (args.medicalHistory !== undefined) updates.medicalHistory = args.medicalHistory;

    await ctx.db.patch(args.childId, updates);
    return args.childId;
  },
});
