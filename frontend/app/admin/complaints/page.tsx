import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import AdminComplaintsContent from "@/components/AdminComplaintsContent";

export default function AdminComplaintsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">
        <Sidebar />
        <AdminComplaintsContent />
      </div>
    </div>
  );
}