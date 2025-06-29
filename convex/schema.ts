import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // User profiles with role-based access
  profiles: defineTable({
    userId: v.id("users"),
    role: v.union(v.literal("parent"), v.literal("doctor"), v.literal("researcher")),
    firstName: v.string(),
    lastName: v.string(),
    organization: v.optional(v.string()),
    licenseNumber: v.optional(v.string()),
    preferences: v.object({
      darkMode: v.boolean(),
      notifications: v.boolean(),
      language: v.string(),
    }),
  }).index("by_user", ["userId"]),

  // Child profiles for tracking
  children: defineTable({
    parentId: v.id("users"),
    firstName: v.string(),
    lastName: v.string(),
    dateOfBirth: v.string(),
    gender: v.union(v.literal("male"), v.literal("female"), v.literal("other")),
    medicalHistory: v.optional(v.string()),
    currentAge: v.number(), // in months
    profileImage: v.optional(v.id("_storage")),
  }).index("by_parent", ["parentId"]),

  // M-CHAT questionnaire responses
  mchatResponses: defineTable({
    childId: v.id("children"),
    parentId: v.id("users"),
    sessionId: v.string(),
    responses: v.array(v.object({
      questionId: v.number(),
      answer: v.union(v.literal("yes"), v.literal("no")),
      timestamp: v.number(),
    })),
    totalScore: v.number(),
    riskLevel: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    completedAt: v.number(),
    followUpRequired: v.boolean(),
  }).index("by_child", ["childId"])
    .index("by_parent", ["parentId"]),

  // Progress tracking entries
  progressEntries: defineTable({
    childId: v.id("children"),
    parentId: v.id("users"),
    category: v.union(v.literal("behavioral"), v.literal("communication"), v.literal("social")),
    milestone: v.string(),
    achieved: v.boolean(),
    notes: v.optional(v.string()),
    dateRecorded: v.number(),
    severity: v.optional(v.union(v.literal("mild"), v.literal("moderate"), v.literal("severe"))),
  }).index("by_child_category", ["childId", "category"])
    .index("by_child", ["childId"]),

  // AI therapy chat sessions
  chatSessions: defineTable({
    userId: v.id("users"),
    childId: v.optional(v.id("children")),
    title: v.string(),
    messages: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string(),
      timestamp: v.number(),
      messageId: v.string(),
    })),
    lastActivity: v.number(),
    sessionType: v.union(v.literal("general"), v.literal("assessment"), v.literal("therapy")),
  }).index("by_user", ["userId"])
    .index("by_child", ["childId"]),

  // Appointments and scheduling
  appointments: defineTable({
    parentId: v.id("users"),
    childId: v.id("children"),
    doctorId: v.optional(v.id("users")),
    title: v.string(),
    description: v.optional(v.string()),
    scheduledDate: v.number(),
    duration: v.number(), // in minutes
    type: v.union(v.literal("screening"), v.literal("therapy"), v.literal("followup")),
    status: v.union(v.literal("scheduled"), v.literal("completed"), v.literal("cancelled")),
    reminders: v.array(v.object({
      type: v.union(v.literal("email"), v.literal("push")),
      sentAt: v.number(),
    })),
  }).index("by_parent", ["parentId"])
    .index("by_child", ["childId"])
    .index("by_doctor", ["doctorId"]),

  // Reports and assessments
  reports: defineTable({
    childId: v.id("children"),
    parentId: v.id("users"),
    generatedBy: v.id("users"),
    title: v.string(),
    reportType: v.union(v.literal("mchat"), v.literal("progress"), v.literal("comprehensive")),
    content: v.object({
      summary: v.string(),
      recommendations: v.array(v.string()),
      scores: v.optional(v.object({
        behavioral: v.number(),
        communication: v.number(),
        social: v.number(),
      })),
      charts: v.optional(v.array(v.object({
        type: v.string(),
        data: v.string(), // JSON string
      }))),
    }),
    generatedAt: v.number(),
    pdfFileId: v.optional(v.id("_storage")),
  }).index("by_child", ["childId"])
    .index("by_parent", ["parentId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
