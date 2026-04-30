"use client";

import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { Search, Filter } from "lucide-react";

export default function ProductGallery({ initialProducts = [] }) {
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(initialProducts.length === 0);
  const [error, setError] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams({
          page: currentPage,
          limit: 12,
          ...(searchTerm && { search: searchTerm }),
          ...(selectedCategory && { category: selectedCategory }),
          ...(minPrice && { minPrice }),
          ...(maxPrice && { maxPrice }),
        });

        const response = await fetch(`/api/products?${params}`);
        if (!response.ok) throw new Error("Failed to fetch products");

        const data = await response.json();
        setProducts(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [searchTerm, selectedCategory, minPrice, maxPrice, currentPage]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) throw new Error("Failed to fetch categories");

        const data = await response.json();
        setCategories(data.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCategories();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  const handlePriceChange = (type, value) => {
    if (type === "min") setMinPrice(value);
    else setMaxPrice(value);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-8">Shop Our Products</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar - Filters */}
        <aside className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
            <div className="flex items-center gap-2 mb-6">
              <Filter size={20} />
              <h2 className="text-lg font-bold">Filters</h2>
            </div>

            {/* Search */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Search</label>
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Category */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">
                Price Range
              </label>
              <div className="space-y-2">
                <input
                  type="number"
                  placeholder="Min Price"
                  value={minPrice}
                  onChange={(e) => handlePriceChange("min", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Max Price"
                  value={maxPrice}
                  onChange={(e) => handlePriceChange("max", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              className="w-full py-2 bg-gray-200 hover:bg-gray-300 rounded font-semibold transition"
            >
              Reset Filters
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading products...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">Error: {error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">
                No products found. Try adjusting your filters.
              </p>
            </div>
          ) : (
            <>
              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2">Page {currentPage}</span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={products.length < 12}
                  className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
