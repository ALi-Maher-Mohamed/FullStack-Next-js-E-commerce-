"use client";

import { useEffect, useState, use } from "react";
import { useCart } from "@/context/CartContext";
import { Star, ShoppingCart, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ProductDetailPage({ params }) {
  const { id } = use(params);
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) throw new Error("Product not found");
        const data = await response.json();
        setProduct(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-red-600 mb-4">
          Error: {error || "Product not found"}
        </p>
        <Link href="/products" className="text-blue-600 hover:underline">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        href="/products"
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8"
      >
        <ArrowLeft size={20} /> Back to Products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* Images */}
        <div>
          <div className="bg-gray-100 rounded-lg overflow-hidden mb-4">
            <img
              src={product.images?.[selectedImage]?.url || "/placeholder.png"}
              alt={product.title}
              className="w-full h-96 object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.images?.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`rounded overflow-hidden border-2 ${
                  selectedImage === idx
                    ? "border-blue-600"
                    : "border-transparent"
                }`}
              >
                <img
                  src={img.url}
                  alt="thumbnail"
                  className="w-full h-20 object-cover hover:opacity-75"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          <div className="mb-4">
            <p className="text-gray-600 text-sm mb-2">
              {product.category?.name}
            </p>
            <h1 className="text-3xl font-bold mb-2">{product.title}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    fill={
                      i < Math.round(product.ratings?.average || 0)
                        ? "currentColor"
                        : "none"
                    }
                  />
                ))}
              </div>
              <span className="text-gray-600">
                ({product.ratings?.count || 0} reviews)
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="mb-6 pb-6 border-b">
            <div className="flex items-end gap-4">
              <span className="text-4xl font-bold">
                ${product.salePrice?.toFixed(2) || product.price?.toFixed(2)}
              </span>
              {product.salePrice && (
                <>
                  <span className="text-2xl text-gray-500 line-through">
                    ${product.price?.toFixed(2)}
                  </span>
                  <span className="text-red-600 font-bold">
                    Save {product.discount?.value || 0}%
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Stock */}
          <div className="mb-6">
            <p
              className={`font-semibold mb-4 ${
                product.stock?.quantity > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {product.stock?.quantity > 0
                ? `In Stock (${product.stock.quantity} available)`
                : "Out of Stock"}
            </p>
          </div>

          {/* Quantity */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Quantity</label>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-300 rounded">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-gray-100"
                >
                  −
                </button>
                <span className="px-6 font-semibold">{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity(
                      Math.min(product.stock?.quantity || 1, quantity + 1),
                    )
                  }
                  className="px-4 py-2 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock?.quantity === 0}
            className={`w-full py-3 rounded font-semibold flex items-center justify-center gap-2 transition ${
              isAdded
                ? "bg-green-500 text-white"
                : product.stock?.quantity > 0
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
          >
            <ShoppingCart size={20} />
            {isAdded ? "Added to Cart!" : "Add to Cart"}
          </button>

          {/* Description */}
          <div className="mt-8 pt-8 border-t">
            <h2 className="text-xl font-bold mb-4">Description</h2>
            <p className="text-gray-700 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Specifications */}
          {product.specifications && (
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Specifications</h2>
              <div className="space-y-2">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between border-b pb-2">
                    <span className="font-semibold capitalize">{key}:</span>
                    <span>{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
