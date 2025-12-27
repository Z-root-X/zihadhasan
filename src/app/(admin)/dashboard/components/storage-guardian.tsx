"use client";

import { GlassCard } from "@/components/shared/glass-card";
import { Button } from "@/components/ui/button";
import { HardDrive, Trash2 } from "lucide-react";
import Link from "next/link";

interface StorageGuardianProps {
    usagePercent: number; // 0-100
    fileCount: number;
}

export function StorageGuardian({ usagePercent, fileCount }: StorageGuardianProps) {
    const isCritical = usagePercent > 80;

    return (
        <GlassCard className="p-6 relative overflow-hidden">
            {/* Background Glow if Critical */}
            {isCritical && (
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-red-500/20 rounded-full blur-[50px] pointer-events-none" />
            )}

            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isCritical ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                        <HardDrive className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">Storage Guardian</h3>
                        <p className="text-xs text-neutral-400">{fileCount} assets managed</p>
                    </div>
                </div>

                <Button variant="ghost" size="sm" className="h-8 text-xs text-neutral-400 hover:text-white hover:bg-white/5" asChild>
                    <Link href="/dashboard/system">
                        <Trash2 className="h-3 w-3 mr-2" />
                        Quick Clean
                    </Link>
                </Button>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Cloudinary Usage</span>
                    <span className={isCritical ? "text-red-400 font-bold" : "text-white"}>{usagePercent}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ${isCritical ? 'bg-red-500' : 'bg-blue-500'}`}
                        style={{ width: `${usagePercent}%` }}
                    />
                </div>
            </div>
        </GlassCard>
    );
}
