import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from "lucide-react";

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with the ShopHub team for any inquiries or support.",
};

export default function ContactPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="py-24 bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">GET IN TOUCH.</h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium">
            Have a question? Our world-class support team is here to help you 24/7.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            
            {/* Contact Info */}
            <div className="space-y-12 lg:col-span-1">
               <div>
                  <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                     <Clock className="text-blue-600" /> SUPPORT HOURS
                  </h2>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                        <span className="font-bold text-gray-600">Monday - Friday</span>
                        <span className="font-black text-gray-900">24 Hours</span>
                     </div>
                     <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                        <span className="font-bold text-gray-600">Saturday</span>
                        <span className="font-black text-gray-900">09:00 - 18:00</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-600">Sunday</span>
                        <span className="font-black text-gray-900">Closed</span>
                     </div>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="flex items-start gap-5 p-6 bg-gray-50 rounded-3xl group hover:bg-blue-600 transition-all duration-300">
                     <div className="p-3 bg-white text-blue-600 rounded-2xl group-hover:text-blue-600 group-hover:bg-white transition-colors shadow-sm">
                        <Mail size={24} />
                     </div>
                     <div>
                        <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 group-hover:text-blue-200">Email Us</div>
                        <div className="font-black text-gray-900 group-hover:text-white">support@shophub.com</div>
                     </div>
                  </div>

                  <div className="flex items-start gap-5 p-6 bg-gray-50 rounded-3xl group hover:bg-blue-600 transition-all duration-300">
                     <div className="p-3 bg-white text-blue-600 rounded-2xl group-hover:text-blue-600 group-hover:bg-white transition-colors shadow-sm">
                        <Phone size={24} />
                     </div>
                     <div>
                        <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 group-hover:text-blue-200">Call Us</div>
                        <div className="font-black text-gray-900 group-hover:text-white">+1 (800) 123-4567</div>
                     </div>
                  </div>

                  <div className="flex items-start gap-5 p-6 bg-gray-50 rounded-3xl group hover:bg-blue-600 transition-all duration-300">
                     <div className="p-3 bg-white text-blue-600 rounded-2xl group-hover:text-blue-600 group-hover:bg-white transition-colors shadow-sm">
                        <MapPin size={24} />
                     </div>
                     <div>
                        <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 group-hover:text-blue-200">Visit Us</div>
                        <div className="font-black text-gray-900 group-hover:text-white">123 Commerce St, NY 10001</div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2 bg-white rounded-[3rem] shadow-2xl shadow-blue-500/5 border border-gray-100 p-12 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[80px] rounded-full" />
               
               <h2 className="text-3xl font-black mb-8 flex items-center gap-3 relative z-10">
                  <MessageSquare className="text-blue-600" /> SEND A MESSAGE
               </h2>

               <form className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                  <div className="space-y-2">
                     <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                     <input type="text" placeholder="John Doe" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all font-bold" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                     <input type="email" placeholder="john@example.com" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all font-bold" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                     <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Subject</label>
                     <input type="text" placeholder="How can we help?" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all font-bold" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                     <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Your Message</label>
                     <textarea rows={5} placeholder="Describe your inquiry..." className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all font-bold resize-none"></textarea>
                  </div>
                  <div className="md:col-span-2 pt-4">
                     <button className="w-full md:w-auto px-12 py-5 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 group">
                        Send Message <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                     </button>
                  </div>
               </form>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
