/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, clearCart } =
    useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleCheckout = async () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user._id,
        },
        body: JSON.stringify({
          items: cart.map((item) => ({
            product: item._id,
            quantity: item.quantity,
          })),
          shippingAddress: {
            street: user.address?.street || "",
            city: user.address?.city || "",
            state: user.address?.state || "",
            postalCode: user.address?.postalCode || "",
            country: user.address?.country || "",
          },
          paymentMethod: "credit_card",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create order");
      }

      const data = await response.json();
      clearCart();
      alert("Order placed successfully!");
      window.location.href = `/orders/${data.data._id}`;
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-8">
          Start shopping to add items to your cart
        </p>
        <Link
          href="/products"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const tax = subtotal * 0.1;
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + tax + shipping;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {cart.map((item) => (
              <div
                key={item._id}
                className="flex gap-4 p-4 border-b last:border-b-0 items-center"
              >
                {/* Image */}
                <img
                  src={item.images?.[0]?.url || "/placeholder.png"}
                  alt={item.title}
                  className="w-24 h-24 object-cover rounded"
                />

                {/* Details */}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{item.title}</h3>
                  <p className="text-gray-600">
                    ${(item.salePrice || item.price).toFixed(2)} each
                  </p>
                </div>

                {/* Quantity Control */}
                <div className="flex items-center gap-2 bg-gray-100 rounded">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="px-3 py-2 hover:bg-gray-200"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="px-3 font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="px-3 py-2 hover:bg-gray-200"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                {/* Total */}
                <div className="text-right">
                  <p className="font-bold text-lg">
                    $
                    {((item.salePrice || item.price) * item.quantity).toFixed(
                      2,
                    )}
                  </p>
                </div>

                {/* Delete */}
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="text-red-600 hover:text-red-700 p-2"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-6 rounded-lg shadow-md sticky top-24 h-fit">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-3 mb-6 pb-6 border-b">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span
                  className={
                    shipping === 0 ? "text-green-600 font-semibold" : ""
                  }
                >
                  {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                </span>
              </div>
            </div>

            <div className="flex justify-between text-xl font-bold mb-6">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            {subtotal > 100 && (
              <p className="text-sm text-green-600 mb-4">
                ✓ Free shipping applied!
              </p>
            )}

            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {isLoading ? "Processing..." : "Checkout"}
            </button>

            <Link
              href="/products"
              className="block text-center mt-4 text-blue-600 hover:underline"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
