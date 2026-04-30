"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid or missing verification token.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(
            data.message || "Your email has been verified successfully!",
          );

          // Countdown and redirect
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                router.push("/login");
              }
              return prev - 1;
            });
          }, 1000);

          return () => clearInterval(timer);
        } else {
          setStatus("error");
          setMessage(
            data.error ||
              "We couldn't verify your email. The link might be expired or invalid.",
          );
        }
      } catch (error) {
        setStatus("error");
        setMessage("A network error occurred. Please try again.");
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl text-center">
        {status === "verifying" && (
          <div className="space-y-4">
            <Loader2 className="h-16 w-16 text-blue-600 animate-spin mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900">
              Verifying Email
            </h2>
            <p className="text-gray-600">
              Checking your credentials, please hold on a moment...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 shadow-inner">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-gray-900">
                Success! 🎉
              </h2>
              <p className="text-lg text-gray-600 font-medium">{message}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                Redirecting to login in{" "}
                <span className="font-bold text-lg">{countdown}</span>{" "}
                seconds...
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full px-6 py-3 text-base font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 gap-2"
            >
              Go to Login <ArrowRight size={20} />
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 shadow-inner">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-gray-900">Oops!</h2>
              <p className="text-lg text-gray-600 font-medium">{message}</p>
            </div>
            <div className="pt-4 space-y-3">
              <Link
                href="/login"
                className="flex items-center justify-center w-full px-6 py-3 text-base font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/30"
              >
                Sign In Instead
              </Link>
              <div className="flex gap-3">
                <Link
                  href="/register"
                  className="flex-1 flex items-center justify-center px-4 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-100 rounded-xl hover:bg-gray-50 transition"
                >
                  Register Again
                </Link>
                <Link
                  href="/check-email"
                  className="flex-1 flex items-center justify-center px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
                >
                  Need Help?
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
