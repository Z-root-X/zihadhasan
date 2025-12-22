"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/shared/glass-card";
import { Hammer, FolderGit, Users, ArrowUpRight, FileText, Settings, Download, DollarSign, BookOpen } from "lucide-react";
import Link from "next/link";
import { CMSService } from "@/lib/cms-service";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
    const [stats, setStats] = useState([
        { label: "Total Projects", value: "...", icon: FolderGit, change: "Live", gradient: "from-blue-600/20 to-cyan-500/20", border: "border-blue-500/20", text: "text-blue-400" },
        { label: "AI Tools", value: "...", icon: Hammer, change: "Curated", gradient: "from-purple-600/20 to-pink-500/20", border: "border-purple-500/20", text: "text-purple-400" },
        { label: "Pending Verifications", value: "...", icon: Users, change: "Requires Action", gradient: "from-amber-600/20 to-orange-500/20", border: "border-amber-500/20", text: "text-amber-400" },
    ]);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        async function loadStats() {
            try {
                // Parallel fetching for speed
                const [projects, tools, registrations] = await Promise.all([
                    CMSService.getProjects(),
                    CMSService.getTools(),
                    CMSService.getAllRegistrations()
                ]);

                const pendingEvents = registrations.filter(r => r.status === "pending").length;

                setStats([
                    {
                        label: "Total Projects",
                        value: projects.length.toString(),
                        icon: FolderGit,
                        change: "Live Portfolio",
                        gradient: "from-blue-600/20 to-cyan-500/20",
                        border: "border-blue-500/20",
                        text: "text-blue-400"
                    },
                    {
                        label: "AI Tools",
                        value: tools.length.toString(),
                        icon: Hammer,
                        change: "Curated List",
                        gradient: "from-purple-600/20 to-pink-500/20",
                        border: "border-purple-500/20",
                        text: "text-purple-400"
                    },
                    {
                        label: "Pending Verifications",
                        value: pendingEvents.toString(),
                        icon: Users,
                        change: pendingEvents > 0 ? "Action Required" : "All Clear",
                        gradient: "from-amber-600/20 to-orange-500/20",
                        border: "border-amber-500/20",
                        text: "text-amber-400"
                    },
                ]);
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
            alert("Failed to download data.");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-3">
                {stats.map((stat, i) => (
                    <div key={i} className={`relative overflow-hidden rounded-2xl border ${stat.border} bg-gradient-to-br ${stat.gradient} p-6 backdrop-blur-xl transition-all hover:scale-[1.02] hover:shadow-2xl`}>
                        <div className="flex items-center justify-between pb-4">
                            <span className="text-sm font-medium text-white/60">{stat.label}</span>
                            <div className={`rounded-lg bg-black/20 p-2 ${stat.text}`}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="text-4xl font-bold text-white tracking-tight">{stat.value}</div>
                        <p className={`mt-2 text-xs font-medium ${stat.text} flex items-center gap-1`}>
                            <ArrowUpRight className="h-3 w-3" /> {stat.change}
                        </p>
                    </div>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <GlassCard className="p-8">
                    <h2 className="text-xl font-bold text-white mb-6">Command Center</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/dashboard/projects" className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-white/5 bg-white/5 p-6 transition-all hover:bg-white/10 hover:border-primary/50">
                            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                <FolderGit className="h-6 w-6" />
                            </div>
                            <span className="font-medium text-white group-hover:text-primary">Add Project</span>
                        </Link>
                        <Link href="/dashboard/tools" className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-white/5 bg-white/5 p-6 transition-all hover:bg-white/10 hover:border-primary/50">
                            <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                                <Hammer className="h-6 w-6" />
                            </div>
                            <span className="font-medium text-white group-hover:text-primary">Add AI Tool</span>
                        </Link>
                        <Link href="/dashboard/blog/create" className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-white/5 bg-white/5 p-6 transition-all hover:bg-white/10 hover:border-primary/50">
                            <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                                <FileText className="h-6 w-6" />
                            </div>
                            <span className="font-medium text-white group-hover:text-primary">Write Blog</span>
                        </Link>
                        <Link href="/dashboard/settings" className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-white/5 bg-white/5 p-6 transition-all hover:bg-white/10 hover:border-primary/50">
                            <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
                                <Settings className="h-6 w-6" />
                            </div>
                            <span className="font-medium text-white group-hover:text-primary">Global Config</span>
                        </Link>
                        <Link href="/dashboard/registrations" className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-white/5 bg-white/5 p-6 transition-all hover:bg-white/10 hover:border-primary/50">
                            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
                                <Users className="h-6 w-6" />
                            </div>
                            <span className="font-medium text-white group-hover:text-primary">Registrations</span>
                        </Link>
                        <Link href="/dashboard/users" className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-white/5 bg-white/5 p-6 transition-all hover:bg-white/10 hover:border-primary/50">
                            <div className="h-12 w-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                <Users className="h-6 w-6" />
                            </div>
                            <span className="font-medium text-white group-hover:text-primary">User Directory</span>
                        </Link>
                        <Link href="/dashboard/courses" className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-white/5 bg-white/5 p-6 transition-all hover:bg-white/10 hover:border-primary/50">
                            <div className="h-12 w-12 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                                <BookOpen className="h-6 w-6" />
                            </div>
                            <span className="font-medium text-white group-hover:text-primary">LMS Builder</span>
                        </Link>
                    </div>
                </GlassCard>

                <GlassCard className="p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">Live Activity</h2>
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                            onClick={handleDownloadCSV}
                            disabled={downloading}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            {downloading ? "Exporting..." : "Export CSV"}
                        </Button>
                    </div>

                    <div className="space-y-0 relative">
                        {/* Timeline Line */}
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
                                <p className="text-sm font-medium text-white">Earnings Tracker</p>
                                <p className="text-xs text-gray-400 mt-1">Manual Verification Active</p>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
