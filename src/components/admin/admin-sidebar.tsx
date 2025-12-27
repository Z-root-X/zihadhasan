"use client";

import { useState } from "react";
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
    Activity,
    ChevronLeft,
    ChevronRight,
    ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const sidebarItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Courses", href: "/dashboard/courses", icon: BookOpen },
    { label: "Events", href: "/dashboard/events", icon: Calendar },
    { label: "Projects", href: "/dashboard/projects", icon: FolderGit },
    { label: "AI Tools", href: "/dashboard/tools", icon: Hammer },
    { label: "Products", href: "/dashboard/products", icon: ShoppingBag },
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
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/login");
    };

    return (
        <motion.aside
            className="hidden relative flex-col border-r border-white/10 bg-black/50 backdrop-blur-xl md:flex"
            initial={{ width: 256 }}
            animate={{ width: isCollapsed ? 80 : 256 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            {/* Collapse Toggle */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-6 z-50 h-6 w-6 rounded-full border border-white/10 bg-black text-white hover:bg-zinc-800"
            >
                {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
            </Button>

            <div className={cn("flex h-16 items-center px-6 overflow-hidden", isCollapsed && "px-2 justify-center")}>
                <span className="text-xl font-bold tracking-tighter text-white whitespace-nowrap">
                    {isCollapsed ? "Z" : <>Zihad<span className="text-primary">.Admin</span></>}
                </span>
            </div>

            <nav className="flex-1 space-y-1 p-2">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center rounded-lg py-2.5 transition-all relative group overflow-hidden",
                                isCollapsed ? "justify-center px-2" : "px-4 gap-3",
                                isActive
                                    ? "bg-primary/10 text-primary shadow-[0_0_10px_rgba(59,130,246,0.1)]"
                                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                            {!isCollapsed && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-sm font-medium whitespace-nowrap"
                                >
                                    {item.label}
                                </motion.span>
                            )}
                            {isCollapsed && (
                                <div className="absolute left-14 hidden rounded-md bg-black border border-white/10 px-2 py-1 text-xs text-white group-hover:block z-50 whitespace-nowrap">
                                    {item.label}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-white/10 p-2">
                <Button
                    variant="ghost"
                    className={cn(
                        "w-full text-red-400 hover:bg-red-500/10 hover:text-red-300",
                        isCollapsed ? "justify-center px-0" : "justify-start gap-2"
                    )}
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && <span className="whitespace-nowrap">Sign Out</span>}
                </Button>
            </div>
        </motion.aside>
    );
}
