import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ComplaintDetailsContent from "@/components/ComplaintDetailsContent";

export default async function ComplaintDetailsPage({
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

        <ComplaintDetailsContent complaintId={complaint_id} />
      </div>
    </div>
  );
}