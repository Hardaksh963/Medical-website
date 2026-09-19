import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import NotificationsContent from "@/components/NotificationsContent";

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">
        <Sidebar />
        <NotificationsContent />
      </div>
    </div>
  );
}