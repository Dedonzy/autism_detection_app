import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// M-CHAT-R/F questions
export const MCHAT_QUESTIONS = [
  {
    id: 1,
    text: "If you point at something across the room, does your child look at it?",
    category: "joint_attention",
    critical: true,
  },
  {
    id: 2,
    text: "Have you ever wondered if your child might be deaf?",
    category: "hearing",
    critical: false,
  },
  {
    id: 3,
    text: "Does your child play pretend or make-believe?",
    category: "pretend_play",
    critical: true,
  },
  {
    id: 4,
    text: "Does your child like climbing on things?",
    category: "motor",
    critical: false,
  },
  {
    id: 5,
    text: "Does your child make unusual finger movements near their eyes?",
    category: "repetitive_behavior",
    critical: true,
  },
  {
    id: 6,
    text: "Does your child point with one finger to ask for something or to get help?",
    category: "pointing",
    critical: true,
  },
  {
    id: 7,
    text: "Does your child point with one finger to show you something interesting?",
    category: "pointing",
    critical: true,
  },
  {
    id: 8,
    text: "Is your child interested in other children?",
    category: "social_interest",
    critical: false,
  },
  {
    id: 9,
    text: "Does your child show you things by bringing them to you or holding them up for you to see?",
    category: "showing",
    critical: true,
  },
  {
    id: 10,
    text: "Does your child respond when you call their name?",
    category: "response_to_name",
    critical: false,
  },
  {
    id: 11,
    text: "When you smile at your child, does they smile back at you?",
    category: "social_smile",
    critical: false,
  },
  {
    id: 12,
    text: "Does your child get upset by everyday noises?",
    category: "sensory",
    critical: false,
  },
  {
    id: 13,
    text: "Does your child walk?",
    category: "motor",
    critical: false,
  },
  {
    id: 14,
    text: "Does your child look you in the eye when you are talking to them, playing with them, or dressing them?",
    category: "eye_contact",
    critical: false,
  },
  {
    id: 15,
    text: "Does your child try to copy what you do?",
    category: "imitation",
    critical: true,
  },
  {
    id: 16,
    text: "If you turn your head to look at something, does your child look around to see what you are looking at?",
    category: "joint_attention",
    critical: true,
  },
  {
    id: 17,
    text: "Does your child try to get you to watch them?",
    category: "attention_seeking",
    critical: true,
  },
  {
    id: 18,
    text: "Does your child understand when you tell them to do something?",
    category: "comprehension",
    critical: false,
  },
  {
    id: 19,
    text: "If something new happens, does your child look at your face to see how you feel about it?",
    category: "social_referencing",
    critical: true,
  },
  {
    id: 20,
    text: "Does your child like movement activities?",
    category: "motor",
    critical: false,
  },
];

export const getMChatQuestions = query({
  args: {},
  handler: async () => {
    return MCHAT_QUESTIONS;
  },
});

export const saveMChatResponse = mutation({
  args: {
    childId: v.id("children"),
    sessionId: v.string(),
    responses: v.array(v.object({
      questionId: v.number(),
      answer: v.union(v.literal("yes"), v.literal("no")),
      timestamp: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify child belongs to user
    const child = await ctx.db.get(args.childId);
    if (!child || child.parentId !== userId) {
      throw new Error("Child not found or access denied");
    }

    // Calculate score and risk level
    const { totalScore, riskLevel, followUpRequired } = calculateMChatScore(args.responses);

    const responseId = await ctx.db.insert("mchatResponses", {
      childId: args.childId,
      parentId: userId,
      sessionId: args.sessionId,
      responses: args.responses,
      totalScore,
      riskLevel,
      completedAt: Date.now(),
      followUpRequired,
    });

    return { responseId, totalScore, riskLevel, followUpRequired };
  },
});

export const getMChatHistory = query({
  args: { childId: v.id("children") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Verify child belongs to user
    const child = await ctx.db.get(args.childId);
    if (!child || child.parentId !== userId) return [];

    const responses = await ctx.db
      .query("mchatResponses")
      .withIndex("by_child", (q) => q.eq("childId", args.childId))
      .order("desc")
      .collect();

    return responses;
  },
});

function calculateMChatScore(responses: Array<{ questionId: number; answer: "yes" | "no" }>) {
  let totalScore = 0;
  let criticalFailures = 0;

  responses.forEach(response => {
    const question = MCHAT_QUESTIONS.find(q => q.id === response.questionId);
    if (!question) return;

    // For M-CHAT, "concerning" answers vary by question
    const concerningAnswers = [2, 5, 12]; // Questions where "yes" is concerning
    const isConcerning = concerningAnswers.includes(response.questionId) 
      ? response.answer === "yes" 
      : response.answer === "no";

    if (isConcerning) {
      totalScore++;
      if (question.critical) {
        criticalFailures++;
      }
    }
  });

  let riskLevel: "low" | "medium" | "high";
  let followUpRequired = false;

  if (totalScore >= 8 || criticalFailures >= 3) {
    riskLevel = "high";
    followUpRequired = true;
  } else if (totalScore >= 3 || criticalFailures >= 2) {
    riskLevel = "medium";
    followUpRequired = true;
  } else {
    riskLevel = "low";
  }

  return { totalScore, riskLevel, followUpRequired };
}
