"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function SellerDashboard() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    discount: "0",
    category: "",
    stock: "",
  });

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
        // Fetch seller's products
        const response = await fetch(`/api/products?seller=${user._id}`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setProducts(data.data);
        }

        // Fetch categories
        const catResponse = await fetch("/api/categories", {
          credentials: "include",
        });
        if (catResponse.ok) {
          const catData = await catResponse.json();
          setCategories(catData.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          seller: user._id,
          price: parseFloat(formData.price),
          discount: parseInt(formData.discount),
          stock: { quantity: parseInt(formData.stock) },
          images: [{ url: "/placeholder.png" }],
        }),
      });

      if (!response.ok) throw new Error("Failed to create product");

      const data = await response.json();
      setProducts([...products, data.data]);
      setFormData({
        title: "",
        description: "",
        price: "",
        discount: "0",
        category: "",
        stock: "",
      });
      setShowForm(false);
      alert("Product added successfully!");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm("Are you sure?")) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete product");

      setProducts(products.filter((p) => p._id !== productId));
      alert("Product deleted successfully!");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  if (!user || user.role !== "seller") {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>You must be a seller to access this dashboard</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Seller Dashboard</h1>

      {/* Add Product Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-8 flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        <Plus size={20} /> Add New Product
      </button>

      {/* Add Product Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-md p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Product Title"
            required
            className="p-2 border border-gray-300 rounded md:col-span-2"
          />

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            required
            className="p-2 border border-gray-300 rounded md:col-span-2 h-24"
          />

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="p-2 border border-gray-300 rounded"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Price"
            step="0.01"
            required
            className="p-2 border border-gray-300 rounded"
          />

          <input
            type="number"
            name="discount"
            value={formData.discount}
            onChange={handleChange}
            placeholder="Discount %"
            className="p-2 border border-gray-300 rounded"
          />

          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            placeholder="Stock Quantity"
            required
            className="p-2 border border-gray-300 rounded"
          />

          <button
            type="submit"
            className="md:col-span-2 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Add Product
          </button>
        </form>
      )}

      {/* Products Table */}
      {isLoading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-600">
          No products yet. Add your first product!
        </p>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Price</th>
                <th className="px-4 py-3 text-left">Stock</th>
                <th className="px-4 py-3 text-left">Discount</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{product.title}</td>
                  <td className="px-4 py-3">${product.price.toFixed(2)}</td>
                  <td className="px-4 py-3">{product.stock.quantity}</td>
                  <td className="px-4 py-3">{product.discount}%</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button className="text-blue-600 hover:text-blue-700">
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
