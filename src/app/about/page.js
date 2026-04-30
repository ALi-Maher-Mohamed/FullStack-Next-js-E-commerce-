import { Sparkles, Users, Globe, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "About Us",
  description: "Learn more about ShopHub and our mission to provide the best e-commerce experience.",
};

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative py-24 bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&q=80" 
              alt="Team working" 
              className="w-full h-full object-cover"
            />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6">OUR MISSION.</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            We are dedicated to bridging the gap between premium quality and accessible pricing, creating a global marketplace where style meets substance.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-24">
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-black text-gray-900 mb-8 underline decoration-blue-600 decoration-8 underline-offset-8">THE SHOPHUB STORY</h2>
            <p className="text-gray-600 text-lg mb-6 leading-relaxed">
              Founded in 2024, ShopHub started with a simple observation: the online shopping experience felt cold and disconnected. We wanted to build something different—a platform that prioritizes human connection, seller empowerment, and curated quality.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              Today, we support thousands of independent sellers and serve a community of over 50,000 shoppers worldwide. Our commitment remains the same: transparency, security, and world-class design.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="rounded-3xl overflow-hidden h-64 translate-y-8">
                <img src="https://images.unsplash.com/photo-1556740758-90de374c12ad?w=600&q=80" className="w-full h-full object-cover" alt="Retail" />
             </div>
             <div className="rounded-3xl overflow-hidden h-64">
                <img src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=600&q=80" className="w-full h-full object-cover" alt="Payment" />
             </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 text-center mb-16">
          <h2 className="text-4xl font-black text-gray-900 mb-4">OUR CORE VALUES</h2>
          <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full" />
        </div>
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
           <div className="p-8 bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles size={32} />
              </div>
              <h3 className="font-black mb-3">QUALITY FIRST</h3>
              <p className="text-sm text-gray-500">Every product is vetted to meet our elite standards of excellence.</p>
           </div>
           <div className="p-8 bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all text-center">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users size={32} />
              </div>
              <h3 className="font-black mb-3">COMMUNITY</h3>
              <p className="text-sm text-gray-500">We empower sellers to build brands, not just list products.</p>
           </div>
           <div className="p-8 bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all text-center">
              <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Globe size={32} />
              </div>
              <h3 className="font-black mb-3">GLOBAL ACCESS</h3>
              <p className="text-sm text-gray-500">Seamless shipping to over 120 countries across the globe.</p>
           </div>
           <div className="p-8 bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all text-center">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={32} />
              </div>
              <h3 className="font-black mb-3">INTEGRITY</h3>
              <p className="text-sm text-gray-500">Honest pricing and radical transparency in everything we do.</p>
           </div>
        </div>
      </section>
    </div>
  );
}
