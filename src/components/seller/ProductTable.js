"use client";

import { Edit, Trash2, Package, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

export default function ProductTable({ products, onEdit, onDelete }) {
  if (products.length === 0) {
    return (
      <div className="p-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
        <Package className="mx-auto text-gray-200 mb-4" size={64} />
        <p className="text-gray-500 text-lg">No products listed yet.</p>
        <p className="text-gray-400">Click the button above to add your first product.</p>
      </div>
    );
  }

  const getStatusBadge = (status, stock) => {
    if (stock <= 0) return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-bold uppercase">Out of Stock</span>;
    if (stock < 5) return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold uppercase">Low Stock</span>;
    
    switch (status) {
      case "active": return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase">Active</span>;
      case "inactive": return <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold uppercase">Inactive</span>;
      default: return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold uppercase">{status}</span>;
    }
  };

  return (
    <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-100">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 text-gray-500 text-[11px] uppercase tracking-wider font-bold">
            <th className="px-6 py-4">Product Info</th>
            <th className="px-6 py-4">Category</th>
            <th className="px-6 py-4">Inventory</th>
            <th className="px-6 py-4">Pricing</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {products.map((product) => (
            <tr key={product._id} className="hover:bg-gray-50/50 transition group">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={product.images?.[0]?.url || "/placeholder.png"} 
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="max-w-[200px]">
                    <div className="font-bold text-gray-900 truncate">{product.title}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5 truncate">{product.slug}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-gray-600 font-medium">
                  {product.category?.name || "Uncategorized"}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className={`text-sm font-bold ${product.stock.quantity < 5 ? "text-red-600" : "text-gray-900"}`}>
                    {product.stock.quantity} in stock
                  </span>
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Reserved: {product.stock.reserved || 0}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="font-bold text-gray-900">${product.price.toFixed(2)}</div>
                {product.discount?.active && (
                  <div className="text-[11px] text-green-600 font-bold flex items-center gap-1">
                    <Tag size={10} /> {product.discount.value}% OFF
                  </div>
                )}
              </td>
              <td className="px-6 py-4">
                {getStatusBadge(product.status, product.stock.quantity)}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-1">
                  <button 
                    onClick={() => onEdit(product)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => onDelete(product._id, product.title)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Tag({ size }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
      <path d="M7 7h.01" />
    </svg>
  );
}
