import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

interface DashboardProps {
  selectedChildId: string | null;
  onNavigate: (view: 'dashboard' | 'mchat' | 'progress' | 'ai-assistant' | 'children') => void;
}

export function Dashboard({ selectedChildId, onNavigate }: DashboardProps) {
  const child = useQuery(api.children.getChild, selectedChildId ? { childId: selectedChildId as any } : "skip");
  const progressStats = useQuery(api.progress.getProgressStats, selectedChildId ? { childId: selectedChildId as any } : "skip");
  const mchatHistory = useQuery(api.mchat.getMChatHistory, selectedChildId ? { childId: selectedChildId as any } : "skip");
  const children = useQuery(api.children.getMyChildren);

  if (!selectedChildId || !child) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-dark mb-2">No Child Selected</h2>
        <p className="text-gray-600 mb-6">Please select a child from the sidebar or add a new child to get started.</p>
        <button
          onClick={() => onNavigate('children')}
          className="btn-primary"
        >
          Manage Children
        </button>
      </div>
    );
  }

  const latestMChat = mchatHistory?.[0];
  const totalChildren = children?.length || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Overview for {child.firstName} {child.lastName}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => onNavigate('mchat')}
            className="btn-primary"
          >
            Start M-CHAT Assessment
          </button>
          <button
            onClick={() => onNavigate('ai-assistant')}
            className="btn-secondary"
          >
            Ask AI Assistant
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Child Age"
          value={`${child.currentAge} months`}
          icon="👶"
          color="bg-primary"
        />
        <StatCard
          title="Total Children"
          value={totalChildren.toString()}
          icon="👨‍👩‍👧‍👦"
          color="bg-secondary"
        />
        <StatCard
          title="Latest M-CHAT"
          value={latestMChat ? `${latestMChat.riskLevel} risk` : 'Not taken'}
          icon="📝"
          color={latestMChat ? getRiskColor(latestMChat.riskLevel) : 'bg-gray-400'}
        />
        <StatCard
          title="Overall Progress"
          value={progressStats ? `${progressStats.overall.percentage}%` : '0%'}
          icon="📈"
          color="bg-accent"
        />
      </div>

      {/* Progress Overview */}
      {progressStats && (
        <div className="card">
          <h2 className="text-xl font-semibold text-dark mb-6">Progress Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ProgressCategory
              title="Behavioral"
              stats={progressStats.behavioral}
              color="text-primary"
            />
            <ProgressCategory
              title="Communication"
              stats={progressStats.communication}
              color="text-secondary"
            />
            <ProgressCategory
              title="Social"
              stats={progressStats.social}
              color="text-accent"
            />
          </div>
        </div>
      )}

      {/* Recent M-CHAT Results */}
      {mchatHistory && mchatHistory.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-dark">Recent M-CHAT Assessments</h2>
            <button
              onClick={() => onNavigate('mchat')}
              className="text-primary hover:text-primary-hover font-medium"
            >
              View All →
            </button>
          </div>
          <div className="space-y-4">
            {mchatHistory.slice(0, 3).map((result) => (
              <div
                key={result._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
              >
                <div>
                  <p className="font-medium text-dark">
                    Assessment completed
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(result.completedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    result.riskLevel === 'high' ? 'bg-error/10 text-error' :
                    result.riskLevel === 'medium' ? 'bg-warning/10 text-warning' :
                    'bg-success/10 text-success'
                  }`}>
                    {result.riskLevel} risk
                  </span>
                  <p className="text-sm text-gray-600 mt-1">
                    Score: {result.totalScore}/20
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold text-dark mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickActionCard
            title="M-CHAT Assessment"
            description="Complete autism screening questionnaire"
            icon="📝"
            onClick={() => onNavigate('mchat')}
            color="bg-primary"
          />
          <QuickActionCard
            title="Track Progress"
            description="Log developmental milestones"
            icon="📈"
            onClick={() => onNavigate('progress')}
            color="bg-secondary"
          />
          <QuickActionCard
            title="AI Assistant"
            description="Get personalized guidance"
            icon="🤖"
            onClick={() => onNavigate('ai-assistant')}
            color="bg-accent"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: {
  title: string;
  value: string;
  icon: string;
  color: string;
}) {
  return (
    <div className="card-compact">
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white text-xl`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-dark">{value}</p>
        </div>
      </div>
    </div>
  );
}

function ProgressCategory({ title, stats, color }: {
  title: string;
  stats: { total: number; achieved: number; percentage: number };
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className={`font-semibold ${color}`}>{title}</h3>
        <span className="text-sm text-gray-600">
          {stats.achieved}/{stats.total}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full progress-bar ${
            color === 'text-primary' ? 'bg-primary' :
            color === 'text-secondary' ? 'bg-secondary' :
            'bg-accent'
          }`}
          style={{ width: `${stats.percentage}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-600 mt-1">{stats.percentage}% complete</p>
    </div>
  );
}

function QuickActionCard({ title, description, icon, onClick, color }: {
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-md"
    >
      <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center text-white text-lg mb-3`}>
        {icon}
      </div>
      <h3 className="font-semibold text-dark mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </button>
  );
}

function getRiskColor(riskLevel: string) {
  switch (riskLevel) {
    case 'high': return 'bg-error';
    case 'medium': return 'bg-warning';
    case 'low': return 'bg-success';
    default: return 'bg-gray-400';
  }
}
