"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext"; // Use @/ alias instead of relative path
import { ShoppingCart, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";

export default function Header() {
  const { getTotalItems } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");
    if (token && userData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    setUser(null);
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-blue-600">
          ShopHub
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8 items-center">
          <Link href="/" className="hover:text-blue-600 transition">
            Home
          </Link>
          <Link href="/products" className="hover:text-blue-600 transition">
            Products
          </Link>
          {user?.role === "seller" && (
            <Link
              href="/seller-dashboard"
              className="hover:text-blue-600 transition flex items-center gap-2"
            >
              <LayoutDashboard size={18} /> Dashboard
            </Link>
          )}
          {user?.role === "admin" && (
            <Link
              href="/admin-dashboard"
              className="hover:text-blue-600 transition flex items-center gap-2"
            >
              <LayoutDashboard size={18} /> Admin
            </Link>
          )}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Cart */}
          <Link
            href="/cart"
            className="relative flex items-center gap-2 hover:text-blue-600 transition"
          >
            <ShoppingCart size={24} />
            {getTotalItems() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {getTotalItems()}
              </span>
            )}
          </Link>

          {/* Auth Links */}
          {user ? (
            <div className="relative group">
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                {user.firstName}
              </button>
              <div className="hidden group-hover:block absolute right-0 mt-0 bg-white shadow-lg rounded w-48">
                <Link
                  href="/profile"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  My Profile
                </Link>
                <Link
                  href="/orders"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  My Orders
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-red-600"
                >
                  <LogOut size={18} /> Logout
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Sign Up
              </Link>
            </>
          )}

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <nav className="md:hidden bg-gray-50 px-4 py-4 space-y-3">
          <Link href="/" className="block hover:text-blue-600">
            Home
          </Link>
          <Link href="/products" className="block hover:text-blue-600">
            Products
          </Link>
          {user?.role === "seller" && (
            <Link
              href="/seller-dashboard"
              className="block hover:text-blue-600"
            >
              Seller Dashboard
            </Link>
          )}
          {user?.role === "admin" && (
            <Link href="/admin-dashboard" className="block hover:text-blue-600">
              Admin Dashboard
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
