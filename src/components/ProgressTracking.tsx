import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface ProgressTrackingProps {
  childId: string;
}

type Category = "behavioral" | "communication" | "social";

export function ProgressTracking({ childId }: ProgressTrackingProps) {
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

  if (!child) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark">Progress Tracking</h1>
          <p className="text-gray-600 mt-1">
            Developmental milestones for {child.firstName} {child.lastName}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary"
        >
          <span className="mr-2">+</span>
          Add Milestone
        </button>
      </div>

      {/* Progress Overview */}
      {progressStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id as Category | "all")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${
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
        <h2 className="text-xl font-semibold text-dark mb-6">
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
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
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
                      <div>
                        <h3 className={`font-semibold ${entry.achieved ? 'text-success line-through' : 'text-dark'}`}>
                          {entry.milestone}
                        </h3>
                        <div className="flex items-center space-x-3 text-sm text-gray-600">
                          <span className="capitalize">{entry.category.replace('_', ' ')}</span>
                          <span>•</span>
                          <span>{new Date(entry.dateRecorded).toLocaleDateString()}</span>
                          {entry.severity && (
                            <>
                              <span>•</span>
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
                      <p className="text-sm text-gray-700 ml-9">{entry.notes}</p>
                    )}
                  </div>
                  {entry.achieved && (
                    <div className="text-2xl animate-bounce-in">🎉</div>
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

      {/* Add Milestone Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-scale-in">
            <h2 className="text-xl font-semibold text-dark mb-6">Add New Milestone</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                  className="select-field"
                >
                  <option value="behavioral">Behavioral</option>
                  <option value="communication">Communication</option>
                  <option value="social">Social</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Milestone Description
                </label>
                <input
                  type="text"
                  value={formData.milestone}
                  onChange={(e) => setFormData({ ...formData, milestone: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Makes eye contact when called by name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Status
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="achieved"
                      checked={!formData.achieved}
                      onChange={() => setFormData({ ...formData, achieved: false })}
                      className="text-primary"
                    />
                    <span>Working on it</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="achieved"
                      checked={formData.achieved}
                      onChange={() => setFormData({ ...formData, achieved: true })}
                      className="text-success"
                    />
                    <span>Achieved</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Severity (if applicable)
                </label>
                <select
                  value={formData.severity || ""}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value as any || undefined })}
                  className="select-field"
                >
                  <option value="">Not applicable</option>
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="textarea-field"
                  rows={3}
                  placeholder="Additional observations or context..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  Add Milestone
                </button>
              </div>
            </form>
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
      <div className="flex items-center space-x-4 mb-4">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white text-xl`}>
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-dark">{title}</h3>
          <p className="text-sm text-gray-600">{stats.achieved}/{stats.total} completed</p>
        </div>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
        <div
          className={`h-3 rounded-full progress-bar ${color.replace('bg-', 'bg-')}`}
          style={{ width: `${stats.percentage}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-2xl font-bold text-dark">{stats.percentage}%</span>
        <span className="text-sm text-gray-600">complete</span>
      </div>
    </div>
  );
}
