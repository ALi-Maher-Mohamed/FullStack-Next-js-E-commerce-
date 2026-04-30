"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Phone, ShoppingBag, Store, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "customer", // Default role
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

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role, // Send role to API
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Registration failed");
      }

      // Clear form on success
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        role: "customer",
      });

      router.push(`/check-email?email=${encodeURIComponent(formData.email)}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/20 backdrop-blur-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-500">Join ShopHub and start your journey</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 animate-in fade-in duration-300">
            <XCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, role: "customer" }))}
              className={`relative p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                formData.role === "customer" 
                  ? "border-blue-600 bg-blue-50/50 shadow-md ring-1 ring-blue-600" 
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              {formData.role === "customer" && (
                <CheckCircle size={16} className="absolute top-2 right-2 text-blue-600" />
              )}
              <ShoppingBag size={24} className={formData.role === "customer" ? "text-blue-600" : "text-gray-400"} />
              <div className="mt-2 font-bold text-sm">Customer</div>
              <div className="text-[10px] text-gray-400 font-medium leading-tight">Shop and track orders</div>
            </button>

            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, role: "seller" }))}
              className={`relative p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                formData.role === "seller" 
                  ? "border-blue-600 bg-blue-50/50 shadow-md ring-1 ring-blue-600" 
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              {formData.role === "seller" && (
                <CheckCircle size={16} className="absolute top-2 right-2 text-blue-600" />
              )}
              <Store size={24} className={formData.role === "seller" ? "text-blue-600" : "text-gray-400"} />
              <div className="mt-2 font-bold text-sm">Seller</div>
              <div className="text-[10px] text-gray-400 font-medium leading-tight">List products & earn</div>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 ml-1">First Name</label>
              <div className="relative group">
                <User size={18} className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                  placeholder="John"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 ml-1">Last Name</label>
              <div className="relative group">
                <User size={18} className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                  placeholder="Doe"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 ml-1">Email Address</label>
            <div className="relative group">
              <Mail size={18} className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 ml-1">Phone Number</label>
            <div className="relative group">
              <Phone size={18} className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 ml-1">Password</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 ml-1">Confirm</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98]"
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
