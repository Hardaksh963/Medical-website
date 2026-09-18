import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import AdminProductForm from "@/components/AdminProductForm";

export default function NewAdminProductPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">
        <Sidebar />
        <AdminProductForm />
      </div>
    </div>
  );
}