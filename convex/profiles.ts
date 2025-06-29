import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getCurrentProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    return profile;
  },
});

export const createProfile = mutation({
  args: {
    role: v.union(v.literal("parent"), v.literal("doctor"), v.literal("researcher")),
    firstName: v.string(),
    lastName: v.string(),
    organization: v.optional(v.string()),
    licenseNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existingProfile) {
      throw new Error("Profile already exists");
    }

    const profileId = await ctx.db.insert("profiles", {
      userId,
      role: args.role,
      firstName: args.firstName,
      lastName: args.lastName,
      organization: args.organization,
      licenseNumber: args.licenseNumber,
      preferences: {
        darkMode: false,
        notifications: true,
        language: "en",
      },
    });

    return profileId;
  },
});

export const updateProfile = mutation({
  args: {
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    organization: v.optional(v.string()),
    preferences: v.optional(v.object({
      darkMode: v.boolean(),
      notifications: v.boolean(),
      language: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) throw new Error("Profile not found");

    const updates: any = {};
    if (args.firstName !== undefined) updates.firstName = args.firstName;
    if (args.lastName !== undefined) updates.lastName = args.lastName;
    if (args.organization !== undefined) updates.organization = args.organization;
    if (args.preferences !== undefined) updates.preferences = args.preferences;

    await ctx.db.patch(profile._id, updates);
    return profile._id;
  },
});
