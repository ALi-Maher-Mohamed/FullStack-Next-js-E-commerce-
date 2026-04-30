"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowLeft, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [isResending, setIsResending] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleResend = async () => {
    if (!email) {
      setStatus({ type: "error", message: "Email address not found." });
      return;
    }

    setIsResending(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({
          type: "success",
          message: "Verification email sent successfully! Please check your inbox.",
        });
      } else {
        setStatus({
          type: "error",
          message: data.error || "Failed to resend verification email.",
        });
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: "A network error occurred. Please try again later.",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
          <Mail className="text-blue-600" size={32} />
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Verify Your Email</h1>
        <p className="text-gray-600 mb-6 leading-relaxed">
          We've sent a verification link to <br />
          <span className="font-semibold text-gray-900">{email || "your email address"}</span>
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-8 text-sm text-gray-600 text-left">
          <p className="mb-2 font-semibold text-gray-700">Didn't receive the email?</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Check your spam or junk folder</li>
            <li>Make sure the email address is correct</li>
            <li>Wait a few minutes before resending</li>
          </ul>
        </div>

        {status.message && (
          <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 text-left ${
            status.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
          }`}>
            {status.type === "success" ? <CheckCircle size={20} className="shrink-0" /> : <AlertCircle size={20} className="shrink-0" />}
            <p className="text-sm font-medium">{status.message}</p>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleResend}
            disabled={isResending || !email}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
          >
            {isResending ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Resending...
              </>
            ) : (
              "Resend Verification Email"
            )}
          </button>

          <Link
            href="/login"
            className="w-full py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="animate-spin text-blue-600" size={32} />
      </div>
    }>
      <CheckEmailContent />
    </Suspense>
  );
}
