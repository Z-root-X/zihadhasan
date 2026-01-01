"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Database, Trash2, RefreshCw, HardDrive, Activity, Users, Box, FileText, ShoppingBag, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { getSystemStats, cleanupSoftDeletedItems } from "@/actions/system";
import { GlassCard } from "@/components/shared/glass-card";
import { Switch } from "@/components/ui/switch";
import { CMSService } from "@/lib/cms-service";

export default function SystemHealthPage() {
    const [stats, setStats] = useState<{
        storage: { used: number; limit: number };
        firebase: {
            reads: string;
            writes: string;
            status: string;
            details?: Record<string, number>;
        };
        trash: number;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [cleaning, setCleaning] = useState(false);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setLoading(true);
        try {
            const [data, settings] = await Promise.all([
                getSystemStats(),
                CMSService.getGlobalSettings()
            ]);
            setStats({ ...data, features: settings?.features } as any);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load system stats.");
        } finally {
            setLoading(false);
        }
    };

    const handleCleanup = async () => {
        if (!stats?.trash) {
            toast.info("No items to clean up.");
            return;
        }

        if (!confirm(`Are you sure you want to permanently delete ${stats.trash} items? This cannot be undone.`)) return;

        setCleaning(true);
        try {
            const result = await cleanupSoftDeletedItems();
            if (result.success) {
                toast.success(`Cleanup complete. Removed ${result.count} items.`);
                loadStats(); // Refresh
            } else {
                toast.error("Cleanup failed.");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred during cleanup.");
        } finally {
            setCleaning(false);
        }
    };

    return (
        <div className="space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white hover:text-primary transition-colors">System Health</h2>
                    <p className="text-muted-foreground">Monitor storage, database usage, and perform maintenance.</p>
                </div>
                <Button onClick={loadStats} variant="outline" className="gap-2 border-white/10 hover:bg-white/5">
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>



            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Feature Control - NEW */}
                <GlassCard className="p-6 md:col-span-3">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2 mb-6">
                        <div className="flex items-center gap-2">
                            <Box className="h-5 w-5 text-blue-400" />
                            <span className="font-bold text-lg text-white">Visibility Control</span>
                        </div>
                        <Badge variant="outline" className="border-blue-500/50 text-blue-400">Settings</Badge>
                    </div>

                    {stats ? (
                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                { key: "showProjects", label: "Projects Section", desc: "Show portfolio projects." },
                                { key: "showTools", label: "AI Tools", desc: "Show SaaS tools directory." },
                                { key: "showBlog", label: "Thinking (Blog)", desc: "Show articles and insights." },
                                { key: "showEvents", label: "Events & Workshops", desc: "Show upcoming events." },
                                { key: "showCourses", label: "Courses (LMS)", desc: "Show course catalog." },
                                { key: "showShop", label: "Store", desc: "Show digital products." },
                            ].map((feature) => (
                                <div key={feature.key} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-medium text-white">{feature.label}</h4>
                                        <p className="text-xs text-gray-500">{feature.desc}</p>
                                    </div>
                                    <Switch
                                        checked={(stats as any).features?.[feature.key] ?? true}
                                        onCheckedChange={async (checked) => {
                                            // Optimistic Update
                                            const newStats = { ...stats };
                                            if (!(newStats as any).features) (newStats as any).features = {};
                                            (newStats as any).features[feature.key] = checked;
                                            setStats(newStats);

                                            // API Call
                                            try {
                                                await CMSService.updateGlobalSettings({
                                                    features: {
                                                        ...(stats as any).features,
                                                        [feature.key]: checked
                                                    }
                                                });
                                                toast.success(`${feature.label} ${checked ? "Enabled" : "Disabled"}`);
                                            } catch (e) {
                                                toast.error("Failed to update setting");
                                                loadStats(); // Revert
                                            }
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-20 animate-pulse bg-white/5 rounded" />
                    )}
                </GlassCard>

                {/* Firebase Health */}
                <GlassCard className="p-6 md:col-span-2">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2 mb-4">
                        <div className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-green-400" />
                            <span className="font-bold text-lg text-white">Database Metrics</span>
                        </div>
                        <Badge variant="outline" className="border-green-500/50 text-green-400">Live</Badge>
                    </div>
                    {stats ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center">
                                    <Users className="h-5 w-5 text-blue-400 mb-2" />
                                    <div className="text-2xl font-bold text-white">{stats.firebase.details?.users || 0}</div>
                                    <div className="text-xs text-gray-400">Users</div>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center">
                                    <GraduationCap className="h-5 w-5 text-purple-400 mb-2" />
                                    <div className="text-2xl font-bold text-white">{stats.firebase.details?.registrations || 0}</div>
                                    <div className="text-xs text-gray-400">Registrations</div>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center">
                                    <Box className="h-5 w-5 text-orange-400 mb-2" />
                                    <div className="text-2xl font-bold text-white">{stats.firebase.details?.products || 0}</div>
                                    <div className="text-xs text-gray-400">Products</div>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center">
                                    <FileText className="h-5 w-5 text-pink-400 mb-2" />
                                    <div className="text-2xl font-bold text-white">{stats.firebase.details?.posts || 0}</div>
                                    <div className="text-xs text-gray-400">Posts</div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-sm bg-green-500/5 p-3 rounded-lg border border-green-500/10">
                                <div className="flex items-center gap-2 text-green-400">
                                    <Activity className="h-4 w-4" />
                                    <span>System Status: Healthy</span>
                                </div>
                                <span className="text-gray-400">Total Documents: ~{stats.firebase.writes}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="h-32 animate-pulse bg-white/5 rounded-xl" />
                    )}
                </GlassCard>

                {/* Maintenance Actions */}
                <GlassCard className="p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2 mb-4">
                        <div className="flex items-center gap-2">
                            <Trash2 className="h-5 w-5 text-red-400" />
                            <span className="font-bold text-lg text-white">Trash Bin</span>
                        </div>
                        <Badge variant="outline" className="border-red-500/50 text-red-400">Action Required</Badge>
                    </div>

                    <div className="space-y-6">
                        {stats ? (
                            <div className="text-center py-4">
                                <span className="text-4xl font-black text-white">{stats.trash}</span>
                                <p className="text-sm text-gray-400">Items marked for deletion</p>
                            </div>
                        ) : (
                            <div className="h-20 animate-pulse bg-white/5 rounded" />
                        )}

                        <div className="p-3 border border-red-500/20 bg-red-500/10 rounded-lg space-y-2">
                            <h4 className="text-sm font-semibold text-red-400 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                The Purge
                            </h4>
                            <p className="text-xs text-red-200/70">
                                Permanently remove all soft-deleted items from the database.
                            </p>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="w-full bg-red-600 hover:bg-red-700 font-bold"
                                onClick={handleCleanup}
                                disabled={cleaning || !stats?.trash}
                            >
                                {cleaning ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                {cleaning ? "Purging..." : "Empty Trash"}
                            </Button>
                        </div>
                    </div>
                </GlassCard>

                {/* Cloudinary Storage (Visual Only) */}
                <GlassCard className="p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2 mb-4">
                        <div className="flex items-center gap-2">
                            <HardDrive className="h-5 w-5 text-indigo-400" />
                            <span className="font-bold text-lg text-white">Storage</span>
                        </div>
                        <Badge variant="outline" className="border-indigo-500/50 text-indigo-400">Media</Badge>
                    </div>
                    {stats ? (
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm text-gray-400">
                                <span>{stats.storage.used}GB Used</span>
                                <span>{stats.storage.limit}GB Limit</span>
                            </div>
                            <Progress
                                value={(stats.storage.used / stats.storage.limit) * 100}
                                className="h-2 bg-indigo-950"
                            />
                            <p className="text-xs text-muted-foreground">
                                Media assets stored in Cloudinary. (Estimate)
                            </p>
                            <Button variant="ghost" size="sm" className="w-full text-xs text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/10">
                                View Cloudinary Console
                            </Button>
                        </div>
                    ) : (
                        <div className="h-20 animate-pulse bg-white/5 rounded" />
                    )}
                </GlassCard>
            </div>
        </div>
    );
}
