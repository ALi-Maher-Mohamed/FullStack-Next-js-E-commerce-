import { useState } from "react";
import { Eye, Truck, CheckCircle, Clock, XCircle, ChevronDown, ChevronUp, ShoppingBag } from "lucide-react";

export default function OrderList({ orders, onUpdateStatus }) {
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [trackingNumbers, setTrackingNumbers] = useState({});

  const handleTrackingChange = (orderId, value) => {
    setTrackingNumbers(prev => ({ ...prev, [orderId]: value }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-50 text-yellow-600 border-yellow-100";
      case "processing": return "bg-blue-50 text-blue-600 border-blue-100";
      case "shipped": return "bg-indigo-50 text-indigo-600 border-indigo-100";
      case "delivered": return "bg-green-50 text-green-600 border-green-100";
      case "cancelled": return "bg-red-50 text-red-600 border-red-100";
      default: return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
        <ShoppingBag size={48} className="text-gray-200 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-1">No orders yet</h3>
        <p className="text-gray-500">When customers buy your products, they will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all">
          {/* Order Header */}
          <div 
            className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/50 transition"
            onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                <Clock size={20} />
              </div>
              <div>
                <div className="font-bold text-gray-900">{order.orderId}</div>
                <div className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                <div className="text-xs text-gray-400 font-bold uppercase tracking-tight">Customer</div>
                <div className="text-sm font-medium text-gray-900">{order.user?.firstName} {order.user?.lastName}</div>
              </div>
              
              <div className="text-right">
                <div className="text-xs text-gray-400 font-bold uppercase tracking-tight">Your Total</div>
                <div className="text-sm font-bold text-gray-900">${order.sellerSubtotal?.toFixed(2)}</div>
              </div>

              <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                {order.status.toUpperCase()}
              </div>

              {expandedOrder === order._id ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
            </div>
          </div>

          {/* Order Details (Expanded) */}
          {expandedOrder === order._id && (
            <div className="px-6 pb-6 pt-2 border-t border-gray-50 animate-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
                {/* Items */}
                <div className="lg:col-span-2 space-y-4">
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Your Items</h4>
                  {order.sellerItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white rounded-lg border border-gray-200 p-1">
                          <img 
                            src={item.product?.images?.[0]?.url || "/placeholder.png"} 
                            alt={item.product?.title} 
                            className="w-full h-full object-cover rounded-md"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{item.product?.title}</div>
                          <div className="text-sm text-gray-500">Qty: {item.quantity} × ${item.price?.toFixed(2)}</div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <div className="font-bold text-gray-900">${item.total?.toFixed(2)}</div>
                        <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(item.status)}`}>
                          {item.status.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions & Shipping */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Shipping Address</h4>
                    <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl space-y-1">
                      <p className="font-medium text-gray-900">{order.shippingAddress?.street}</p>
                      <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}</p>
                      <p>{order.shippingAddress?.country}</p>
                      <p className="pt-2 text-xs font-bold text-gray-400">Phone: {order.shippingAddress?.phone}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Shipment Details</h4>
                    <input 
                      type="text" 
                      placeholder="Tracking Number"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm mb-4 outline-none focus:ring-2 focus:ring-blue-500 transition"
                      value={trackingNumbers[order._id] || order.trackingNumber || ""}
                      onChange={(e) => handleTrackingChange(order._id, e.target.value)}
                    />
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => onUpdateStatus(order._id, 'processing', null, "", trackingNumbers[order._id])}
                        className="flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition"
                      >
                        <Clock size={14} /> Processing
                      </button>
                      <button 
                        onClick={() => onUpdateStatus(order._id, 'shipped', null, "", trackingNumbers[order._id])}
                        className="flex items-center justify-center gap-2 px-3 py-2.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition"
                      >
                        <Truck size={14} /> Shipped
                      </button>
                      <button 
                        onClick={() => onUpdateStatus(order._id, 'delivered', null, "", trackingNumbers[order._id])}
                        className="flex items-center justify-center gap-2 px-3 py-2.5 bg-green-50 text-green-600 rounded-lg text-xs font-bold hover:bg-green-100 transition col-span-2"
                      >
                        <CheckCircle size={14} /> Mark Delivered
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

