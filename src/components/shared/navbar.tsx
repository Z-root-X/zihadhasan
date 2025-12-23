"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { CMSService } from "@/lib/cms-service";
import { useAuth } from "@/components/auth/auth-provider";
import { User as UserIcon } from "lucide-react";
import { NotificationBell } from "@/components/shared/notification-bell";
import { SearchCommand } from "@/components/shared/search-command";
import { Search } from "lucide-react";

const baseNavItems = [
    { name: "Home", href: "/", feature: null },
    { name: "Courses", href: "/courses", feature: null },
    { name: "Tools", href: "/tools", feature: "showTools" },
    { name: "Projects", href: "/projects", feature: "showProjects" },
    { name: "Blog", href: "/blog", feature: "showBlog" },
    { name: "Contact", href: "/contact", feature: null },
];

export function Navbar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [navItems, setNavItems] = useState(baseNavItems);
    const [showEvents, setShowEvents] = useState(true);
    const { user, profile, openAuthModal } = useAuth();

    const [hasPending, setHasPending] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);

        // Fetch Feature Flags
        CMSService.getGlobalSettings().then(data => {
            if (data?.features) {
                const f = data.features;
                setShowEvents(f.showEvents);

                const filtered = baseNavItems.filter(item => {
                    if (!item.feature) return true;
                    // @ts-ignore
                    return f[item.feature] !== false;
                });
                setNavItems(filtered);
            }
        });

        // Check for pending registrations (Notification Dot)
        if (user) {
            CMSService.getRegistrationsByUser(user.uid).then(regs => {
                const pending = regs.some(r => r.status === 'pending');
                setHasPending(pending);
            }).catch(console.error);
        }

        return () => window.removeEventListener("scroll", handleScroll);
    }, [user]);

    return (
        <header
            className={cn(
                "fixed top-0 z-50 w-full transition-all duration-300",
                scrolled ? "py-4" : "py-6"
            )}
        >
            <div className="container mx-auto px-4">
                <div
                    className={cn(
                        "relative mx-auto flex items-center justify-between rounded-full border border-white/10 px-6 py-3 transition-all duration-300",
                        scrolled
                            ? "bg-black/40 backdrop-blur-xl sm:w-full md:max-w-4xl"
                            : "bg-transparent border-transparent"
                    )}
                >
                    {/* Logo */}
                    <Link href="/" className="text-xl font-bold tracking-tighter text-white">
                        ZH<span className="text-primary">.</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-primary",
                                    pathname === item.href ? "text-primary" : "text-white/70"
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* CTA & Auth */}
                    <div className="hidden md:flex items-center gap-4">
                        <button
                            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm text-muted-foreground hover:bg-white/10 hover:text-white transition-colors group"
                        >
                            <Search className="h-3.5 w-3.5 group-hover:text-primary transition-colors" />
                            <span className="text-xs">Search...</span>
                            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                <span className="text-xs">⌘</span>K
                            </kbd>
                        </button>
                        {user ? (
                            <div className="flex items-center gap-3">
                                <NotificationBell />
                                <Link href="/my-account" className="flex items-center gap-2 group">
                                    <div className="h-9 w-9 rounded-full bg-white/10 overflow-hidden border border-white/20 group-hover:border-primary/50 transition-colors relative">
                                        {profile?.photoURL ? (
                                            <img src={profile.photoURL} alt="Profile" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center">
                                                <UserIcon className="h-5 w-5 text-white/70" />
                                            </div>
                                        )}
                                        {/* Red Dot for Pending Verification */}
                                        {hasPending && (
                                            <div className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 rounded-full border border-black" title="Pending Action" />
                                        )}
                                    </div>
                                </Link>
                            </div>
                        ) : (
                            <Button
                                variant="ghost"
                                className="text-white hover:text-primary hover:bg-white/5 disabled:opacity-50"
                                onClick={openAuthModal}
                            >
                                Sign In
                            </Button>
                        )}

                        {showEvents && (
                            <Button
                                variant="outline"
                                className="rounded-full border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary-foreground backdrop-blur-sm"
                                asChild
                            >
                                <Link href="/events">Events</Link>
                            </Button>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden text-white"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {/* Mobile Nav Overlay */}
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute left-0 right-0 top-full mt-2 mx-4 rounded-3xl border border-white/10 bg-black/90 p-6 backdrop-blur-3xl md:hidden"
                    >
                        <nav className="flex flex-col gap-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="text-lg font-medium text-white/80 hover:text-primary transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            {showEvents && (
                                <Link
                                    href="/events"
                                    className="text-lg font-medium text-primary"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Events
                                </Link>
                            )}
                        </nav>
                    </motion.div>
                )}
            </div>
            <SearchCommand />
        </header>
    );
}
