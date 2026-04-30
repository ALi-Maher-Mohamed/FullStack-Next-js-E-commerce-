"use client";

import { Star, ShoppingCart, Heart } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const imageUrl = product.images?.[0]?.url || "/placeholder.png";
  const discount = product.discount || 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-100 h-48">
        <Link href={`/products/${product._id}`}>
          <img
            src={imageUrl}
            alt={product.title}
            className="w-full h-full object-cover hover:scale-105 transition cursor-pointer"
          />
        </Link>
        {discount > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            -{discount}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        <p className="text-xs text-gray-500 mb-1">
          {product.category?.name || "Uncategorized"}
        </p>

        {/* Title */}
        <Link href={`/products/${product._id}`}>
          <h3 className="font-semibold text-gray-800 hover:text-blue-600 line-clamp-2">
            {product.title}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 my-2">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                fill={
                  i < Math.round(product.ratings?.average || 0)
                    ? "currentColor"
                    : "none"
                }
              />
            ))}
          </div>
          <span className="text-xs text-gray-600">
            ({product.ratings?.count || 0})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg font-bold text-gray-900">
            ${product.salePrice?.toFixed(2) || product.price?.toFixed(2)}
          </span>
          {product.salePrice && (
            <span className="text-sm text-gray-500 line-through">
              ${product.price?.toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <p
          className={`text-xs font-semibold mb-3 ${
            product.stock?.quantity > 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {product.stock?.quantity > 0 ? "In Stock" : "Out of Stock"}
        </p>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={product.stock?.quantity === 0}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded font-semibold transition ${
              isAdded
                ? "bg-green-500 text-white"
                : product.stock?.quantity > 0
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
          >
            <ShoppingCart size={18} />
            {isAdded ? "Added!" : "Add to Cart"}
          </button>
          <button className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition">
            <Heart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
