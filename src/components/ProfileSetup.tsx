import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function ProfileSetup() {
  const [formData, setFormData] = useState({
    role: '' as 'parent' | 'doctor' | 'researcher' | '',
    firstName: '',
    lastName: '',
    organization: '',
    licenseNumber: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createProfile = useMutation(api.profiles.createProfile);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.role || !formData.firstName || !formData.lastName) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await createProfile({
        role: formData.role as 'parent' | 'doctor' | 'researcher',
        firstName: formData.firstName,
        lastName: formData.lastName,
        organization: formData.organization || undefined,
        licenseNumber: formData.licenseNumber || undefined,
      });
      toast.success("Profile created successfully!");
    } catch (error) {
      toast.error("Failed to create profile. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-dark mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">Help us personalize your experience</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-6">
          <div>
            <label className="block text-sm font-semibold text-dark mb-2">
              I am a... *
            </label>
            <div className="grid grid-cols-1 gap-3">
              {[
                { value: 'parent', label: 'Parent/Caregiver', icon: '👨‍👩‍👧‍👦' },
                { value: 'doctor', label: 'Healthcare Professional', icon: '👩‍⚕️' },
                { value: 'researcher', label: 'Researcher', icon: '🔬' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: option.value as any })}
                  className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all duration-300 ${
                    formData.role === option.value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl">{option.icon}</span>
                  <span className="font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

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

          {(formData.role === 'doctor' || formData.role === 'researcher') && (
            <>
              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Organization
                </label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="input-field"
                  placeholder="Hospital or Research Institution"
                />
              </div>

              {formData.role === 'doctor' && (
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    License Number
                  </label>
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    className="input-field"
                    placeholder="Medical License Number"
                  />
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !formData.role || !formData.firstName || !formData.lastName}
            className="btn-primary w-full"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creating Profile...</span>
              </div>
            ) : (
              'Complete Setup'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
