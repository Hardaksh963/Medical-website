import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
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
        <Sidebar />

        <AdminProductEdit productId={product_id} />
      </div>
    </div>
  );
}