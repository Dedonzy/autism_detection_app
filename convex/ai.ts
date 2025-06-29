import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const generateAIResponse = action({
  args: {
    message: v.string(),
    context: v.optional(v.object({
      childAge: v.optional(v.number()),
      recentAssessments: v.optional(v.array(v.string())),
      progressData: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const systemPrompt = `You are a compassionate AI assistant specializing in autism spectrum disorder (ASD) support for parents, caregivers, and healthcare professionals. Your role is to:

1. Provide evidence-based information about autism and developmental milestones
2. Offer practical strategies for supporting children with autism
3. Help interpret assessment results and progress tracking
4. Suggest therapeutic activities and interventions
5. Provide emotional support and guidance to families

Guidelines:
- Always be empathetic and supportive
- Provide practical, actionable advice
- Reference current research and best practices
- Encourage professional consultation when appropriate
- Never provide medical diagnoses - only educational information
- Be culturally sensitive and inclusive
- Focus on strengths-based approaches

Context: ${args.context ? JSON.stringify(args.context) : 'No specific context provided'}`;

    try {
      const response = await fetch(`${process.env.CONVEX_OPENAI_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.CONVEX_OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-nano',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: args.message }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('AI response generation failed:', error);
      return "I apologize, but I'm having trouble generating a response right now. Please try again in a moment, or consider reaching out to a healthcare professional for immediate assistance.";
    }
  },
});

export const saveChatMessage = action({
  args: {
    sessionId: v.optional(v.string()),
    childId: v.optional(v.id("children")),
    userMessage: v.string(),
    aiResponse: v.string(),
    sessionType: v.union(v.literal("general"), v.literal("assessment"), v.literal("therapy")),
  },
  handler: async (ctx, args): Promise<string> => {
    const messages = [
      {
        role: "user" as const,
        content: args.userMessage,
        timestamp: Date.now(),
        messageId: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      },
      {
        role: "assistant" as const,
        content: args.aiResponse,
        timestamp: Date.now() + 1,
        messageId: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      },
    ];

    if (args.sessionId) {
      // Update existing session
      await ctx.runMutation(api.chat.updateChatSession, {
        sessionId: args.sessionId,
        messages,
      });
      return args.sessionId;
    } else {
      // Create new session
      const sessionId: string = await ctx.runMutation(api.chat.createChatSession, {
        childId: args.childId,
        title: args.userMessage.substring(0, 50) + (args.userMessage.length > 50 ? "..." : ""),
        messages,
        sessionType: args.sessionType,
      });
      return sessionId;
    }
  },
});
