import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import AdminComplaintDetailsContent from "@/components/AdminComplaintDetailsContent";

export default async function AdminComplaintDetailsPage({
  params,
}: {
  params: Promise<{ complaint_id: string }>;
}) {
  const { complaint_id } = await params;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <AdminComplaintDetailsContent
          complaintId={complaint_id}
        />
      </div>
    </div>
  );
}