"use client";

import type React from "react";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      // Register user
      const registerResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        throw new Error(registerData.error || "Registration failed");
      }

      // Auto sign in after successful registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(
          "Registration successful, but automatic sign in failed. Please sign in manually."
        );
        setTimeout(() => {
          router.push("/auth/signin");
        }, 2000);
      } else {
        router.push("/");
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "An error occurred. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    try {
      const result = await signIn("google", {
        callbackUrl: "/",
        redirect: false,
      });

      if (result?.error) {
        setError("Google sign up failed. Please try again.");
      } else if (result?.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error("Google sign up error:", error);
      setError("Google sign up failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with ChatGPT logo */}
      <div className="absolute top-6 left-6">
        <h1 className="text-xl font-medium text-black">ChatGPT</h1>
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-sm">
          {/* Welcome Message */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-normal text-black mb-2">
              Create your account
            </h2>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-base placeholder-gray-400 bg-white"
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-base placeholder-gray-400 bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-4 bg-black text-white rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base"
            >
              {loading ? "Creating account..." : "Continue"}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="text-center mb-8">
            <span className="text-gray-600">Already have an account? </span>
            <Link
              href="/auth/signin"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign in
            </Link>
          </div>

          {/* Divider */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-50 text-gray-500 font-medium">
                OR
              </span>
            </div>
          </div>

          {/* Google Sign Up */}
          <div className="mb-12">
            <button
              onClick={handleGoogleSignUp}
              type="button"
              className="w-full flex items-center justify-center px-4 py-4 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors bg-white"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-gray-700 font-medium">
                Continue with Google
              </span>
            </button>
          </div>

          {/* Footer */}
          <div className="text-center">
            <div className="text-sm text-gray-500 space-x-4">
              <a href="#" className="hover:text-gray-700 underline">
                Terms of Use
              </a>
              <span>|</span>
              <a href="#" className="hover:text-gray-700 underline">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
