"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 transition-all duration-300 hover:shadow-2xl">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-block p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl mb-4 transition-all duration-300 hover:shadow-lg hover:scale-105">
            <img 
              src="/src/assets/logo.png" 
              alt="Brain Logo" 
              className="w-16 h-16 object-cover rounded-xl transition-all duration-300"
            />
          </div>
        </div>

        {/* Header with smooth transition */}
        <div className="text-center mb-8">
          <div className="relative overflow-hidden h-8">
            <h2 
              className={`text-2xl font-bold text-gray-900 absolute inset-0 transition-all duration-500 ease-in-out transform ${
                flow === "signIn" 
                  ? "translate-y-0 opacity-100" 
                  : "-translate-y-full opacity-0"
              }`}
            >
              Welcome back
            </h2>
            <h2 
              className={`text-2xl font-bold text-gray-900 absolute inset-0 transition-all duration-500 ease-in-out transform ${
                flow === "signUp" 
                  ? "translate-y-0 opacity-100" 
                  : "translate-y-full opacity-0"
              }`}
            >
              Create account
            </h2>
          </div>
          <p className="text-gray-600 mt-2 transition-all duration-300">
            {flow === "signIn" 
              ? "Sign in to your account to continue" 
              : "Join us and start your journey"
            }
          </p>
        </div>

        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitting(true);
            const formData = new FormData(e.target as HTMLFormElement);
            formData.set("flow", flow);
            void signIn("password", formData).catch((error) => {
              let toastTitle = "";
              if (error.message.includes("Invalid password")) {
                toastTitle = "Invalid password. Please try again.";
              } else {
                toastTitle =
                  flow === "signIn"
                    ? "Could not sign in, did you mean to sign up?"
                    : "Could not sign up, did you mean to sign in?";
              }
              toast.error(toastTitle);
              setSubmitting(false);
            });
          }}
        >
          {/* Email Input with floating label effect */}
          <div className="relative group">
            <input
              className="auth-input-field w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 peer"
              type="email"
              name="email"
              placeholder="Email"
              id="email"
              required
            />
            <label 
              htmlFor="email"
              className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-gray-600 transition-all duration-300 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-primary peer-focus:bg-white"
            >
              Email
            </label>
          </div>

          {/* Password Input with floating label effect */}
          <div className="relative group">
            <input
              className="auth-input-field w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 peer"
              type="password"
              name="password"
              placeholder="Password"
              id="password"
              required
            />
            <label 
              htmlFor="password"
              className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-gray-600 transition-all duration-300 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-primary peer-focus:bg-white"
            >
              Password
            </label>
          </div>

          {/* Submit Button with loading animation */}
          <button 
            className="auth-button w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden"
            type="submit" 
            disabled={submitting}
          >
            <span className={`transition-opacity duration-300 ${submitting ? 'opacity-0' : 'opacity-100'}`}>
              {flow === "signIn" ? "Sign in" : "Sign up"}
            </span>
            {submitting && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </button>

          {/* Toggle Flow Section */}
          <div className="text-center">
            <span className="text-sm text-gray-600">
              {flow === "signIn"
                ? "Don't have an account? "
                : "Already have an account? "}
            </span>
            <button
              type="button"
              className="text-primary hover:text-primary-hover font-medium cursor-pointer transition-all duration-300 hover:underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded px-1"
              onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
            >
              <span className="relative">
                {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
              </span>
            </button>
          </div>
        </form>

        {/* Divider with improved styling */}
        <div className="flex items-center justify-center my-8">
          <hr className="flex-1 border-gray-200" />
          
          <hr className="flex-1 border-gray-200" />
        </div>

        {/* Additional sign-in options placeholder */}
        <div className="space-y-3">
          {/* You can add social login buttons here */}
        </div>
      </div>
    </div>
  );
}