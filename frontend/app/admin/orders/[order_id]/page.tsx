import Navbar from "@/components/Navbar";
import Sidebar from "@/components/AdminSidebar";
import AdminOrderDetailsContent from "@/components/AdminOrderDetailsContent";

export default async function AdminOrderDetailsPage({
  params,
}: {
  params: Promise<{ order_id: string }>;
}) {
  const { order_id } = await params;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">
        

        <AdminOrderDetailsContent orderId={order_id} />
      </div>
    </div>
  );
}