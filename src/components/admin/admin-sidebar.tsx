"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    FolderGit,
    Hammer,
    PenTool,
    Settings,
    LogOut,
    Menu,
    Calendar,
    Mail,
    Users,
    BookOpen,
    Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

const sidebarItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Courses", href: "/dashboard/courses", icon: BookOpen },
    { label: "Events", href: "/dashboard/events", icon: Calendar },
    { label: "Projects", href: "/dashboard/projects", icon: FolderGit },
    { label: "AI Tools", href: "/dashboard/tools", icon: Hammer },
    { label: "Blog", href: "/dashboard/blog", icon: PenTool },
    { label: "Registrations", href: "/dashboard/registrations", icon: Users },
    { label: "Users", href: "/dashboard/users", icon: Users },
    { label: "Newsletter", href: "/dashboard/newsletter", icon: Mail },
    { label: "Messages", href: "/dashboard/messages", icon: Mail },
    { label: "System", href: "/dashboard/system", icon: Activity },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/login");
    };

    return (
        <aside className="hidden h-screen w-64 flex-col border-r border-white/10 bg-black/50 backdrop-blur-xl md:flex">
            <div className="flex h-16 items-center border-b border-white/10 px-6">
                <span className="text-xl font-bold tracking-tighter text-white">
                    Zihad<span className="text-primary">.Admin</span>
                </span>
            </div>

            <nav className="flex-1 space-y-1 p-4">
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
        </aside>
    );
}
