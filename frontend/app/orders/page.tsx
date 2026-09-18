import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import OrdersContent from "@/components/OrdersContent";

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">
        <Sidebar />
        <OrdersContent />
      </div>
    </div>
  );
}