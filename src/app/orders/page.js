"use client";

import { useEffect, useState } from "react";
import { Package, Calendar, DollarSign, Tag } from "lucide-react";
import Link from "next/link";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/orders", {
          headers: {
            "x-user-id": user._id,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch orders");
        const data = await response.json();
        setOrders(data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-gray-600 mb-4">Please log in to view your orders</p>
        <Link href="/login" className="text-blue-600 hover:underline">
          Sign In
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Package size={64} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-3xl font-bold mb-4">No Orders Yet</h1>
        <p className="text-gray-600 mb-8">
          You haven't placed any orders. Start shopping to make your first
          purchase!
        </p>
        <Link
          href="/products"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Link key={order._id} href={`/orders/${order._id}`}>
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                {/* Order ID */}
                <div>
                  <p className="text-gray-600 text-sm mb-1">Order ID</p>
                  <p className="font-semibold">{order.orderId}</p>
                </div>

                {/* Date */}
                <div className="flex items-start gap-2">
                  <Calendar size={18} className="text-gray-600 mt-5" />
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Date</p>
                    <p className="font-semibold">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <p className="text-gray-600 text-sm mb-1">Items</p>
                  <p className="font-semibold">{order.items.length} products</p>
                </div>

                {/* Total */}
                <div className="flex items-start gap-2">
                  <DollarSign size={18} className="text-gray-600 mt-5" />
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Total</p>
                    <p className="font-semibold">${order.total.toFixed(2)}</p>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <p className="text-gray-600 text-sm mb-1">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      order.status === "delivered"
                        ? "bg-green-100 text-green-800"
                        : order.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : order.status === "shipped"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
