"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Plus, Package, Store, Mail, Loader2, X, Search, Filter, 
  RefreshCw, LayoutDashboard, ShoppingBag, CreditCard, 
  Settings, TrendingUp, AlertCircle, ArrowUpRight, ArrowDownRight,
  Wallet, CheckCircle2, Truck, Clock
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useSellerProducts } from "@/hooks/useSellerProducts";
import { useSellerOrders } from "@/hooks/useSellerOrders";
import { useSellerStats } from "@/hooks/useSellerStats";
import ProductTable from "@/components/seller/ProductTable";
import ProductForm from "@/components/seller/ProductForm";
import OrderList from "@/components/seller/OrderList";
import StatsCards from "@/components/seller/StatsCards";
import DeleteConfirmModal from "@/components/seller/DeleteConfirmModal";
import Toast from "@/components/ui/Toast";

export default function SellerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("overview");
  
  // Hooks for data
  const { 
    products, 
    loading: productsLoading, 
    error: productsError, 
    refreshProducts, 
    addProduct, 
    updateProduct, 
    deleteProduct 
  } = useSellerProducts();

  const {
    orders,
    loading: ordersLoading,
    error: ordersError,
    refreshOrders,
    updateOrderStatus
  } = useSellerOrders();

  const {
    stats,
    loading: statsLoading,
    error: statsError,
    refreshStats
  } = useSellerStats();

  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deletingName, setDeletingName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [orderFilter, setOrderFilter] = useState("all");
  
  // Payout Modal State
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [isProcessingPayout, setIsProcessingPayout] = useState(false);

  // Redirect if not seller
  useEffect(() => {
    if (!authLoading && (!user || (user.role !== "seller" && user.role !== "admin"))) {
      router.push(user ? "/" : "/login");
    }
  }, [user, authLoading, router]);

  // Fetch categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (res.ok) setCategories(data.data);
      } catch (err) {
        console.error("Failed to fetch categories");
      }
    };
    fetchCats();
  }, []);

  const handleFormSubmit = async (formData) => {
    let result;
    if (editingProduct) {
      result = await updateProduct(editingProduct._id, formData);
    } else {
      result = await addProduct(formData);
    }

    if (result.success) {
      setToast({ type: "success", message: `Product ${editingProduct ? "updated" : "added"} successfully!` });
      setShowForm(false);
      setEditingProduct(null);
      refreshStats();
    } else {
      setToast({ type: "error", message: result.error });
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    const result = await deleteProduct(deletingId);
    setIsDeleting(false);
    
    if (result.success) {
      setToast({ type: "success", message: "Product deleted successfully" });
      setDeletingId(null);
      refreshStats();
    } else {
      setToast({ type: "error", message: result.error });
    }
  };

  const handleUpdateOrderStatus = async (orderId, status, itemId = null, comment = "", trackingNumber = "") => {
    const result = await updateOrderStatus(orderId, status, itemId, comment, trackingNumber);
    if (result.success) {
      setToast({ type: "success", message: result.data.message || `Order status updated to ${status}` });
      refreshStats();
      refreshOrders();
    } else {
      setToast({ type: "error", message: result.error });
    }
  };

  const handlePayout = async (e) => {
    e.preventDefault();
    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount <= 0) {
      setToast({ type: "error", message: "Please enter a valid amount" });
      return;
    }

    setIsProcessingPayout(true);
    try {
      const res = await fetch("/api/seller/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setToast({ type: "success", message: data.message });
        setShowPayoutModal(false);
        setPayoutAmount("");
        refreshStats();
      } else {
        throw new Error(data.error || "Payout failed");
      }
    } catch (err) {
      setToast({ type: "error", message: err.message });
    } finally {
      setIsProcessingPayout(false);
    }
  };

  const handleRefresh = () => {
    refreshStats();
    refreshProducts();
    refreshOrders();
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [products, searchTerm]);

  const filteredOrders = useMemo(() => {
    let filtered = orders;
    if (orderFilter !== "all") {
      filtered = orders.filter(o => o.status === orderFilter);
    }
    if (searchTerm && activeTab === "orders") {
      filtered = filtered.filter(o => o.orderId.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return filtered;
  }, [orders, orderFilter, searchTerm, activeTab]);

  if (authLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
      <p className="text-gray-500 font-medium">Verifying account permissions...</p>
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Sidebar-style Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <Store size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{user.storeName || user.fullName || "Seller Dashboard"}</h1>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                    <Mail size={12} /> {user.email}
                  </span>
                  <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded-full uppercase tracking-wider border border-green-100">
                    {user.role} Account
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-1 rounded-xl flex">
                <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")} icon={<LayoutDashboard size={18} />} label="Overview" />
                <TabButton active={activeTab === "products"} onClick={() => setActiveTab("products")} icon={<Package size={18} />} label="Products" />
                <TabButton active={activeTab === "orders"} onClick={() => setActiveTab("orders")} icon={<ShoppingBag size={18} />} label="Orders" />
                <TabButton active={activeTab === "earnings"} onClick={() => setActiveTab("earnings")} icon={<CreditCard size={18} />} label="Earnings" />
              </div>

              <button 
                onClick={handleRefresh}
                className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition border border-gray-100 bg-white"
                title="Refresh Data"
              >
                <RefreshCw size={20} className={productsLoading || ordersLoading || statsLoading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {statsLoading && !stats ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
              </div>
            ) : (
              <>
                <StatsCards stats={stats} />
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Sales Analytics Chart (Simulation) */}
                  <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-8 overflow-hidden relative">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                          <TrendingUp size={22} className="text-blue-600" /> Revenue Growth
                        </h3>
                        <p className="text-xs text-gray-400 font-medium mt-1">Based on your recent order volume</p>
                      </div>
                      <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg text-blue-600 text-xs font-bold">
                        <ArrowUpRight size={14} /> +12.5% this month
                      </div>
                    </div>
                    
                    <div className="h-48 flex items-end gap-2 px-2">
                      {[40, 65, 45, 90, 55, 75, 40, 85, 60, 95, 50, 70].map((h, i) => (
                        <div key={i} className="flex-grow group relative">
                          <div 
                            className="bg-blue-100 hover:bg-blue-600 w-full rounded-t-lg transition-all duration-300 cursor-pointer" 
                            style={{ height: `${h}%` }}
                          />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                            ${(h * 15).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-4 px-2">
                      <span className="text-[10px] font-bold text-gray-300">JAN</span>
                      <span className="text-[10px] font-bold text-gray-300">JUN</span>
                      <span className="text-[10px] font-bold text-gray-300">DEC</span>
                    </div>
                  </div>

                  {/* Quick Wallet Action */}
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Wallet size={22} className="text-emerald-600" /> Wallet Balance
                      </h3>
                      
                      <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 text-white mb-6 shadow-xl shadow-emerald-500/20 relative overflow-hidden">
                        <div className="absolute -right-4 -bottom-4 opacity-10">
                          <Wallet size={120} />
                        </div>
                        <div className="text-xs font-medium opacity-80 uppercase tracking-wider mb-1">Available for Payout</div>
                        <div className="text-4xl font-bold">${stats?.wallet?.balance?.toFixed(2) || "0.00"}</div>
                        <div className="mt-8 flex justify-between items-end">
                          <div className="text-[10px] font-bold opacity-70 uppercase tracking-widest">{stats?.wallet?.currency || "USD"}</div>
                          <button 
                            onClick={() => setShowPayoutModal(true)}
                            className="px-5 py-2.5 bg-white text-emerald-700 rounded-xl text-xs font-bold hover:bg-gray-100 transition shadow-sm"
                          >
                            Withdraw Now
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <div className="w-2 h-2 rounded-full bg-blue-500" /> Lifetime Earnings
                        </div>
                        <span className="font-bold text-gray-900">${stats?.revenue?.toFixed(2) || "0.00"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <div className="w-2 h-2 rounded-full bg-orange-500" /> Pending Approval
                        </div>
                        <span className="font-bold text-gray-900">$0.00</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Recent Orders & Alerts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                          <CheckCircle2 size={22} className="text-blue-600" /> Recent Sales
                        </h3>
                        <button onClick={() => setActiveTab("orders")} className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition">View All</button>
                      </div>
                      
                      {stats?.recentSales?.length > 0 ? (
                        <div className="space-y-4">
                          {stats.recentSales.map((sale, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100/50 hover:border-blue-100 transition">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-100 text-blue-600">
                                  <Truck size={22} />
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-gray-900">{sale.orderId}</div>
                                  <div className="text-xs text-gray-500 font-medium">{new Date(sale.createdAt).toLocaleDateString()}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-bold text-gray-900">${sale.total.toFixed(2)}</div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  sale.status === 'delivered' ? 'bg-green-50 text-green-600 border-green-100' : 
                                  'bg-blue-50 text-blue-600 border-blue-100'
                                }`}>
                                  {sale.status.toUpperCase()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-12 text-center text-gray-400 font-medium">No recent sales found.</div>
                      )}
                   </div>

                   <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                      <h3 className="font-bold text-gray-900 text-lg mb-8 flex items-center gap-2">
                        <AlertCircle size={22} className="text-orange-500" /> System Alerts
                      </h3>
                      <div className="space-y-4">
                        {stats?.products?.lowStock > 0 && (
                          <div className="flex items-start gap-4 p-5 bg-orange-50 rounded-2xl border border-orange-100">
                            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                              <Package size={20} />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-orange-800">Inventory Alert</div>
                              <p className="text-xs text-orange-700 mt-1">You have {stats.products.lowStock} products with low stock. Replenish soon to avoid losing sales.</p>
                              <button onClick={() => setActiveTab("products")} className="mt-3 text-[10px] font-bold uppercase tracking-wider text-orange-600 hover:underline">Update Stock</button>
                            </div>
                          </div>
                        )}
                        <div className="flex items-start gap-4 p-5 bg-blue-50 rounded-2xl border border-blue-100">
                          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                            <CreditCard size={20} />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-blue-800">Bank Verification</div>
                            <p className="text-xs text-blue-700 mt-1">Your payout account is verified. Next payout will be processed automatically on Monday.</p>
                          </div>
                        </div>
                      </div>
                   </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm"
                />
              </div>
              
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setShowForm(true);
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30"
              >
                <Plus size={20} /> Add New Product
              </button>
            </div>

            {productsLoading && products.length === 0 ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-24 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
              </div>
            ) : productsError ? (
              <ErrorMessage error={productsError} onRetry={refreshProducts} />
            ) : (
              <ProductTable 
                products={filteredProducts} 
                onEdit={(p) => {
                  setEditingProduct(p);
                  setShowForm(true);
                }} 
                onDelete={(id, name) => {
                  setDeletingId(id);
                  setDeletingName(name);
                }}
              />
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingBag size={24} className="text-blue-600" /> Order Management
              </h2>
              
              <div className="flex items-center gap-3">
                 <div className="relative">
                    <Filter className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <select 
                      value={orderFilter}
                      onChange={(e) => setOrderFilter(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 outline-none focus:ring-2 focus:ring-blue-500 transition appearance-none"
                    >
                      <option value="all">All Orders</option>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                 </div>
                 <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Order ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                 </div>
              </div>
            </div>
            
            {ordersLoading && orders.length === 0 ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
              </div>
            ) : ordersError ? (
              <ErrorMessage error={ordersError} onRetry={refreshOrders} />
            ) : (
              <OrderList 
                orders={filteredOrders} 
                onUpdateStatus={handleUpdateOrderStatus} 
              />
            )}
          </div>
        )}

        {/* Earnings Tab */}
        {activeTab === "earnings" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                   <div className="flex items-center justify-between mb-8">
                      <h3 className="text-lg font-bold text-gray-900">Payout Information</h3>
                      <button className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition">Edit Method</button>
                   </div>
                   <div className="space-y-6">
                      <div className="flex items-center justify-between p-6 bg-blue-50 rounded-2xl border border-blue-100">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
                            <Store size={24} />
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">Primary Bank</div>
                            <div className="text-gray-900 font-bold">Standard Chartered Bank</div>
                            <div className="text-xs text-gray-500 font-medium">•••• •••• •••• 4242</div>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 bg-green-100 text-green-600 text-[10px] font-bold rounded-full uppercase">Verified</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <PayoutDetail label="Account Holder" value={user.fullName} />
                        <PayoutDetail label="Payout Frequency" value="Weekly" />
                        <PayoutDetail label="Minimum Threshold" value="$50.00" />
                        <PayoutDetail label="Next Payout Date" value="May 5, 2026" />
                      </div>

                      <button 
                        onClick={() => setShowPayoutModal(true)}
                        className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                      >
                        <ArrowDownRight size={20} /> Request Instant Payout
                      </button>
                   </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                   <h3 className="text-lg font-bold text-gray-900 mb-8">Earnings History</h3>
                   <div className="space-y-4">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold text-xs">
                                PAY
                              </div>
                              <div>
                                <div className="text-sm font-bold text-gray-900">Payout #PAY-00{i}04</div>
                                <div className="text-xs text-gray-500 font-medium">April {10 + i}, 2026</div>
                              </div>
                           </div>
                           <div className="text-right">
                              <div className="text-sm font-bold text-emerald-600">+${(150 * i).toFixed(2)}</div>
                              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Completed</div>
                           </div>
                        </div>
                      ))}
                      <button className="w-full py-3 text-gray-400 text-xs font-bold uppercase tracking-wider hover:text-gray-600 transition border-t border-gray-50 mt-4">Load More History</button>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Payout Modal */}
      {showPayoutModal && (
        <Modal title="Withdraw Funds" onClose={() => setShowPayoutModal(false)}>
           <form onSubmit={handlePayout} className="space-y-6">
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 mb-6">
                <div className="text-xs text-emerald-600 font-bold uppercase mb-1">Available Balance</div>
                <div className="text-2xl font-bold text-emerald-700">${stats?.wallet?.balance?.toFixed(2) || "0.00"}</div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Amount to Withdraw</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">$</span>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    max={stats?.wallet?.balance}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold transition"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-2 font-medium">Funds will be transferred to your verified bank account ending in 4242.</p>
              </div>

              <button 
                type="submit"
                disabled={isProcessingPayout || !payoutAmount}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
              >
                {isProcessingPayout ? <Loader2 className="animate-spin" /> : <ArrowDownRight size={20} />}
                Confirm Withdrawal
              </button>
           </form>
        </Modal>
      )}

      {/* Product Form Modal */}
      {showForm && (
        <Modal title={editingProduct ? "Edit Product" : "Add New Product"} onClose={() => setShowForm(false)}>
          <ProductForm 
            onSubmit={handleFormSubmit}
            initialData={editingProduct}
            categories={categories}
            onCancel={() => setShowForm(false)}
          />
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal 
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        productName={deletingName}
        loading={isDeleting}
      />

      {/* Toast Notifications */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
}

// Sub-components for cleaner code
function TabButton({ active, onClick, icon, label }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition duration-300 ${
        active ? "bg-white text-blue-600 shadow-md scale-105" : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
      }`}
    >
      {icon} <span className="hidden lg:inline">{label}</span>
    </button>
  );
}

function PayoutDetail({ label, value }) {
  return (
    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</div>
      <div className="text-sm font-bold text-gray-900">{value}</div>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-10">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition">
            <X size={24} />
          </button>
        </div>
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

function ErrorMessage({ error, onRetry }) {
  return (
    <div className="p-16 text-center bg-red-50 rounded-3xl border border-red-100 shadow-sm animate-in zoom-in duration-300">
      <div className="w-20 h-20 bg-red-100 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
        <AlertCircle size={48} />
      </div>
      <h3 className="text-xl font-bold text-red-700 mb-2">Something went wrong</h3>
      <p className="text-red-600/70 mb-8 max-w-sm mx-auto font-medium">{error}</p>
      <button 
        onClick={onRetry} 
        className="px-8 py-3 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition shadow-lg shadow-red-500/20"
      >
        Try Again
      </button>
    </div>
  );
}
