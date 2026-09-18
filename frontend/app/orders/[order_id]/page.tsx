import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import OrderDetailsContent from "@/components/OrderDetailsContent";

interface OrderDetailsPageProps {
  params: Promise<{
    order_id: string;
  }>;
}

export default async function OrderDetailsPage({
  params,
}: OrderDetailsPageProps) {
  const { order_id } = await params;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <OrderDetailsContent orderId={order_id} />
      </div>
    </div>
  );
}