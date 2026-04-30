"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          setError({
            message: data.error || "Please verify your email address.",
            isVerificationError: true
          });
        } else {
          setError({ message: data.error || "Login failed" });
        }
        return;
      }

      localStorage.setItem("userData", JSON.stringify(data.user));
      router.push("/");
    } catch (err) {
      setError({ message: "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await response.json();
      if (response.ok) {
        setError({ message: "Verification email resent! Check your inbox.", isSuccess: true });
      } else {
        setError({ message: data.error || "Failed to resend email." });
      }
    } catch (err) {
      setError({ message: "Network error." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2">Welcome Back</h1>
        <p className="text-center text-gray-600 mb-8">
          Sign in to your ShopHub account
        </p>

        {error && (
          <div className={`mb-4 p-4 rounded-lg flex flex-col gap-2 ${
            error.isSuccess ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"
          }`}>
            <p className="text-sm font-medium">{error.message}</p>
            {error.isVerificationError && (
              <button
                onClick={handleResend}
                className="text-xs font-bold underline text-left hover:text-red-800"
              >
                Resend Verification Email
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Link href="#" className="text-sm text-blue-600 font-medium hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
          >
            {isLoading ? "Please wait..." : "Sign In"}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-blue-600 font-semibold hover:underline"
          >
            Create One
          </Link>
        </p>
      </div>
    </div>
  );
}
