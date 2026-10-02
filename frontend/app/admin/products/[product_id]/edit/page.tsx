import Navbar from "@/components/Navbar";
import Sidebar from "@/components/AdminSidebar";
import AdminProductEdit from "@/components/AdminProductEdit";

export default async function EditAdminProductPage({
  params,
}: {
  params: Promise<{ product_id: string }>;
}) {
  const { product_id } = await params;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">

        <AdminProductEdit productId={product_id} />
      </div>
    </div>
  );
}