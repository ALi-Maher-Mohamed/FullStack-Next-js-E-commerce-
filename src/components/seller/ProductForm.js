"use client";

import { useState, useEffect } from "react";
import { Package, DollarSign, Tag, Layers, FileText, Save, X, Loader2, AlertTriangle } from "lucide-react";

export default function ProductForm({ onSubmit, initialData = null, onCancel, categories = [] }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    stock: { quantity: 0, lowStockThreshold: 10 },
    discount: { type: "percentage", value: 0, active: false },
    images: [{ url: "/placeholder.png" }],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        price: initialData.price || "",
        category: initialData.category?._id || initialData.category || "",
        stock: initialData.stock || { quantity: 0, lowStockThreshold: 10 },
        discount: initialData.discount || { type: "percentage", value: 0, active: false },
        images: initialData.images || [{ url: "/placeholder.png" }],
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "quantity") {
      setFormData(prev => ({ ...prev, stock: { ...prev.stock, quantity: parseInt(value) || 0 } }));
    } else if (name === "lowStockThreshold") {
      setFormData(prev => ({ ...prev, stock: { ...prev.stock, lowStockThreshold: parseInt(value) || 10 } }));
    } else if (name === "discountValue") {
      const val = parseFloat(value) || 0;
      setFormData(prev => ({ 
        ...prev, 
        discount: { ...prev.discount, value: val, active: val > 0 } 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmitLocal = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmitLocal} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-700 mb-1">Product Title</label>
          <div className="relative">
            <Package className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g. Wireless Noise Cancelling Headphones"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              maxLength={3000}
              placeholder="Describe your product features and benefits..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition h-32"
            />
          </div>
        </div>

        {/* Image URL */}
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-700 mb-1">Product Image URL</label>
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="relative flex-grow w-full">
              <Package className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="url"
                name="imageUrl"
                value={formData.images[0]?.url || ""}
                onChange={(e) => {
                  const url = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    images: [{ url: url || "/placeholder.png", isPrimary: true }]
                  }));
                }}
                placeholder="https://example.com/image.jpg"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
              <p className="text-[10px] text-gray-400 mt-1 px-1">Paste a direct link to an image (JPG, PNG, WebP)</p>
            </div>
            
            <div className="w-24 h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
              {formData.images[0]?.url && formData.images[0]?.url !== "/placeholder.png" ? (
                <img 
                  src={formData.images[0].url} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = "/placeholder.png"; }}
                />
              ) : (
                <div className="text-gray-300 flex flex-col items-center">
                  <Package size={24} />
                  <span className="text-[8px] font-bold uppercase mt-1">Preview</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
          <div className="relative">
            <Layers className="absolute left-3 top-3 text-gray-400" size={18} />
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition appearance-none"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Price ($)</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              placeholder="0.00"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>
        </div>

        {/* Stock */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Stock Quantity</label>
          <div className="relative">
            <Package className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="number"
              name="quantity"
              value={formData.stock.quantity}
              onChange={handleChange}
              required
              min="0"
              placeholder="0"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>
        </div>

        {/* Low Stock Threshold */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Low Stock Alert at</label>
          <div className="relative">
            <AlertTriangle className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="number"
              name="lowStockThreshold"
              value={formData.stock.lowStockThreshold}
              onChange={handleChange}
              min="0"
              placeholder="10"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>
        </div>

        {/* Discount */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Discount (%)</label>
          <div className="relative">
            <Tag className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="number"
              name="discountValue"
              value={formData.discount.value}
              onChange={handleChange}
              min="0"
              max="100"
              placeholder="0"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition flex items-center gap-2"
        >
          <X size={18} /> Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <><Loader2 className="animate-spin" size={18} /> Saving...</>
          ) : (
            <><Save size={18} /> {initialData ? "Update Product" : "Publish Product"}</>
          )}
        </button>
      </div>
    </form>
  );
}
