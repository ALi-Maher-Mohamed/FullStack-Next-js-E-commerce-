import Link from "next/link";
import { ArrowRight, Zap, Shield, Truck, Star, ShoppingCart } from "lucide-react";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";

export const metadata = {
  title: "ShopHub - Premium E-commerce Experience",
  description: "Discover curated premium products with worldwide shipping and secure payments.",
};

async function getFeaturedProducts() {
  try {
    await dbConnect();
    const products = await Product.find({ isFeatured: true, status: "active" })
      .limit(4)
      .lean();
    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <div className="flex flex-col gap-0">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80" 
            alt="Hero Background" 
            className="w-full h-full object-cover brightness-50"
          />
        </div>
        <div className="container mx-auto px-4 z-10 text-white">
          <div className="max-w-2xl">
            <h1 className="text-6xl font-extrabold mb-6 leading-tight animate-fade-in">
              Elevate Your <span className="text-blue-400">Lifestyle</span> With ShopHub
            </h1>
            <p className="text-xl mb-10 text-gray-200 leading-relaxed">
              Experience the pinnacle of online shopping with our curated collection of premium gadgets, accessories, and home essentials.
            </p>
            <div className="flex gap-4">
              <Link
                href="/products"
                className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all hover:scale-105 flex items-center gap-2 shadow-lg shadow-blue-500/30"
              >
                Shop Now <ArrowRight size={20} />
              </Link>
              <Link
                href="/register"
                className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full font-bold hover:bg-white/20 transition-all"
              >
                Join Community
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-bold mb-2">Featured Products</h2>
                <p className="text-gray-600">Our hand-picked selections for you this week.</p>
              </div>
              <Link href="/products" className="text-blue-600 font-semibold hover:underline flex items-center gap-1">
                View All <ArrowRight size={16} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <div key={product._id} className="group bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-xl transition-all hover:-translate-y-1">
                  <Link href={`/products/${product._id}`} className="block relative h-64 mb-4 overflow-hidden rounded-xl bg-gray-50">
                    <img 
                      src={product.images?.[0]?.url || "/placeholder.png"} 
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {product.discount > 0 && (
                      <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                        -{product.discount}%
                      </span>
                    )}
                  </Link>
                  <h3 className="font-bold text-gray-800 mb-2 truncate">{product.title}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl font-bold text-blue-600">${product.salePrice?.toFixed(2) || product.price?.toFixed(2)}</span>
                    {product.salePrice && <span className="text-sm text-gray-400 line-through">${product.price?.toFixed(2)}</span>}
                  </div>
                  <Link 
                    href={`/products/${product._id}`}
                    className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition-colors flex items-center justify-center gap-2"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust Badges */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                <Truck size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Fast & Free Shipping</h3>
              <p className="text-blue-100">Enjoy free delivery on all orders over $100 with real-time tracking.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                <Shield size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Secure Payments</h3>
              <p className="text-blue-100">Your transactions are protected by industry-leading 256-bit encryption.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                <Zap size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">24/7 Support</h3>
              <p className="text-blue-100">Our dedicated support team is here to help you at any time of the day.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter / CTA */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">Subscribe to our newsletter</h2>
            <p className="text-gray-600 mb-10 text-lg">Get the latest updates on new arrivals, exclusive offers, and shopping tips delivered straight to your inbox.</p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-grow px-6 py-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
              <button className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 whitespace-nowrap">
                Subscribe Now
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
