import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export function useSellerProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/products?seller=${user.userId || user._id}&limit=50`, {
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch products");
      setProducts(data.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = async (productData) => {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(productData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create product");
      setProducts((prev) => [data.data, ...prev]);
      return { success: true, data: data.data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateProduct = async (id, updatedData) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updatedData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update product");
      setProducts((prev) => prev.map((p) => (p._id === id ? data.data : p)));
      return { success: true, data: data.data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteProduct = async (id) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete product");
      }
      setProducts((prev) => prev.filter((p) => p._id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    products,
    loading,
    error,
    refreshProducts: fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
  };
}
