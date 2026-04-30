import Link from "next/link";
import { ArrowRight, ShoppingBag, Zap, Shield, Truck, Star, Sparkles, TrendingUp, Gift } from "lucide-react";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import Category from "@/models/Category";

async function getHomeData() {
  try {
    await dbConnect();
    const featuredProducts = await Product.find({ isFeatured: true, status: "active" })
      .limit(4)
      .populate("category", "name")
      .lean();
      
    const categories = await Category.find({ isActive: true }).limit(6).lean();
    
    return {
      featuredProducts: JSON.parse(JSON.stringify(featuredProducts)),
      categories: JSON.parse(JSON.stringify(categories)),
    };
  } catch (error) {
    console.error("Error fetching home data:", error);
    return { featuredProducts: [], categories: [] };
  }
}

export default async function Home() {
  const { featuredProducts, categories } = await getHomeData();

  return (
    <div className="flex flex-col gap-0 overflow-hidden">
      {/* 🚀 HERO SECTION: The WOW factor */}
      <section className="relative min-h-[90vh] flex items-center pt-20 bg-[#0a0a0b]">
        {/* Background blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse" />

        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="text-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-bold mb-6 animate-fade-in">
              <Sparkles size={16} /> New Season Arrivals are here
            </div>
            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tight">
              LIMITLESS <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">STYLE.</span>
            </h1>
            <p className="text-xl text-gray-400 mb-10 max-w-lg leading-relaxed">
              Elevate your daily routine with curated premium tech, fashion, and home essentials designed for the modern lifestyle.
            </p>
            <div className="flex flex-wrap gap-5">
              <Link
                href="/products"
                className="px-10 py-5 bg-white text-black rounded-2xl font-black hover:bg-blue-500 hover:text-white transition-all duration-300 hover:scale-105 flex items-center gap-3 shadow-2xl shadow-white/5"
              >
                Shop Collection <ArrowRight size={20} />
              </Link>
              <Link
                href="/register"
                className="px-10 py-5 bg-white/5 backdrop-blur-xl text-white border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all active:scale-95"
              >
                Start Selling
              </Link>
            </div>
            
            <div className="mt-16 flex items-center gap-8 border-t border-white/10 pt-8">
              <div>
                <div className="text-3xl font-black">50k+</div>
                <div className="text-gray-500 text-xs font-bold uppercase tracking-widest">Active Users</div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <div className="text-3xl font-black">200+</div>
                <div className="text-gray-500 text-xs font-bold uppercase tracking-widest">Premium Brands</div>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
             <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700 aspect-[4/5] border border-white/10">
                <img 
                  src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80" 
                  className="w-full h-full object-cover" 
                  alt="Product Hero"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20">
                   <div className="text-white font-bold text-lg mb-1">Modern Minimalist Watch</div>
                   <div className="text-blue-400 font-black text-xl">$149.00</div>
                </div>
             </div>
             {/* Floating badge */}
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600 rounded-full flex flex-col items-center justify-center text-white border-8 border-[#0a0a0b] rotate-12 animate-bounce">
                <div className="text-sm font-bold uppercase">Sale</div>
                <div className="text-3xl font-black">30%</div>
                <div className="text-[10px] font-bold uppercase">Off now</div>
             </div>
          </div>
        </div>
      </section>

      {/* 📦 CATEGORIES SECTION */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div className="max-w-xl">
              <h2 className="text-4xl font-black text-gray-900 mb-4 flex items-center gap-3">
                <TrendingUp className="text-blue-600" /> Browse by Category
              </h2>
              <p className="text-gray-500 font-medium">Explore our diverse ranges of high-quality products curated just for you.</p>
            </div>
            <Link href="/products" className="group text-blue-600 font-bold flex items-center gap-2 hover:translate-x-2 transition-transform">
              Explore All <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((cat) => (
              <Link 
                key={cat._id} 
                href={`/products?category=${cat._id}`}
                className="group relative h-48 rounded-3xl overflow-hidden border border-gray-100 flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-600 transition-all duration-500"
              >
                <div className="text-4xl mb-3 group-hover:scale-125 group-hover:-rotate-12 transition-transform duration-500">
                  {/* Category Icons (Fallback if no icon field) */}
                  {cat.icon || "📦"}
                </div>
                <h3 className="font-black text-gray-800 group-hover:text-white transition-colors">{cat.name}</h3>
                <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-10 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ✨ FEATURED PRODUCTS SECTION */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-gray-900 mb-4">Curated Highlights</h2>
            <div className="w-24 h-1.5 bg-blue-600 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <div key={product._id} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 p-3">
                <Link href={`/products/${product._id}`} className="block relative h-72 mb-4 overflow-hidden rounded-2xl bg-gray-50">
                  <img 
                    src={product.images?.[0]?.url || "/placeholder.png"} 
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {product.discount?.active && (
                    <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                      {product.discount.value}% OFF
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="px-6 py-2 bg-white text-black font-black rounded-xl translate-y-4 group-hover:translate-y-0 transition-transform">
                      View Details
                    </div>
                  </div>
                </Link>
                <div className="px-2 pb-4">
                  <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{product.category?.name}</div>
                  <h3 className="font-bold text-gray-800 mb-3 truncate">{product.title}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-gray-900">${product.salePrice?.toFixed(2) || product.price?.toFixed(2)}</span>
                      {product.salePrice < product.price && (
                        <span className="text-xs text-gray-400 line-through font-bold">${product.price?.toFixed(2)}</span>
                      )}
                    </div>
                    <button className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-blue-600 hover:text-white transition-all">
                       <ShoppingBag size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🛡️ TRUST SECTION */}
      <section className="py-20 bg-white border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform shadow-xl shadow-blue-500/5">
                <Truck size={32} />
              </div>
              <h3 className="text-lg font-black mb-2 uppercase tracking-wide">Elite Shipping</h3>
              <p className="text-gray-500 text-sm font-medium">Free express delivery on all orders exceeding $150.</p>
            </div>
            <div className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-green-50 text-green-600 rounded-[2rem] flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform shadow-xl shadow-green-500/5">
                <Shield size={32} />
              </div>
              <h3 className="text-lg font-black mb-2 uppercase tracking-wide">Secure Vault</h3>
              <p className="text-gray-500 text-sm font-medium">Your data is armored with 256-bit military encryption.</p>
            </div>
            <div className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-purple-50 text-purple-600 rounded-[2rem] flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform shadow-xl shadow-purple-500/5">
                <Zap size={32} />
              </div>
              <h3 className="text-lg font-black mb-2 uppercase tracking-wide">Instant Support</h3>
              <p className="text-gray-500 text-sm font-medium">Concierge service available 24/7 for all your needs.</p>
            </div>
            <div className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-[2rem] flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform shadow-xl shadow-amber-500/5">
                <Gift size={32} />
              </div>
              <h3 className="text-lg font-black mb-2 uppercase tracking-wide">Loyalty Rewards</h3>
              <p className="text-gray-500 text-sm font-medium">Earn points on every purchase and unlock exclusive deals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 📧 NEWSLETTER */}
      <section className="py-24 bg-[#0a0a0b] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
             <div className="inline-block px-4 py-2 bg-blue-600/20 text-blue-400 rounded-full font-black text-xs uppercase tracking-widest mb-6">VIP Newsletter</div>
             <h2 className="text-5xl md:text-6xl font-black text-white mb-8">GET 15% OFF YOUR <br />FIRST ORDER.</h2>
             <p className="text-gray-500 text-xl mb-12 max-w-2xl mx-auto">Join our elite circle of insiders and receive early access to drops, secret sales, and curated lifestyle content.</p>
             <form className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="flex-grow px-8 py-5 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-600 transition-all font-bold placeholder:text-gray-600"
                />
                <button className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-2xl shadow-blue-600/20 active:scale-95">
                  Unlock Offer
                </button>
             </form>
          </div>
        </div>
      </section>
    </div>
  );
}
