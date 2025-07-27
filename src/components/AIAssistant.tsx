import { useState, useRef, useEffect } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface AIAssistantProps {
  selectedChildId: string | null;
}

export function AIAssistant({ selectedChildId }: AIAssistantProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentTypingMessage, setCurrentTypingMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: number;
  }>>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const child = useQuery(
    api.children.getChild,
    selectedChildId ? { childId: selectedChildId as any } : "skip"
  );
  const progressStats = useQuery(
    api.progress.getProgressStats,
    selectedChildId ? { childId: selectedChildId as any } : "skip"
  );
  const mchatHistory = useQuery(
    api.mchat.getMChatHistory,
    selectedChildId ? { childId: selectedChildId as any } : "skip"
  );
  
  const generateAIResponse = useAction(api.ai.generateAIResponse);
  const saveChatMessage = useAction(api.ai.saveChatMessage);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, currentTypingMessage]);

  useEffect(() => {
    if (chatHistory.length === 0) {
      setChatHistory([{
        role: "assistant",
        content:
          "Hello! I'm your AI assistant specializing in autism support and child development. I'm here to help you understand your child's progress, provide guidance on developmental activities, and answer any questions you might have. How can I assist you today?",
        timestamp: Date.now(),
      }]);
    }
  }, []);

  // Cleanup typing interval on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  const typeMessage = (fullMessage: string) => {
    setIsTyping(true);
    setCurrentTypingMessage("");
    
    let currentIndex = 0;
    const words = fullMessage.split(" ");
    
    typingIntervalRef.current = setInterval(() => {
      if (currentIndex < words.length) {
        setCurrentTypingMessage(prev => {
          const newMessage = prev + (currentIndex === 0 ? "" : " ") + words[currentIndex];
          return newMessage;
        });
        currentIndex++;
      } else {
        // Typing complete
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
        }
        
        // Add the complete message to chat history
        const newAIMessage = {
          role: "assistant" as const,
          content: fullMessage,
          timestamp: Date.now(),
        };
        setChatHistory(prev => [...prev, newAIMessage]);
        
        // Reset typing state
        setIsTyping(false);
        setCurrentTypingMessage("");
      }
    }, 80); // Adjust speed here (milliseconds between words)
  };

  const buildContext = () => {
    if (!selectedChildId || !child) return undefined;

    return {
      childAge: child.currentAge,
      recentAssessments: mchatHistory?.slice(0, 3).map(assessment =>
        `M-CHAT completed on ${new Date(assessment.completedAt).toLocaleDateString()} with ${assessment.riskLevel} risk level (score: ${assessment.totalScore}/20)`
      ),
      progressData: progressStats ?
        `Overall progress: ${progressStats.overall.percentage}% (${progressStats.overall.achieved}/${progressStats.overall.total} milestones). Behavioral: ${progressStats.behavioral.percentage}%, Communication: ${progressStats.communication.percentage}%, Social: ${progressStats.social.percentage}%`
        : undefined,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading || isTyping) return;

    const userMessage = message.trim();
    setMessage("");
    setIsLoading(true);

    const newUserMessage = {
      role: "user" as const,
      content: userMessage,
      timestamp: Date.now(),
    };
    setChatHistory(prev => [...prev, newUserMessage]);

    try {
      const context = buildContext();
      const aiResponse = await generateAIResponse({ message: userMessage, context });

      // Stop loading and start typing animation
      setIsLoading(false);
      typeMessage(aiResponse);

      await saveChatMessage({
        childId: selectedChildId as any || undefined,
        sessionType: "general", // Set to the appropriate session type
        userMessage,
        aiResponse,
      });
    } catch (error) {
      toast.error("Failed to get AI response. Please try again.");
      console.error(error);
      setIsLoading(false);
    } finally {
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    // Clear any ongoing typing
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
    setIsTyping(false);
    setCurrentTypingMessage("");
    
    setChatHistory([{
      role: "assistant",
      content:
        "Hello! I'm your AI assistant specializing in autism support and child development. I'm here to help you understand your child's progress, provide guidance on developmental activities, and answer any questions you might have. How can I assist you today?",
      timestamp: Date.now(),
    }]);
  };

  const suggestedQuestions = [
    "What are some early signs of autism I should look for?",
    "How can I help my child with communication skills?",
    "What activities can improve social interaction?",
    "How do I interpret M-CHAT results?",
    "What should I do if I'm concerned about my child's development?",
  ];

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-dark">AI Assistant</h1>
          <p className="text-gray-600 mt-1">
            {selectedChildId && child ?
              `Personalized guidance for ${child.firstName} ${child.lastName}` :
              "Get expert guidance on autism support and child development"
            }
          </p>
        </div>
        <button onClick={clearChat} className="btn-secondary text-sm">
          Clear Chat
        </button>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-slide-up`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`max-w-3xl ${msg.role === "user" ? "order-2" : "order-1"}`}>
                <div className={`flex items-start space-x-3 ${msg.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    msg.role === "user" ?
                      "bg-primary text-white" :
                      "bg-accent text-white"
                  }`}
                  >
                    {msg.role === "user" ? "👤" : "🤖"}
                  </div>
                  <div className={`px-4 py-3 rounded-2xl ${
                    msg.role === "user" ?
                      "bg-primary text-white" :
                      "bg-gray-100 text-dark"
                  }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    <p className={`text-xs mt-2 ${
                      msg.role === "user" ? "text-primary-light" : "text-gray-500"
                    }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Message */}
          {isTyping && currentTypingMessage && (
            <div className="flex justify-start animate-slide-up">
              <div className="max-w-3xl">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-sm font-medium">
                    🤖
                  </div>
                  <div className="bg-gray-100 px-4 py-3 rounded-2xl text-dark">
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {currentTypingMessage}
                      <span className="inline-block w-2 h-5 bg-gray-400 ml-1 animate-pulse"></span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-start animate-slide-up">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-sm">
                  🤖
                </div>
                <div className="bg-gray-100 px-4 py-3 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Thinking...</p>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {chatHistory.length <= 1 && !isTyping && (
          <div className="px-6 py-4 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-3">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setMessage(question)}
                  className="text-sm px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors duration-200"
                  disabled={isLoading || isTyping}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="p-6 border-t border-gray-100">
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask me anything about autism support, development, or your child's progress..."
              className="flex-1 input-field"
              disabled={isLoading || isTyping}
            />
            <button
              type="submit"
              disabled={!message.trim() || isLoading || isTyping}
              className="btn-primary px-6"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </form>
          
          {/* Status indicator */}
          {(isLoading || isTyping) && (
            <div className="mt-2 flex items-center text-xs text-gray-500">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse mr-2"></div>
              {isLoading ? "Getting response..." : "AI is typing..."}
            </div>
          )}
        </div>
      </div>

      {selectedChildId && child && (
        <div className="mt-4 p-4 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Context:</span> I have access to {child.firstName}'s profile,
            {mchatHistory?.length ? ` ${mchatHistory.length} M-CHAT assessment(s),` : ""}
            {progressStats ? ` and progress data (${progressStats.overall.achieved} milestones tracked).` : " but no progress data yet."}
          </p>
        </div>
      )}
    </div>
  );
}