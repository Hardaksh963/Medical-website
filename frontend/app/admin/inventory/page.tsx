import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import AdminInventoryContent from "@/components/AdminInventoryContent";

export default function AdminInventoryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">
        <Sidebar />
        <AdminInventoryContent />
      </div>
    </div>
  );
}