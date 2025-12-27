"use client";

import { AuthGuard } from "@/components/admin/auth-guard";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { MobileHeader } from "@/components/admin/mobile-header";
import { AnimatePresence, motion } from "framer-motion";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard>
            <div className="flex min-h-screen bg-black text-white selection:bg-primary/30">
                <AdminSidebar />
                <div className="flex-1 flex flex-col min-h-screen">
                    <MobileHeader />
                    <main className="flex-1 overflow-y-auto max-h-[calc(100vh-4rem)] md:max-h-screen">
                        <div className="p-4 md:p-8 lg:p-10 max-w-7xl mx-auto space-y-8">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {children}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </main>
                </div>
            </div>
        </AuthGuard>
    );
}
