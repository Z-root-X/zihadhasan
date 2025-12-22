"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading, isAdmin } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // Not logged in -> Login
                if (pathname !== "/login") router.push("/login");
            } else if (!isAdmin) {
                // Logged in but not admin -> Home (or 403 page)
                router.push("/");
            }
        }
    }, [user, loading, isAdmin, router, pathname]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black text-white">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user || !isAdmin) {
        return null; // Will redirect
    }

    return <>{children}</>;
}
