import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import ProductGallery from "@/components/products/ProductGallery";

export const metadata = {
  title: "Shop All Products | ShopHub",
  description: "Browse our extensive collection of premium products at unbeatable prices.",
};

// This is a Server Component
export default async function ProductsPage() {
  try {
    await dbConnect();
    
    // Initial fetch for the first page
    // We fetch a bit more than a single page to show there's data
    const initialProducts = await Product.find({ status: "active" })
      .populate("category", "name slug")
      .populate("seller", "firstName lastName storeName")
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();

    // Serialize MongoDB objects for the Client Component
    const serializedProducts = JSON.parse(JSON.stringify(initialProducts));

    return (
      <div className="bg-gray-50 min-h-screen pt-4">
        <ProductGallery initialProducts={serializedProducts} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching products in server component:", error);
    // Fallback to client-side only if server-side fails
    return (
      <div className="bg-gray-50 min-h-screen pt-4">
        <ProductGallery />
      </div>
    );
  }
}
