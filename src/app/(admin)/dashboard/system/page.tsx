"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Database, Trash2, RefreshCw, HardDrive, Activity } from "lucide-react";
import { toast } from "sonner";
import { getSystemStats, cleanupSoftDeletedItems } from "@/actions/system";
import { GlassCard } from "@/components/shared/glass-card";

export default function SystemHealthPage() {
    const [stats, setStats] = useState<{
        storage: { used: number; limit: number };
        firebase: { reads: string; writes: string; status: string };
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [cleaning, setCleaning] = useState(false);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await getSystemStats();
            setStats(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load system stats.");
        } finally {
            setLoading(false);
        }
    };

    const handleCleanup = async () => {
        if (!confirm("Are you sure you want to permanently delete all soft-deleted items? This cannot be undone.")) return;

        setCleaning(true);
        try {
            const result = await cleanupSoftDeletedItems();
            if (result.success) {
                toast.success(`Cleanup complete. Removed ${result.count} items.`);
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
                    <h2 className="text-3xl font-bold tracking-tight text-white">System Health</h2>
                    <p className="text-muted-foreground">Monitor storage, database usage, and perform maintenance.</p>
                </div>
                <Button onClick={loadStats} variant="outline" className="gap-2">
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Cloudinary Storage */}
                <GlassCard className="p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2 mb-4">
                        <div className="flex items-center gap-2">
                            <HardDrive className="h-5 w-5 text-indigo-400" />
                            <span className="font-bold text-lg text-white">Storage Usage</span>
                        </div>
                        <Badge variant="outline" className="border-indigo-500/50 text-indigo-400">Cloudinary</Badge>
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
                            // Note: Need a custom indicator class if Progress supports it, or standard is fine
                            />
                            <p className="text-xs text-muted-foreground">
                                Media assets (Images, Videos) stored in Cloud.
                            </p>
                        </div>
                    ) : (
                        <div className="h-20 animate-pulse bg-white/5 rounded" />
                    )}
                </GlassCard>

                {/* Firebase Health */}
                <GlassCard className="p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2 mb-4">
                        <div className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-orange-400" />
                            <span className="font-bold text-lg text-white">Database Health</span>
                        </div>
                        <Badge variant="outline" className="border-orange-500/50 text-orange-400">Firestore</Badge>
                    </div>
                    {stats ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 p-3 rounded-lg text-center">
                                    <div className="text-xs text-gray-400 mb-1">Reads</div>
                                    <div className="font-bold text-green-400">{stats.firebase.reads}</div>
                                </div>
                                <div className="bg-white/5 p-3 rounded-lg text-center">
                                    <div className="text-xs text-gray-400 mb-1">Writes</div>
                                    <div className="font-bold text-green-400">{stats.firebase.writes}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-green-400">
                                <Activity className="h-4 w-4" />
                                <span>System is operating normally.</span>
                            </div>
                        </div>
                    ) : (
                        <div className="h-20 animate-pulse bg-white/5 rounded" />
                    )}
                </GlassCard>

                {/* Maintenance Actions */}
                <GlassCard className="p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2 mb-4">
                        <div className="flex items-center gap-2">
                            <Database className="h-5 w-5 text-red-400" />
                            <span className="font-bold text-lg text-white">Maintenance</span>
                        </div>
                        <Badge variant="outline" className="border-red-500/50 text-red-400">Actions</Badge>
                    </div>

                    <div className="space-y-4">
                        <div className="p-3 border border-red-500/20 bg-red-500/10 rounded-lg space-y-2">
                            <h4 className="text-sm font-semibold text-red-400 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                Garbage Collection
                            </h4>
                            <p className="text-xs text-red-200/70">
                                Permanently remove all items marked as "Deleted".
                            </p>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="w-full bg-red-600 hover:bg-red-700"
                                onClick={handleCleanup}
                                disabled={cleaning}
                            >
                                {cleaning ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                Run Cleanup
                            </Button>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
