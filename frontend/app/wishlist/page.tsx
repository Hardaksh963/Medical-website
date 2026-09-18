import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import WishlistContent from "@/components/WishlistContent";

export default function WishlistPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">
        <Sidebar />
        <WishlistContent />
      </div>
    </div>
  );
}