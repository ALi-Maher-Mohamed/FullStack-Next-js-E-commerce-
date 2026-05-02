import { DollarSign, ShoppingBag, Package, AlertTriangle } from "lucide-react";

export default function StatsCards({ stats }) {
  if (!stats) return null;

  const cards = [
    {
      title: "Total Revenue",
      value: `$${stats.revenue.toLocaleString()}`,
      icon: <DollarSign className="text-emerald-600" size={24} />,
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
    {
      title: "Total Orders",
      value: stats.orders.total,
      icon: <ShoppingBag className="text-blue-600" size={24} />,
      bg: "bg-blue-50",
      border: "border-blue-100",
    },
    {
      title: "Active Products",
      value: stats.products.total,
      icon: <Package className="text-purple-600" size={24} />,
      bg: "bg-purple-50",
      border: "border-purple-100",
    },
    {
      title: "Low Stock",
      value: stats.products.lowStock,
      icon: <AlertTriangle className="text-orange-600" size={24} />,
      bg: "bg-orange-50",
      border: "border-orange-100",
      urgent: stats.products.lowStock > 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`bg-white p-6 rounded-2xl border ${card.border} shadow-sm transition-all hover:shadow-md`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center`}>
              {card.icon}
            </div>
            {card.urgent && (
              <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
            )}
          </div>
          <div className="text-2xl font-bold text-gray-900">{card.value}</div>
          <div className="text-xs text-gray-400 font-bold uppercase tracking-tight mt-1">
            {card.title}
          </div>
        </div>
      ))}
    </div>
  );
}
