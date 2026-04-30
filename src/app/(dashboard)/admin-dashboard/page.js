"use client";

import { useEffect, useState } from "react";
import { Users, Trash2, CheckCircle } from "lucide-react";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch all users
        const usersResponse = await fetch("/api/users", {
          credentials: "include",
        });
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData.data);
        }

        // Fetch categories
        const catsResponse = await fetch("/api/categories", {
          credentials: "include",
        });
        if (catsResponse.ok) {
          const catsData = await catsResponse.json();
          setCategories(catsData.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure?")) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete user");

      setUsers(users.filter((u) => u._id !== userId));
      alert("User deleted successfully!");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: categoryName }),
      });

      if (!response.ok) throw new Error("Failed to create category");

      const data = await response.json();
      setCategories([...categories, data.data]);
      setCategoryName("");
      setShowCategoryForm(false);
      alert("Category created successfully!");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>You must be an admin to access this dashboard</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Users Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users size={24} />
            <h2 className="text-2xl font-bold">Users</h2>
          </div>

          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-4 p-3 bg-blue-50 rounded text-sm">
                <p>
                  <strong>Total Users:</strong> {users.length}
                </p>
                <p>
                  <strong>Sellers:</strong>{" "}
                  {users.filter((u) => u.role === "seller").length}
                </p>
                <p>
                  <strong>Customers:</strong>{" "}
                  {users.filter((u) => u.role === "customer").length}
                </p>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {users.slice(0, 5).map((u) => (
                  <div
                    key={u._id}
                    className="flex justify-between items-center p-2 border-b"
                  >
                    <div>
                      <p className="font-semibold">
                        {u.firstName} {u.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{u.email}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteUser(u._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Categories Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Categories</h2>

          <div className="bg-white rounded-lg shadow-md p-6">
            <button
              onClick={() => setShowCategoryForm(!showCategoryForm)}
              className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Category
            </button>

            {showCategoryForm && (
              <form onSubmit={handleAddCategory} className="mb-4 space-y-2">
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Category Name"
                  required
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Create
                </button>
              </form>
            )}

            <div className="max-h-96 overflow-y-auto space-y-2">
              {categories.map((cat) => (
                <div
                  key={cat._id}
                  className="flex justify-between items-center p-2 border-b"
                >
                  <div>
                    <p className="font-semibold">{cat.name}</p>
                    <p className="text-sm text-gray-600">{cat.slug}</p>
                  </div>
                  {cat.isActive && (
                    <CheckCircle size={20} className="text-green-600" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
