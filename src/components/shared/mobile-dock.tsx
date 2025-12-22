"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    Home,
    BookOpen,
    Wrench,
    Layers,
    FileText,
    Mail,
    Calendar,
} from "lucide-react";
import { CMSService } from "@/lib/cms-service";
import { useAuth } from "@/components/auth/auth-provider";

const navItems = [
    { name: "Home", href: "/", icon: Home, feature: null },
    { name: "Courses", href: "/courses", icon: BookOpen, feature: null },
    { name: "Projects", href: "/projects", icon: Layers, feature: "showProjects" },
    { name: "Tools", href: "/tools", icon: Wrench, feature: "showTools" },
    { name: "Blog", href: "/blog", icon: FileText, feature: "showBlog" },
    // { name: "Contact", href: "/contact", icon: Mail, feature: null },
    { name: "Events", href: "/events", icon: Calendar, feature: "showEvents" },
];

export function MobileDock() {
    const pathname = usePathname();
    const { user, openAuthModal } = useAuth();
    const [items, setItems] = useState(navItems);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Hide dock when scrolling down, show when scrolling up
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    useEffect(() => {
        CMSService.getGlobalSettings().then((data) => {
            if (data?.features) {
                const f = data.features;
                const filtered = navItems.filter((item) => {
                    if (!item.feature) return true;
                    // @ts-ignore
                    return f[item.feature] !== false;
                });
                setItems(filtered);
            }
        });
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 md:hidden pointer-events-none">
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-white/10 bg-black/40 p-2 backdrop-blur-xl shadow-2xl ring-1 ring-white/5"
                    >
                        {items.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300",
                                        isActive
                                            ? "bg-primary/20 text-primary"
                                            : "text-white/60 hover:bg-white/10 hover:text-white"
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-dock-indicator"
                                            className="absolute -bottom-1 h-1 w-1 rounded-full bg-primary"
                                        />
                                    )}
                                </Link>
                            );
                        })}

                        {/* Profile / Login Button */}
                        <button
                            onClick={() => {
                                if (user) {
                                    // Link to profile/dashboard
                                    window.location.href = "/my-account";
                                } else {
                                    openAuthModal();
                                }
                            }}
                            className={cn(
                                "relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 text-white/60 hover:bg-white/10 hover:text-white"
                            )}
                        >
                            <div className="h-6 w-6 rounded-full overflow-hidden border border-white/20">
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt="User" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                                        {user ? user.email?.[0].toUpperCase() : "In"}
                                    </div>
                                )}
                            </div>
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
