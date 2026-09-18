import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ComplaintsContent from "@/components/ComplaintsContent";

export default function ComplaintsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">
        <Sidebar />
        <ComplaintsContent />
      </div>
    </div>
  );
}