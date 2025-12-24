"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/shared/glass-card";
import {
    Hammer,
    FolderGit,
    Users,
    FileText,
    Settings,
    Download,
    BookOpen,
    Activity,
    GraduationCap,
    DollarSign
} from "lucide-react";
import Link from "next/link";
import { CMSService } from "@/lib/cms-service";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
    const [stats, setStats] = useState<{ alerts: any[], content: any[], community: any[] } | null>(null);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        async function loadStats() {
            try {
                // Parallel fetching for "Full Picture"
                const [projects, tools, blogs, registrations, users] = await Promise.all([
                    CMSService.getProjects(),
                    CMSService.getTools(),
                    CMSService.getPosts(false), // Fetch all posts (published & drafts)
                    CMSService.getAllRegistrations(),
                    CMSService.getUsers()
                ]);

                const pendingRegs = registrations.filter(r => r.status === "pending");
                const approvedRegs = registrations.filter(r => r.status === "approved");

                // Group 1: Action Required (High Priority)
                const alertStats = [
                    {
                        label: "Pending Verifications",
                        value: pendingRegs.length.toString(),
                        icon: Users,
                        color: "text-amber-400",
                        border: "border-amber-500/50",
                        bg: "bg-amber-500/10",
                        desc: pendingRegs.length > 0 ? "Action Required" : "All Clear"
                    },
                    {
                        label: "System Status",
                        value: "Online",
                        icon: Activity,
                        color: "text-emerald-400",
                        border: "border-emerald-500/50",
                        bg: "bg-emerald-500/10",
                        desc: "All systems operational"
                    }
                ];

                // Group 2: Content Overview
                const contentStats = [
                    { label: "Projects", value: projects.length, icon: FolderGit },
                    { label: "AI Tools", value: tools.length, icon: Hammer },
                    { label: "Blog Posts", value: blogs.length, icon: FileText },
                ];

                // Group 3: Community & Growth
                const communityStats = [
                    { label: "Total Users", value: users.length, icon: Users },
                    { label: "Total Students", value: approvedRegs.length, icon: GraduationCap },
                ];

                setStats({
                    alerts: alertStats,
                    content: contentStats,
                    community: communityStats
                });

            } catch (error) {
                console.error("Failed to load dashboard stats", error);
            }
        }
        loadStats();
    }, []);

    const handleDownloadCSV = async () => {
        setDownloading(true);
        try {
            const registrations = await CMSService.getAllRegistrations();

            // Convert to CSV
            const headers = ["ID", "Event ID", "Name", "Email", "Phone", "TrxID", "Status", "Registered At"];
            const rows = registrations.map(r => [
                r.id,
                r.eventId,
                r.name,
                r.email,
                r.phone || "",
                r.trxId || "",
                r.status,
                r.registeredAt?.toDate().toISOString() || ""
            ]);

            const csvContent = [
                headers.join(","),
                ...rows.map(r => r.join(","))
            ].join("\n");

            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `zihad_registrations_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Failed to download CSV", error);
            toast.error("Failed to download data.");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* SECTION 1: CRITICAL ALERTS */}
            <section>
                <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Priority Actions</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {!stats ? (
                        Array(2).fill(0).map((_, i) => (
                            <div key={i} className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-xl h-32 animate-pulse" />
                        ))
                    ) : (
                        stats.alerts.map((stat, i) => (
                            <GlassCard key={i} className={`p-6 border-l-4 ${stat.border} ${stat.bg}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-white/80">{stat.label}</p>
                                        <h3 className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</h3>
                                    </div>
                                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                                <p className="text-xs text-white/40 mt-2">{stat.desc}</p>
                            </GlassCard>
                        ))
                    )}
                </div>
            </section>

            {/* SECTION 2: CONTENT LIBRARY */}
            <section>
                <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Content Database</h2>
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
                    {!stats ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="h-20 rounded-xl border border-white/5 bg-white/5 animate-pulse" />
                        ))
                    ) : (
                        <>
                            {stats.content.map((stat, i) => (
                                <div key={i} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/5 p-4 hover:bg-white/10 transition-all">
                                    <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                        <stat.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                                    </div>
                                </div>
                            ))}
                            {stats.community.map((stat, i) => (
                                <div key={i} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/5 p-4 hover:bg-white/10 transition-all">
                                    <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                        <stat.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </section>

            {/* SECTION 3: QUICK ACTIONS & LIVE ACTIVITY */}
            <section>
                <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Command Center</h2>
                <div className="grid gap-6 md:grid-cols-2">
                    <GlassCard className="p-8">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <Link href="/dashboard/projects" className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-white/5 bg-white/5 p-6 transition-all hover:bg-white/10 hover:border-primary/50 text-center">
                                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                    <FolderGit className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-medium text-white group-hover:text-primary">Add Project</span>
                            </Link>
                            <Link href="/dashboard/tools" className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-white/5 bg-white/5 p-6 transition-all hover:bg-white/10 hover:border-primary/50 text-center">
                                <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                                    <Hammer className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-medium text-white group-hover:text-primary">Add AI Tool</span>
                            </Link>
                            <Link href="/dashboard/blog/create" className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-white/5 bg-white/5 p-6 transition-all hover:bg-white/10 hover:border-primary/50 text-center">
                                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-medium text-white group-hover:text-primary">Write Blog</span>
                            </Link>
                            <Link href="/dashboard/settings" className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-white/5 bg-white/5 p-6 transition-all hover:bg-white/10 hover:border-primary/50 text-center">
                                <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
                                    <Settings className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-medium text-white group-hover:text-primary">Global</span>
                            </Link>
                            <Link href="/dashboard/registrations" className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-white/5 bg-white/5 p-6 transition-all hover:bg-white/10 hover:border-primary/50 text-center">
                                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
                                    <Users className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-medium text-white group-hover:text-primary">Verify</span>
                            </Link>
                            <Link href="/dashboard/courses" className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-white/5 bg-white/5 p-6 transition-all hover:bg-white/10 hover:border-primary/50 text-center">
                                <div className="h-10 w-10 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                                    <BookOpen className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-medium text-white group-hover:text-primary">LMS</span>
                            </Link>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-white">Live Activity</h2>
                            <Button
                                variant="outline"
                                size="sm"
                                className="bg-white/5 border-white/10 text-white hover:bg-white/10 h-8 text-xs"
                                onClick={handleDownloadCSV}
                                disabled={downloading}
                            >
                                <Download className="mr-2 h-3 w-3" />
                                {downloading ? "..." : "Export"}
                            </Button>
                        </div>

                        <div className="space-y-0 relative">
                            <div className="absolute left-[19px] top-2 bottom-4 w-0.5 bg-white/10" />

                            <div className="relative flex items-start gap-4 pb-8 group">
                                <div className="z-10 mt-1 h-10 w-10 flex items-center justify-center rounded-full border border-green-500/30 bg-green-900/20 backdrop-blur-md shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                                    <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                                </div>
                                <div className="flex-1 rounded-xl bg-white/5 p-4 transition-colors group-hover:bg-white/10">
                                    <p className="text-sm font-medium text-white">System Online</p>
                                    <p className="text-xs text-green-400 mt-1">Ready for updates</p>
                                </div>
                            </div>

                            <div className="relative flex items-start gap-4 pb-0 group">
                                <div className="z-10 mt-1 h-10 w-10 flex items-center justify-center rounded-full border border-blue-500/30 bg-blue-900/20 backdrop-blur-md">
                                    <DollarSign className="h-4 w-4 text-blue-400" />
                                </div>
                                <div className="flex-1 rounded-xl bg-white/5 p-4 transition-colors group-hover:bg-white/10">
                                    <p className="text-sm font-medium text-white">Revenue Tracker</p>
                                    <p className="text-xs text-gray-400 mt-1">Manual Verification Active</p>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </section>
        </div>
    );
}
