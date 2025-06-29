import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getChatSessions = query({
  args: { childId: v.optional(v.id("children")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let query = ctx.db.query("chatSessions").withIndex("by_user", (q) => q.eq("userId", userId));
    
    if (args.childId) {
      query = ctx.db.query("chatSessions").withIndex("by_child", (q) => q.eq("childId", args.childId));
    }

    const sessions = await query.order("desc").take(20);
    return sessions;
  },
});

export const getChatSession = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const sessions = await ctx.db
      .query("chatSessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const session = sessions.find(s => s._id === args.sessionId);
    return session || null;
  },
});

export const createChatSession = mutation({
  args: {
    childId: v.optional(v.id("children")),
    title: v.string(),
    messages: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string(),
      timestamp: v.number(),
      messageId: v.string(),
    })),
    sessionType: v.union(v.literal("general"), v.literal("assessment"), v.literal("therapy")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify child belongs to user if childId provided
    if (args.childId) {
      const child = await ctx.db.get(args.childId);
      if (!child || child.parentId !== userId) {
        throw new Error("Child not found or access denied");
      }
    }

    const sessionId = await ctx.db.insert("chatSessions", {
      userId,
      childId: args.childId,
      title: args.title,
      messages: args.messages,
      lastActivity: Date.now(),
      sessionType: args.sessionType,
    });

    return sessionId;
  },
});

export const updateChatSession = mutation({
  args: {
    sessionId: v.string(),
    messages: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string(),
      timestamp: v.number(),
      messageId: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const sessions = await ctx.db
      .query("chatSessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const session = sessions.find(s => s._id === args.sessionId);
    if (!session) throw new Error("Session not found");

    await ctx.db.patch(session._id, {
      messages: [...session.messages, ...args.messages],
      lastActivity: Date.now(),
    });

    return session._id;
  },
});
