import { AuthGuard } from "@/components/admin/auth-guard";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard>
            <div className="flex min-h-screen bg-black text-white selection:bg-primary/30">
                <AdminSidebar />
                <main className="flex-1 overflow-y-auto max-h-screen">
                    {/* Header for Mobile could go here */}
                    <div className="p-4 md:p-8 lg:p-10 max-w-7xl mx-auto space-y-8">
                        {children}
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
