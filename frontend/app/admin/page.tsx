import Navbar from "@/components/Navbar";
import Sidebar from "@/components/AdminSidebar";
import AdminDashboard from "@/components/AdminDashboard";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">
        <AdminDashboard />
      </div>
    </div>
  );
}