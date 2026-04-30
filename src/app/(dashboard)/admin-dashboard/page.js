"use client";

import { useEffect, useState } from "react";
import { Users, Trash2, CheckCircle, Edit, Save, X, AlertTriangle, Package, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    if (!user || user.role !== "admin") return;

    const fetchData = async () => {
      try {
        // Fetch all users
        const usersResponse = await fetch("/api/users", { credentials: "include" });
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData.data);
        }

        // Fetch categories
        const catsResponse = await fetch("/api/categories", { credentials: "include" });
        if (catsResponse.ok) {
          const catsData = await catsResponse.json();
          setCategories(catsData.data);
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const response = await fetch(`/api/users/${userId}`, { method: "DELETE", credentials: "include" });
      if (!response.ok) throw new Error("Failed to delete user");
      setUsers(users.filter((u) => u._id !== userId));
      alert("User deleted successfully!");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    const isEditing = !!editingCategory;
    const url = isEditing ? `/api/categories/${editingCategory._id}` : "/api/categories";
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: categoryName }),
      });

      if (!response.ok) throw new Error(`Failed to ${isEditing ? "update" : "create"} category`);

      const data = await response.json();
      if (isEditing) {
        setCategories(categories.map(c => c._id === editingCategory._id ? data.data : c));
      } else {
        setCategories([...categories, data.data]);
      }
      
      setCategoryName("");
      setEditingCategory(null);
      setShowCategoryForm(false);
      alert(`Category ${isEditing ? "updated" : "created"} successfully!`);
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleDeleteCategory = async (categoryId, name) => {
    const confirmation = confirm(
      `⚠️ WARNING: DANGEROUS ACTION\n\nDeleting the category "${name}" will also PERMANENTLY DELETE all products associated with it.\n\nAre you sure you want to proceed?`
    );
    
    if (!confirmation) return;

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete category");

      const data = await response.json();
      setCategories(categories.filter((c) => c._id !== categoryId));
      alert(data.message || "Category and products deleted successfully!");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  if (authLoading) return <div className="p-20 text-center">Checking admin permissions...</div>;

  if (!user || user.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 border border-red-200 p-8 rounded-2xl max-w-lg mx-auto">
          <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-red-700">Access Restricted</h2>
          <p className="text-red-600 mt-2">Only administrators can view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
          <Save size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500">System management and oversight</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Statistics Overview */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Users</div>
            <div className="text-3xl font-bold text-gray-900">{users.length}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Sellers</div>
            <div className="text-3xl font-bold text-blue-600">{users.filter(u => u.role === "seller").length}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Customers</div>
            <div className="text-3xl font-bold text-green-600">{users.filter(u => u.role === "customer").length}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Categories</div>
            <div className="text-3xl font-bold text-indigo-600">{categories.length}</div>
          </div>
        </div>

        {/* Users Section */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <Users size={24} className="text-blue-600" />
              <h2 className="text-xl font-bold">User Management</h2>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{u.firstName} {u.lastName}</div>
                      <div className="text-xs text-gray-400">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        u.role === "admin" ? "bg-purple-100 text-purple-700" : 
                        u.role === "seller" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {u.emailVerified ? (
                        <span className="flex items-center gap-1 text-green-600 text-[10px] font-bold uppercase">
                          <CheckCircle size={12} /> Verified
                        </span>
                      ) : (
                        <span className="text-gray-400 text-[10px] font-bold uppercase italic">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u._id !== user.userId && (
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Categories Section */}
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-xl font-bold">Categories</h2>
            <button
              onClick={() => {
                setShowCategoryForm(!showCategoryForm);
                setEditingCategory(null);
                setCategoryName("");
              }}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
            >
              {showCategoryForm ? <X size={20} /> : <Plus size={20} />}
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {showCategoryForm && (
              <form onSubmit={handleCategorySubmit} className="mb-6 animate-in slide-in-from-top-2 duration-200">
                <div className="space-y-3">
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="Enter category name..."
                    required
                    className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
                  >
                    {editingCategory ? "Update Category" : "Add Category"}
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {categories.map((cat) => (
                <div key={cat._id} className="group flex justify-between items-center p-4 bg-gray-50/50 rounded-xl hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100 transition">
                  <div>
                    <p className="font-bold text-gray-900">{cat.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{cat.slug}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button 
                      onClick={() => {
                        setEditingCategory(cat);
                        setCategoryName(cat.name);
                        setShowCategoryForm(true);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteCategory(cat._id, cat.name)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
