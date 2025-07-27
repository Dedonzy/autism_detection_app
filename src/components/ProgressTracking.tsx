import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface ProgressTrackingProps {
  childId: string;
  onNavigate: (view: 'dashboard' | 'children' | 'mchat' | 'progress' | 'ai-assistant') => void;
}

type Category = "behavioral" | "communication" | "social";

export function ProgressTracking({ childId, onNavigate }: ProgressTrackingProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    category: "behavioral" as Category,
    milestone: "",
    achieved: false,
    notes: "",
    severity: undefined as "mild" | "moderate" | "severe" | undefined,
  });

  const child = useQuery(api.children.getChild, { childId: childId as any });
  const children = useQuery(api.children.getMyChildren);
  const progressStats = useQuery(api.progress.getProgressStats, { childId: childId as any });
  const progressEntries = useQuery(api.progress.getProgressEntries, {
    childId: childId as any,
    category: selectedCategory === "all" ? undefined : selectedCategory,
  });

  const addProgressEntry = useMutation(api.progress.addProgressEntry);
  const updateProgressEntry = useMutation(api.progress.updateProgressEntry);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.milestone.trim()) {
      toast.error("Please enter a milestone description");
      return;
    }

    try {
      await addProgressEntry({
        childId: childId as any,
        category: formData.category,
        milestone: formData.milestone,
        achieved: formData.achieved,
        notes: formData.notes || undefined,
        severity: formData.severity,
      });
      
      toast.success("Progress entry added successfully!");
      setShowAddForm(false);
      setFormData({
        category: "behavioral",
        milestone: "",
        achieved: false,
        notes: "",
        severity: undefined,
      });
    } catch (error) {
      toast.error("Failed to add progress entry");
      console.error(error);
    }
  };

  const handleAddChildProfile = () => {
    try {
      onNavigate('dashboard');
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback - you might want to use a different approach here
      // For example, if your parent component expects a different value:
      // onNavigate('children'); // or whatever the fallback should be
    }
  };

  const toggleAchievement = async (entryId: string, currentStatus: boolean) => {
    try {
      await updateProgressEntry({
        entryId: entryId as any,
        achieved: !currentStatus,
      });
      toast.success(currentStatus ? "Milestone unmarked" : "Milestone achieved! 🎉");
    } catch (error) {
      toast.error("Failed to update progress");
      console.error(error);
    }
  };

  // Combined loading state for children and child
  if (children === undefined || child === undefined) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary border-t-transparent"></div>
            <div>
              <h2 className="text-lg font-semibold text-dark mb-2">Loading Progress Tracking</h2>
              <p className="text-gray-600">Preparing child profile and progress data...</p>
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
            You need to add a child profile before you can start tracking developmental progress. 
            Progress tracking helps monitor milestones across behavioral, communication, and social development.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">About Progress Tracking</h3>
            <p className="text-sm text-blue-800">
              Track your child's developmental milestones in key areas: behavioral patterns, 
              communication skills, and social interactions. This helps identify progress 
              and areas that may need additional support.
            </p>
          </div>
          <button
            onClick={() => handleAddChildProfile()}
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
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-children'))}
              className="btn-secondary flex-1"
            >
              Manage Children
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-dashboard'))}
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
  if (!child) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary border-t-transparent"></div>
            <div>
              <h2 className="text-lg font-semibold text-dark mb-2">Loading Progress Tracking</h2>
              <p className="text-gray-600">Preparing child profile and progress data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const categories = [
    { id: "all", label: "All Categories", icon: "📊", color: "bg-gray-500" },
    { id: "behavioral", label: "Behavioral", icon: "🎭", color: "bg-primary" },
    { id: "communication", label: "Communication", icon: "💬", color: "bg-secondary" },
    { id: "social", label: "Social", icon: "👥", color: "bg-accent" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-dark">Progress Tracking</h1>
          <p className="text-gray-600 mt-1">
            Developmental milestones for {child.firstName} {child.lastName}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary w-full sm:w-auto"
        >
          <span className="mr-2">+</span>
          Add Milestone
        </button>
      </div>

      {/* Progress Overview */}
      {progressStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <ProgressCard
            title="Overall Progress"
            stats={progressStats.overall}
            color="bg-gray-500"
            icon="🎯"
          />
          <ProgressCard
            title="Behavioral"
            stats={progressStats.behavioral}
            color="bg-primary"
            icon="🎭"
          />
          <ProgressCard
            title="Communication"
            stats={progressStats.communication}
            color="bg-secondary"
            icon="💬"
          />
          <ProgressCard
            title="Social"
            stats={progressStats.social}
            color="bg-accent"
            icon="👥"
          />
        </div>
      )}

      {/* Category Filter */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id as Category | "all")}
            className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl font-medium transition-all duration-300 whitespace-nowrap text-sm sm:text-base ${
              selectedCategory === category.id
                ? `${category.color} text-white shadow-md`
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>{category.icon}</span>
            <span>{category.label}</span>
          </button>
        ))}
      </div>

      {/* Progress Entries */}
      <div className="card">
        <h2 className="text-lg sm:text-xl font-semibold text-dark mb-6">
          {selectedCategory === "all" ? "All Milestones" : 
           categories.find(c => c.id === selectedCategory)?.label + " Milestones"}
        </h2>
        
        {progressEntries && progressEntries.length > 0 ? (
          <div className="space-y-4">
            {progressEntries.map((entry, index) => (
              <div
                key={entry._id}
                className={`p-4 rounded-xl border transition-all duration-300 animate-slide-up ${
                  entry.achieved 
                    ? 'bg-success/5 border-success/20' 
                    : 'bg-gray-50 border-gray-200'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <button
                        onClick={() => toggleAchievement(entry._id, entry.achieved)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                          entry.achieved
                            ? 'bg-success border-success text-white animate-pulse-success'
                            : 'border-gray-300 hover:border-success'
                        }`}
                      >
                        {entry.achieved && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <div className="min-w-0 flex-1">
                        <h3 className={`font-semibold break-words ${entry.achieved ? 'text-success line-through' : 'text-dark'}`}>
                          {entry.milestone}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
                          <span className="capitalize">{entry.category.replace('_', ' ')}</span>
                          <span className="hidden sm:inline">•</span>
                          <span>{new Date(entry.dateRecorded).toLocaleDateString()}</span>
                          {entry.severity && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                entry.severity === 'severe' ? 'bg-error/10 text-error' :
                                entry.severity === 'moderate' ? 'bg-warning/10 text-warning' :
                                'bg-info/10 text-info'
                              }`}>
                                {entry.severity}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {entry.notes && (
                      <p className="text-sm text-gray-700 ml-9 break-words">{entry.notes}</p>
                    )}
                  </div>
                  {entry.achieved && (
                    <div className="text-2xl animate-bounce-in ml-2 flex-shrink-0">🎉</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📈</span>
            </div>
            <h3 className="text-lg font-semibold text-dark mb-2">No milestones yet</h3>
            <p className="text-gray-600 mb-4">Start tracking your child's developmental progress</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary"
            >
              Add First Milestone
            </button>
          </div>
        )}
      </div>

      {/* Add Milestone Modal - Responsive */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in">
            {/* Header */}
            <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-100 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-dark">Add New Milestone</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  type="button"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Form Content */}
            <div className="px-6 py-4">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                    className="select-field w-full"
                  >
                    <option value="behavioral">🎭 Behavioral</option>
                    <option value="communication">💬 Communication</option>
                    <option value="social">👥 Social</option>
                  </select>
                </div>

                {/* Milestone Description */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Milestone Description
                  </label>
                  <textarea
                    value={formData.milestone}
                    onChange={(e) => setFormData({ ...formData, milestone: e.target.value })}
                    className="input-field w-full resize-none"
                    placeholder="e.g., Makes eye contact when called by name"
                    rows={3}
                    required
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-3">
                    Status
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`flex items-center justify-center space-x-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      !formData.achieved 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="achieved"
                        checked={!formData.achieved}
                        onChange={() => setFormData({ ...formData, achieved: false })}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        !formData.achieved ? 'border-primary bg-primary' : 'border-gray-300'
                      }`}>
                        {!formData.achieved && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <span className="font-medium">Working on it</span>
                    </label>
                    <label className={`flex items-center justify-center space-x-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.achieved 
                        ? 'border-success bg-success/5 text-success' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="achieved"
                        checked={formData.achieved}
                        onChange={() => setFormData({ ...formData, achieved: true })}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        formData.achieved ? 'border-success bg-success' : 'border-gray-300'
                      }`}>
                        {formData.achieved && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <span className="font-medium">Achieved</span>
                    </label>
                  </div>
                </div>

                {/* Severity */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Severity (if applicable)
                  </label>
                  <select
                    value={formData.severity || ""}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as any || undefined })}
                    className="select-field w-full"
                  >
                    <option value="">Not applicable</option>
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="textarea-field w-full resize-none"
                    rows={3}
                    placeholder="Additional observations or context..."
                  />
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white rounded-b-2xl border-t border-gray-100 px-6 py-4">
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn-secondary flex-1 order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="btn-primary flex-1 order-1 sm:order-2"
                >
                  Add Milestone
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProgressCard({ title, stats, color, icon }: {
  title: string;
  stats: { total: number; achieved: number; percentage: number };
  color: string;
  icon: string;
}) {
  return (
    <div className="card-compact">
      <div className="flex items-center space-x-3 sm:space-x-4 mb-4">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${color} rounded-xl flex items-center justify-center text-white text-lg sm:text-xl flex-shrink-0`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-dark text-sm sm:text-base truncate">{title}</h3>
          <p className="text-xs sm:text-sm text-gray-600">{stats.achieved}/{stats.total} completed</p>
        </div>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 mb-2">
        <div
          className={`h-2 sm:h-3 rounded-full progress-bar ${color.replace('bg-', 'bg-')} transition-all duration-500`}
          style={{ width: `${stats.percentage}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-xl sm:text-2xl font-bold text-dark">{stats.percentage}%</span>
        <span className="text-xs sm:text-sm text-gray-600">complete</span>
      </div>
    </div>
  );
}