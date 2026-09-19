import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import AdminOrdersContent from "@/components/AdminOrdersContent";

export default function AdminOrdersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">
        <Sidebar />
        <AdminOrdersContent />
      </div>
    </div>
  );
}