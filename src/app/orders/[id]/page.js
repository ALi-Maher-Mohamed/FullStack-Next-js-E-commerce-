"use client";

import { useEffect, useState, use } from "react";
import { Package, Calendar, DollarSign, Truck } from "lucide-react";
import Link from "next/link";

export default function OrderDetailPage({ params }) {
  const { id } = use(params);
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${id}`);
        if (!response.ok) throw new Error("Order not found");
        const data = await response.json();
        setOrder(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-red-600 mb-4">Error: {error || "Order not found"}</p>
        <Link href="/orders" className="text-blue-600 hover:underline">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/orders"
        className="text-blue-600 hover:underline mb-8 inline-block"
      >
        ← Back to Orders
      </Link>

      <h1 className="text-3xl font-bold mb-8">Order Details</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Order Header */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-600 text-sm">Order ID</p>
                <p className="font-bold text-lg">{order.orderId}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Order Date</p>
                <p className="font-bold">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Status</p>
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
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Payment Status</p>
                <p className="font-semibold capitalize">
                  {order.paymentStatus}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Package size={20} /> Order Items
            </h2>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 p-4 border-b last:border-b-0"
                >
                  <img
                    src={item.product?.images?.[0]?.url || "/placeholder.png"}
                    alt={item.product?.title}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.product?.title}</h3>
                    <p className="text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${item.price.toFixed(2)}</p>
                    <p className="text-gray-600">${item.total.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Truck size={20} /> Shipping Address
            </h2>
            <p className="font-semibold">{order.shippingAddress?.street}</p>
            <p className="text-gray-600">
              {order.shippingAddress?.city}, {order.shippingAddress?.state}{" "}
              {order.shippingAddress?.postalCode}
            </p>
            {order.estimatedDelivery && (
              <p className="text-sm text-gray-600 mt-2">
                Estimated Delivery:{" "}
                {new Date(order.estimatedDelivery).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Status History */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Status History</h2>
              <div className="space-y-3">
                {order.statusHistory.map((history, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 pb-3 border-b last:border-b-0"
                  >
                    <div className="w-3 h-3 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-semibold capitalize">
                        {history.status}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(history.timestamp).toLocaleString()}
                      </p>
                      {history.comment && (
                        <p className="text-sm text-gray-700">
                          {history.comment}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div>
          <div className="bg-gray-50 rounded-lg shadow-md p-6 sticky top-24 h-fit">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-3 mb-6 pb-6 border-b">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (10%)</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {order.shippingCost === 0
                    ? "FREE"
                    : `$${order.shippingCost.toFixed(2)}`}
                </span>
              </div>
            </div>

            <div className="flex justify-between text-xl font-bold mb-6">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>Payment Method:</strong>{" "}
                {order.paymentMethod.replace("_", " ").toUpperCase()}
              </p>
              <p>
                <strong>Order ID:</strong> {order._id}
              </p>
              {order.trackingNumber && (
                <p>
                  <strong>Tracking #:</strong> {order.trackingNumber}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
