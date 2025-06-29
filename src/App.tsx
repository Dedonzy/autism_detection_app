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
    <div className="min-h-screen flex flex-col bg-light">
      <Authenticated>
        <AppContent 
          currentView={currentView}
          setCurrentView={setCurrentView}
          selectedChildId={selectedChildId}
          setSelectedChildId={setSelectedChildId}
        />
      </Authenticated>
      
      <Unauthenticated>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8 animate-fade-in">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-dark mb-2">AutismCare</h1>
              <p className="text-gray-600">Professional autism detection and support platform</p>
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
            fontFamily: 'Nunito Sans',
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

  // Show profile setup if no profile exists
  if (profile === undefined) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
              <MChatQuestionnaire childId={selectedChildId} />
            )}
            {currentView === 'progress' && selectedChildId && (
              <ProgressTracking childId={selectedChildId} />
            )}
            {currentView === 'ai-assistant' && (
              <AIAssistant selectedChildId={selectedChildId} />
            )}
            {currentView === 'children' && (
              <ChildManagement />
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
    <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-dark">AutismCare</h1>
            <p className="text-sm text-gray-500">Professional Platform</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium text-dark">
              {profile.firstName} {profile.lastName}
            </p>
            <p className="text-xs text-gray-500 capitalize">{profile.role}</p>
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
    <aside className="w-80 bg-white border-r border-gray-200 p-6">
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id as View)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-300 ${
              currentView === item.id
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {children.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Children
          </h3>
          <div className="space-y-2">
            {children.map((child) => (
              <button
                key={child._id}
                onClick={() => setSelectedChildId(child._id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                  selectedChildId === child._id
                    ? 'bg-accent/10 border border-accent text-accent'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-accent to-secondary rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {child.firstName.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{child.firstName} {child.lastName}</p>
                  <p className="text-xs text-gray-500">{child.currentAge} months old</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
