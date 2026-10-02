import AdminSidebar from "@/components/AdminSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminSidebar />

        <main className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
