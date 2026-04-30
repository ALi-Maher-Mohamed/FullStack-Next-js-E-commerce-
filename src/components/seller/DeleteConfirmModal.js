"use client";

import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, productName, loading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
              <AlertTriangle size={24} />
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition">
              <X size={20} />
            </button>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Product?</h3>
          <p className="text-gray-600">
            Are you sure you want to delete <span className="font-bold text-gray-900">"{productName}"</span>? 
            This action cannot be undone and will remove the product from the store.
          </p>
        </div>

        <div className="bg-gray-50 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition shadow-lg shadow-red-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <><Trash2 size={18} /> Delete</>}
          </button>
        </div>
      </div>
    </div>
  );
}
