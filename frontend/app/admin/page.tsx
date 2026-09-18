import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import AdminDashboard from "@/components/AdminDashboard";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">
        <Sidebar />
        <AdminDashboard />
      </div>
    </div>
  );
}