"use client";

import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function Toast({ message, type = "success", onClose, duration = 3000 }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade-out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="text-green-500" size={20} />,
    error: <XCircle className="text-red-500" size={20} />,
    warning: <AlertTriangle className="text-amber-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />,
  };

  const bgColors = {
    success: "bg-green-50 border-green-100",
    error: "bg-red-50 border-red-100",
    warning: "bg-amber-50 border-amber-100",
    info: "bg-blue-50 border-blue-100",
  };

  return (
    <div className={`fixed bottom-8 right-8 z-[100] transition-all duration-300 transform ${
      isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
    }`}>
      <div className={`flex items-center gap-3 p-4 rounded-2xl border shadow-xl min-w-[300px] ${bgColors[type]} bg-white`}>
        {icons[type]}
        <p className="text-sm font-semibold text-gray-800 flex-grow">{message}</p>
        <button onClick={() => setIsVisible(false)} className="text-gray-400 hover:text-gray-600 transition">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
