import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function ChildManagement() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingChild, setEditingChild] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "male" as "male" | "female" | "other",
    medicalHistory: "",
  });

  const children = useQuery(api.children.getMyChildren);
  const addChild = useMutation(api.children.addChild);
  const updateChild = useMutation(api.children.updateChild);

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "male",
      medicalHistory: "",
    });
    setEditingChild(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.dateOfBirth) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate age (must be between 0-10 years)
    const birthDate = new Date(formData.dateOfBirth);
    const now = new Date();
    const ageInYears = (now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    
    if (ageInYears < 0 || ageInYears > 10) {
      toast.error("Child must be between 0-10 years old for M-CHAT assessment");
      return;
    }

    try {
      if (editingChild) {
        await updateChild({
          childId: editingChild._id,
          firstName: formData.firstName,
          lastName: formData.lastName,
          medicalHistory: formData.medicalHistory || undefined,
        });
        toast.success("Child profile updated successfully!");
      } else {
        await addChild({
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          medicalHistory: formData.medicalHistory || undefined,
        });
        toast.success("Child added successfully!");
      }
      resetForm();
    } catch (error) {
      toast.error(editingChild ? "Failed to update child" : "Failed to add child");
      console.error(error);
    }
  };

  const startEdit = (child: any) => {
    setEditingChild(child);
    setFormData({
      firstName: child.firstName,
      lastName: child.lastName,
      dateOfBirth: child.dateOfBirth,
      gender: child.gender,
      medicalHistory: child.medicalHistory || "",
    });
    setShowAddForm(true);
  };

  const calculateAge = (dateOfBirth: string) => {
    const birth = new Date(dateOfBirth);
    const now = new Date();
    const ageInMonths = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
    const years = Math.floor(ageInMonths / 12);
    const months = ageInMonths % 12;
    
    if (years > 0) {
      return `${years}y ${months}m`;
    }
    return `${months} months`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark">Manage Children</h1>
          <p className="text-gray-600 mt-1">
            Add and manage child profiles for assessments and tracking
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary"
        >
          <span className="mr-2">+</span>
          Add Child
        </button>
      </div>

      {/* Children Grid */}
      {children && children.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child, index) => (
            <div
              key={child._id}
              className="card card-hover animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent to-secondary rounded-full flex items-center justify-center text-white text-lg font-bold">
                    {child.firstName.charAt(0)}{child.lastName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark">
                      {child.firstName} {child.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {calculateAge(child.dateOfBirth)} • {child.gender}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => startEdit(child)}
                  className="btn-icon text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Date of Birth</span>
                  <span className="font-medium text-dark">
                    {new Date(child.dateOfBirth).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Current Age</span>
                  <span className="font-medium text-dark">
                    {child.currentAge} months
                  </span>
                </div>

                {child.medicalHistory && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-600 mb-1">Medical History</p>
                    <p className="text-sm text-dark line-clamp-3">
                      {child.medicalHistory}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-100">
                <button className="btn-primary flex-1 text-sm py-2">
                  View Progress
                </button>
                <button className="btn-secondary flex-1 text-sm py-2">
                  M-CHAT
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-dark mb-3">No children added yet</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Add your first child to start using M-CHAT assessments, progress tracking, and AI assistance.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            <span className="mr-2">+</span>
            Add Your First Child
          </button>
        </div>
      )}

      {/* Add/Edit Child Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-scale-in">
            <h2 className="text-xl font-semibold text-dark mb-6">
              {editingChild ? "Edit Child Profile" : "Add New Child"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="input-field"
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="input-field"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="input-field"
                  required
                  disabled={!!editingChild} // Can't change birth date when editing
                />
                {!editingChild && (
                  <p className="text-xs text-gray-500 mt-1">
                    M-CHAT is designed for children 16-30 months old
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Gender *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="select-field"
                  disabled={!!editingChild} // Can't change gender when editing
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Medical History (optional)
                </label>
                <textarea
                  value={formData.medicalHistory}
                  onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                  className="textarea-field"
                  rows={3}
                  placeholder="Any relevant medical history, diagnoses, or concerns..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  {editingChild ? "Update Child" : "Add Child"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
