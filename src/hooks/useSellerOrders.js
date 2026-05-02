import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export function useSellerOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await fetch("/api/seller/orders", {
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch orders");
      setOrders(data.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId, status, itemId = null, comment = "", trackingNumber = "") => {
    try {
      const response = await fetch(`/api/seller/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status, itemId, comment, trackingNumber }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update order status");
      
      // Update local state
      setOrders((prev) => 
        prev.map((o) => (o._id === orderId ? { ...o, ...data.data } : o))
      );
      
      return { success: true, data: data.data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    orders,
    loading,
    error,
    refreshOrders: fetchOrders,
    updateOrderStatus,
  };
}
