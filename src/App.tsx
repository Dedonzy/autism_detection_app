import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useState, useEffect } from "react";
import { Dashboard } from "./components/Dashboard";
import { ProfileSetup } from "./components/ProfileSetup";
import { MChatQuestionnaire } from "./components/MChatQuestionnaire";
import { ProgressTracking } from "./components/ProgressTracking";
import { AIAssistant } from "./components/AIAssistant";
import { ChildManagement } from "./components/ChildManagement";

type View = 'dashboard' | 'mchat' | 'progress' | 'ai-assistant' | 'children';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-light font-['Inter',_system-ui,_sans-serif]">
      <Authenticated>
        <AppContent 
          currentView={currentView}
          setCurrentView={setCurrentView}
          selectedChildId={selectedChildId}
          setSelectedChildId={setSelectedChildId}
        />
      </Authenticated>
      
      <Unauthenticated>
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <div className="w-full max-w-md">
            <div className="text-center mb-8 animate-fade-in">
              {/* Brand Name */}
              <div className="mb-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent mb-2 font-['Poppins',_'Inter',_sans-serif] tracking-tight">
                  AutismCare
                </h1>
                <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full mb-3"></div>
                <p className="text-gray-600 text-lg font-medium font-['Inter',_sans-serif]">
                  Professional Detection & Support Platform
                </p>
                <p className="text-gray-500 text-sm mt-2 font-['Inter',_sans-serif]">
                  Evidence-based assessments with AI-powered insights
                </p>
              </div>
            </div>
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>
      
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'white',
            color: '#1A1D23',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Inter, system-ui, sans-serif',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
        }}
      />
    </div>
  );
}

function AppContent({ 
  currentView, 
  setCurrentView, 
  selectedChildId, 
  setSelectedChildId 
}: {
  currentView: View;
  setCurrentView: (view: View) => void;
  selectedChildId: string | null;
  setSelectedChildId: (id: string | null) => void;
}) {
  const profile = useQuery(api.profiles.getCurrentProfile);
  const children = useQuery(api.children.getMyChildren);

  // Auto-select first child if none selected - MUST be before any conditional returns
  useEffect(() => {
    if (children && children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0]._id);
    }
  }, [children, selectedChildId, setSelectedChildId]);

  // Navigation handler for ChildManagement
  const handleChildManagementNavigation = (view: 'mchat' | 'progress', childId: string) => {
    setSelectedChildId(childId);
    setCurrentView(view);
  };

  // Show profile setup if no profile exists
  if (profile === undefined) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary border-t-transparent"></div>
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (profile === null) {
    return <ProfileSetup />;
  }

  return (
    <>
      <Header currentView={currentView} setCurrentView={setCurrentView} profile={profile} />
      <main className="flex-1 flex">
        <Sidebar 
          currentView={currentView} 
          setCurrentView={setCurrentView}
          children={children || []}
          selectedChildId={selectedChildId}
          setSelectedChildId={setSelectedChildId}
        />
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {currentView === 'dashboard' && (
              <Dashboard 
                selectedChildId={selectedChildId}
                onNavigate={setCurrentView}
              />
            )}
            {currentView === 'mchat' && selectedChildId && (
              <MChatQuestionnaire childId={selectedChildId} onNavigate={setCurrentView} />
            )}
            {currentView === 'progress' && selectedChildId && (
              <ProgressTracking childId={selectedChildId} onNavigate={setCurrentView} />
            )}
            {currentView === 'ai-assistant' && (
              <AIAssistant selectedChildId={selectedChildId} />
            )}
            {currentView === 'children' && (
              <ChildManagement onNavigate={handleChildManagementNavigation} />
            )}
          </div>
        </div>
      </main>
    </>
  );
}

function Header({ currentView, setCurrentView, profile }: {
  currentView: View;
  setCurrentView: (view: View) => void;
  profile: any;
}) {
  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 px-6 py-4 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Header Logo */}
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-['Poppins',_'Inter',_sans-serif]">
                AutismCare
              </h1>
              <p className="text-xs text-gray-500 font-medium font-['Inter',_sans-serif]">
                Professional Platform
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-dark font-['Inter',_sans-serif]">
              {profile.firstName} {profile.lastName}
            </p>
            <p className="text-xs text-gray-500 capitalize font-medium font-['Inter',_sans-serif]">
              {profile.role}
            </p>
          </div>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}

function Sidebar({ 
  currentView, 
  setCurrentView, 
  children, 
  selectedChildId, 
  setSelectedChildId 
}: {
  currentView: View;
  setCurrentView: (view: View) => void;
  children: any[];
  selectedChildId: string | null;
  setSelectedChildId: (id: string | null) => void;
}) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'mchat', label: 'M-CHAT Assessment', icon: '📝' },
    { id: 'progress', label: 'Progress Tracking', icon: '📈' },
    { id: 'ai-assistant', label: 'AI Assistant', icon: '🤖' },
    { id: 'children', label: 'Manage Children', icon: '👶' },
  ];

  return (
    <aside className="w-80 bg-white/95 backdrop-blur-sm border-r border-gray-200 p-6 shadow-sm">
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id as View)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-300 font-['Inter',_sans-serif] ${
              currentView === item.id
                ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg transform scale-105'
                : 'text-gray-700 hover:bg-gray-50 hover:shadow-md'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-semibold">{item.label}</span>
          </button>
        ))}
      </nav>

      {children.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4 font-['Inter',_sans-serif]">
            Children
          </h3>
          <div className="space-y-3">
            {children.map((child) => (
              <button
                key={child._id}
                onClick={() => setSelectedChildId(child._id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-300 font-['Inter',_sans-serif] ${
                  selectedChildId === child._id
                    ? 'bg-gradient-to-r from-accent/10 to-secondary/10 border border-accent text-accent shadow-md transform scale-105'
                    : 'text-gray-700 hover:bg-gray-50 hover:shadow-md'
                }`}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-accent to-secondary rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                  {child.firstName.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold">{child.firstName} {child.lastName}</p>
                  <p className="text-xs text-gray-500 font-medium">{child.currentAge} months old</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}