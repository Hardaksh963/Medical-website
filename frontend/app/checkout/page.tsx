import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import CheckoutContent from "@/components/CheckoutContent";

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">
        <Sidebar />
        <CheckoutContent />
      </div>
    </div>
  );
}