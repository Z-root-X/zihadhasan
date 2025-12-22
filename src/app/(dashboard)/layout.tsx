"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { Loader2 } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading, openAuthModal } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            // Not logged in: Redirect home and open login
            router.replace("/");
            // Use timeout to allow redirect to start before modal logic (or running immediately is fine)
            // But main issue: triggering modal on Home after redirect. 
            // Better: Show a "Restricted Access" screen with "Login" button here instead of auto-redirecting which can be jarring.
            // AND/OR: automatically open the modal.
            setTimeout(() => openAuthModal(), 500);
        }
    }, [user, loading, router, openAuthModal]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect/open modal
    }

    return (
        <div className="flex min-h-screen flex-col relative bg-black selection:bg-primary/20">
            {/* Shared Background Texture */}
            <div className="noise-bg opacity-50" />

            <Navbar />

            <main className="flex-1 w-full max-w-7xl mx-auto pt-24 pb-12 px-4 sm:px-6">
                {children}
            </main>

            <Footer />
        </div>
    );
}
