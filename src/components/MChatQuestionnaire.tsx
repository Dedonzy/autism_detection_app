import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface MChatQuestionnaireProps {
  childId: string;
  onNavigate: (view: 'dashboard' | 'children' | 'mchat' | 'progress' | 'ai-assistant') => void;
}

export function MChatQuestionnaire({ childId, onNavigate }: MChatQuestionnaireProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Array<{
    questionId: number;
    answer: "yes" | "no";
    timestamp: number;
  }>>([]);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);

  const questions = useQuery(api.mchat.getMChatQuestions);
  const child = useQuery(api.children.getChild, { childId: childId as any });
  const children = useQuery(api.children.getMyChildren);
  const saveMChatResponse = useMutation(api.mchat.saveMChatResponse);

  const totalQuestions = questions?.length || 20;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const handleAnswer = (answer: "yes" | "no") => {
    if (!questions) return;

    const newResponse = {
      questionId: questions[currentQuestion].id,
      answer,
      timestamp: Date.now(),
    };

    const updatedResponses = [...responses, newResponse];
    setResponses(updatedResponses);

    // Add animation delay before moving to next question
    setTimeout(() => {
      if (currentQuestion < totalQuestions - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        // Submit all responses
        submitResponses(updatedResponses);
      }
    }, 300);
  };

  const submitResponses = async (finalResponses: typeof responses) => {
    setIsSubmitting(true);
    try {
      const result = await saveMChatResponse({
        childId: childId as any,
        sessionId,
        responses: finalResponses,
      });
      setResults(result);
      setShowResults(true);
      toast.success("M-CHAT assessment completed successfully!");
    } catch (error) {
      toast.error("Failed to save assessment. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setResponses(responses.slice(0, -1));
    }
  };

  const resetAssessment = () => {
    setCurrentQuestion(0);
    setResponses([]);
    setShowResults(false);
    setResults(null);
  };

  const handleBackToDashboard = () => {
    try {
      onNavigate('dashboard');
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback - you might want to use a different approach here
      // For example, if your parent component expects a different value:
      // onNavigate('children'); // or whatever the fallback should be
    }
  };

  // Combined loading state for children, child, and questions
  if (children === undefined || child === undefined || questions === undefined) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary border-t-transparent"></div>
            <div>
              <h2 className="text-lg font-semibold text-dark mb-2">Loading M-CHAT Assessment</h2>
              <p className="text-gray-600">Preparing questions and child profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if we have no children
  if (children !== undefined && children.length === 0) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="card text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-dark mb-4">No Children Added</h1>
          <p className="text-gray-600 mb-6">
            You need to add a child profile before you can start the M-CHAT assessment. 
            The assessment helps screen for autism spectrum characteristics in toddlers.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">About M-CHAT Assessment</h3>
            <p className="text-sm text-blue-800">
              The Modified Checklist for Autism in Toddlers (M-CHAT) is a 20-question screening tool 
              designed for children between 16-30 months old to identify early signs of autism spectrum disorder.
            </p>
          </div>
          <button
            onClick={() => onNavigate('children')}
            className="btn-primary"
          >
            Add Child Profile
          </button>
        </div>
      </div>
    );
  }

  // Check if specific child doesn't exist
  if (child === null) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="card text-center">
          <div className="w-20 h-20 bg-error/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-dark mb-4">Child Not Found</h1>
          <p className="text-gray-600 mb-6">
            The selected child profile could not be found. Please select a different child 
            or return to the dashboard.
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => onNavigate('children')}
              className="btn-secondary flex-1"
            >
              Manage Children
            </button>
            <button
              onClick={handleBackToDashboard}
              className="btn-primary flex-1"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (!questions || !child) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary border-t-transparent"></div>
            <div>
              <h2 className="text-lg font-semibold text-dark mb-2">Loading M-CHAT Assessment</h2>
              <p className="text-gray-600">Preparing questions and child profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showResults && results) {
    return (
      <div className="max-w-2xl mx-auto animate-scale-in">
        <div className="card text-center">
          <div className="mb-6">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl mb-4 ${
              results.riskLevel === 'high' ? 'bg-error/10 text-error' :
              results.riskLevel === 'medium' ? 'bg-warning/10 text-warning' :
              'bg-success/10 text-success'
            }`}>
              {results.riskLevel === 'high' ? '⚠️' :
               results.riskLevel === 'medium' ? '⚡' : '✅'}
            </div>
            <h1 className="text-2xl font-bold text-dark mb-2">Assessment Complete</h1>
            <p className="text-gray-600">
              M-CHAT assessment for {child.firstName} {child.lastName}
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Score</p>
                <p className="text-3xl font-bold text-dark">{results.totalScore}/20</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Risk Level</p>
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                  results.riskLevel === 'high' ? 'bg-error/10 text-error' :
                  results.riskLevel === 'medium' ? 'bg-warning/10 text-warning' :
                  'bg-success/10 text-success'
                }`}>
                  {results.riskLevel.toUpperCase()} RISK
                </span>
              </div>
            </div>
          </div>

          <div className="text-left mb-6">
            <h3 className="font-semibold text-dark mb-3">What this means:</h3>
            {results.riskLevel === 'high' && (
              <div className="bg-error/5 border border-error/20 rounded-xl p-4">
                <p className="text-error font-medium mb-2">High Risk Detected</p>
                <p className="text-sm text-gray-700">
                  The assessment indicates a higher likelihood of autism spectrum characteristics. 
                  We strongly recommend consulting with a pediatric developmental specialist for 
                  a comprehensive evaluation.
                </p>
              </div>
            )}
            {results.riskLevel === 'medium' && (
              <div className="bg-warning/5 border border-warning/20 rounded-xl p-4">
                <p className="text-warning font-medium mb-2">Medium Risk Detected</p>
                <p className="text-sm text-gray-700">
                  Some autism spectrum characteristics were identified. Consider discussing 
                  these results with your pediatrician and monitoring your child's development closely.
                </p>
              </div>
            )}
            {results.riskLevel === 'low' && (
              <div className="bg-success/5 border border-success/20 rounded-xl p-4">
                <p className="text-success font-medium mb-2">Low Risk</p>
                <p className="text-sm text-gray-700">
                  The assessment suggests typical development patterns. Continue regular 
                  developmental monitoring and consult your pediatrician with any concerns.
                </p>
              </div>
            )}
          </div>

          <div className="flex space-x-4">
            <button
              onClick={resetAssessment}
              className="btn-secondary flex-1"
            >
              Take Again
            </button>
            <button
              onClick={handleBackToDashboard}
              className="btn-primary flex-1"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <div className="animate-pulse-success w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-dark mb-2">Processing Assessment</h2>
          <p className="text-gray-600">Analyzing responses and generating results...</p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header with Back to Dashboard button */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToDashboard}
              className="btn-icon hover:bg-gray-100"
              title="Back to Dashboard"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-dark">M-CHAT Assessment</h1>
          </div>
          <span className="text-sm text-gray-600">
            {currentQuestion + 1} of {totalQuestions}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 bg-primary rounded-full progress-bar transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="card animate-slide-up">
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <span className="text-primary font-bold">{currentQuestion + 1}</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Question {currentQuestion + 1}</p>
              <p className="text-xs text-gray-500 capitalize">{currentQ.category.replace('_', ' ')}</p>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-dark leading-relaxed">
            {currentQ.text}
          </h2>
          
          {currentQ.critical && (
            <div className="mt-3 inline-flex items-center px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">
              Critical Item
            </div>
          )}
        </div>

        {/* Answer Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => handleAnswer("yes")}
            className="btn-secondary hover:bg-green-500 hover:text-white hover:border-green-500 active:bg-green-600 active:text-white active:border-green-600 text-lg py-4 animate-scale-in transition-all duration-200"
            style={{ animationDelay: '100ms' }}
          >
            <span className="mr-2">✓</span>
            Yes
          </button>
          <button
            onClick={() => handleAnswer("no")}
            className="btn-secondary hover:bg-green-500 hover:text-white hover:border-green-500 active:bg-green-600 active:text-white active:border-green-600 text-lg py-4 animate-scale-in transition-all duration-200"
            style={{ animationDelay: '200ms' }}
          >
            <span className="mr-2">✗</span>
            No
          </button>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={goBack}
            disabled={currentQuestion === 0}
            className="btn-icon disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {child.firstName} • {child.currentAge} months old
            </p>
          </div>
          
          <div className="w-12"></div> {/* Spacer for alignment */}
        </div>
      </div>

      {/* Progress Indicators */}
      <div className="flex justify-center space-x-2 mt-6">
        {Array.from({ length: totalQuestions }).map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index < currentQuestion ? 'bg-success' :
              index === currentQuestion ? 'bg-primary' :
              'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}