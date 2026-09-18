import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import AdminProductsContent from "@/components/AdminProductsContent";

export default function AdminProductsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">
        <Sidebar />
        <AdminProductsContent />
      </div>
    </div>
  );
}