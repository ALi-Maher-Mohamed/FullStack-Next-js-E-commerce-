"use client";

import { useState, useEffect } from "react";
import { Plus, Package, Store, Mail, Loader2, X, Search, Filter, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useSellerProducts } from "@/hooks/useSellerProducts";
import ProductTable from "@/components/seller/ProductTable";
import ProductForm from "@/components/seller/ProductForm";
import DeleteConfirmModal from "@/components/seller/DeleteConfirmModal";
import Toast from "@/components/ui/Toast";

export default function SellerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const { 
    products, 
    loading: productsLoading, 
    error, 
    refreshProducts, 
    addProduct, 
    updateProduct, 
    deleteProduct 
  } = useSellerProducts();

  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deletingName, setDeletingName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Redirect if not seller
  useEffect(() => {
    if (!authLoading && (!user || (user.role !== "seller" && user.role !== "admin"))) {
      router.push(user ? "/" : "/login");
    }
  }, [user, authLoading, router]);

  // Fetch categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (res.ok) setCategories(data.data);
      } catch (err) {
        console.error("Failed to fetch categories");
      }
    };
    fetchCats();
  }, []);

  const handleFormSubmit = async (formData) => {
    let result;
    if (editingProduct) {
      result = await updateProduct(editingProduct._id, formData);
    } else {
      result = await addProduct(formData);
    }

    if (result.success) {
      setToast({ type: "success", message: `Product ${editingProduct ? "updated" : "added"} successfully!` });
      setShowForm(false);
      setEditingProduct(null);
    } else {
      setToast({ type: "error", message: result.error });
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    const result = await deleteProduct(deletingId);
    setIsDeleting(false);
    
    if (result.success) {
      setToast({ type: "success", message: "Product deleted successfully" });
      setDeletingId(null);
    } else {
      setToast({ type: "error", message: result.error });
    }
  };

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
      <p className="text-gray-500 font-medium">Verifying account permissions...</p>
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <Store size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{user.storeName || "Seller Dashboard"}</h1>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Mail size={12} /> {user.email}
                  </span>
                  <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded-full uppercase tracking-wider border border-green-100">
                    {user.role} Account
                  </span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => {
                setEditingProduct(null);
                setShowForm(true);
              }}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30"
            >
              <Plus size={20} /> Add New Product
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Statistics or Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Package size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{products.length}</div>
              <div className="text-xs text-gray-400 font-bold uppercase tracking-tight">Total Products</div>
            </div>
          </div>
          
          <div className="md:col-span-2 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search products by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <button 
              onClick={refreshProducts}
              className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
              title="Refresh"
            >
              <RefreshCw size={20} className={productsLoading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        {error ? (
          <div className="p-12 text-center bg-red-50 rounded-2xl border border-red-100">
            <XCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-red-700 mb-2">Error loading products</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <button 
              onClick={refreshProducts}
              className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        ) : productsLoading && products.length === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-white rounded-2xl border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <ProductTable 
            products={filteredProducts} 
            onEdit={(p) => {
              setEditingProduct(p);
              setShowForm(true);
            }} 
            onDelete={(id, name) => {
              setDeletingId(id);
              setDeletingName(name);
            }}
          />
        )}
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-2 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <ProductForm 
                onSubmit={handleFormSubmit}
                initialData={editingProduct}
                categories={categories}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal 
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        productName={deletingName}
        loading={isDeleting}
      />

      {/* Toast Notifications */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
}

function XCircle({ size, className }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}
