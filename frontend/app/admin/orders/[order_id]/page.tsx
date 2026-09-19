import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
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
        <Sidebar />

        <AdminOrderDetailsContent orderId={order_id} />
      </div>
    </div>
  );
}