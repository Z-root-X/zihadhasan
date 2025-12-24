"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { AdminSidebar } from "./admin-sidebar";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function MobileHeader() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    // Close sheet on route change
    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    return (
        <div className="flex h-16 items-center border-b border-white/10 bg-black/50 px-4 backdrop-blur-xl md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="mr-4 text-white hover:bg-white/10">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] border-r border-white/10 bg-black p-0">
                    {/* Reuse the logic from AdminSidebar but adapting styles if needed. 
                        Since AdminSidebar is "hidden md:flex", we can't just drop it in because of the hidden class.
                        We need to abstract the nav items or just render a mobile version here. 
                        For cleaner code, I will render a mobile specific sidebar content here using the same items.
                    */}
                    <MobileSidebarContent />
                </SheetContent>
            </Sheet>
            <span className="text-lg font-bold tracking-tighter text-white">
                Zihad<span className="text-primary">.Admin</span>
            </span>
        </div>
    );
}

// Duplicating logic temporarily to ensure self-contained component without refactoring AdminSidebar significantly right now.
// Ideally we would refactor AdminSidebar to export "SidebarContent".
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    FolderGit,
    Hammer,
    PenTool,
    Settings,
    LogOut,
    Calendar,
    Mail,
    Users,
    BookOpen
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

const sidebarItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Courses", href: "/dashboard/courses", icon: BookOpen },
    { label: "Projects", href: "/dashboard/projects", icon: FolderGit },
    { label: "AI Tools", href: "/dashboard/tools", icon: Hammer },
    { label: "Events", href: "/dashboard/events", icon: Calendar },
    { label: "Registrations", href: "/dashboard/registrations", icon: Users },
    { label: "Newsletter", href: "/dashboard/newsletter", icon: Mail },
    { label: "Messages", href: "/dashboard/messages", icon: Mail },
    { label: "Blog", href: "/dashboard/blog", icon: PenTool },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

function MobileSidebarContent() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/login");
    };

    return (
        <div className="flex h-full flex-col">
            <div className="flex h-16 items-center border-b border-white/10 px-6">
                <span className="text-xl font-bold tracking-tighter text-white">
                    Zihad<span className="text-primary">.Admin</span>
                </span>
            </div>

            <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                                isActive
                                    ? "bg-primary/10 text-primary shadow-[0_0_10px_rgba(59,130,246,0.1)]"
                                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-white/10 p-4">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </div>
    );
}
