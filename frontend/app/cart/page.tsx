import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import CartContent from "@/components/CartContent";

export default function CartPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">
        <Sidebar />
        <CartContent />
      </div>
    </div>
  );
}