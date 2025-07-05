import { query, mutation } from "./_api/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getProgressEntries = query({
  args: { 
    childId: v.id("children"),
    category: v.optional(v.union(v.literal("behavioral"), v.literal("communication"), v.literal("social"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Verify child belongs to user
    const child = await ctx.db.get(args.childId);
    if (!child || child.parentId !== userId) return [];

    let entries;
    
    if (args.category) {
      entries = await ctx.db
        .query("progressEntries")
        .withIndex("by_child_category", (q) => 
          q.eq("childId", args.childId).eq("category", args.category!)
        )
        .order("desc")
        .collect();
    } else {
      entries = await ctx.db
        .query("progressEntries")
        .withIndex("by_child", (q) => q.eq("childId", args.childId))
        .order("desc")
        .collect();
    }

    return entries;
  },
});

export const addProgressEntry = mutation({
  args: {
    childId: v.id("children"),
    category: v.union(v.literal("behavioral"), v.literal("communication"), v.literal("social")),
    milestone: v.string(),
    achieved: v.boolean(),
    notes: v.optional(v.string()),
    severity: v.optional(v.union(v.literal("mild"), v.literal("moderate"), v.literal("severe"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify child belongs to user
    const child = await ctx.db.get(args.childId);
    if (!child || child.parentId !== userId) {
      throw new Error("Child not found or access denied");
    }

    const entryId = await ctx.db.insert("progressEntries", {
      childId: args.childId,
      parentId: userId,
      category: args.category,
      milestone: args.milestone,
      achieved: args.achieved,
      notes: args.notes,
      dateRecorded: Date.now(),
      severity: args.severity,
    });

    return entryId;
  },
});

export const getProgressStats = query({
  args: { childId: v.id("children") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    // Verify child belongs to user
    const child = await ctx.db.get(args.childId);
    if (!child || child.parentId !== userId) return null;

    const entries = await ctx.db
      .query("progressEntries")
      .withIndex("by_child", (q) => q.eq("childId", args.childId))
      .collect();

    const stats = {
      behavioral: { total: 0, achieved: 0 },
      communication: { total: 0, achieved: 0 },
      social: { total: 0, achieved: 0 },
      overall: { total: 0, achieved: 0 },
    };

    entries.forEach(entry => {
      stats[entry.category].total++;
      stats.overall.total++;
      
      if (entry.achieved) {
        stats[entry.category].achieved++;
        stats.overall.achieved++;
      }
    });

    // Calculate percentages
    const result = {
      behavioral: {
        ...stats.behavioral,
        percentage: stats.behavioral.total > 0 ? Math.round((stats.behavioral.achieved / stats.behavioral.total) * 100) : 0,
      },
      communication: {
        ...stats.communication,
        percentage: stats.communication.total > 0 ? Math.round((stats.communication.achieved / stats.communication.total) * 100) : 0,
      },
      social: {
        ...stats.social,
        percentage: stats.social.total > 0 ? Math.round((stats.social.achieved / stats.social.total) * 100) : 0,
      },
      overall: {
        ...stats.overall,
        percentage: stats.overall.total > 0 ? Math.round((stats.overall.achieved / stats.overall.total) * 100) : 0,
      },
    };

    return result;
  },
});

export const updateProgressEntry = mutation({
  args: {
    entryId: v.id("progressEntries"),
    achieved: v.optional(v.boolean()),
    notes: v.optional(v.string()),
    severity: v.optional(v.union(v.literal("mild"), v.literal("moderate"), v.literal("severe"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const entry = await ctx.db.get(args.entryId);
    if (!entry || entry.parentId !== userId) {
      throw new Error("Progress entry not found or access denied");
    }

    const updates: any = {};
    if (args.achieved !== undefined) updates.achieved = args.achieved;
    if (args.notes !== undefined) updates.notes = args.notes;
    if (args.severity !== undefined) updates.severity = args.severity;

    await ctx.db.patch(args.entryId, updates);
    return args.entryId;
  },
});
