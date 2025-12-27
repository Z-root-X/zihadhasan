"use client";

import { GlassCard } from "@/components/shared/glass-card";
import { Activity, Users, DollarSign, ArrowUp, ArrowDown } from "lucide-react";

interface InsightsProps {
    stats: {
        revenue: number;
        totalStudents: number;
        systemHealth: number; // 0-100
        activeUsers: { image?: string; name: string }[];
    };
}

export function InsightsGrid({ stats }: InsightsProps) {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* 1. Revenue Card with Sparkline */}
            <div className="relative group overflow-hidden rounded-2xl border border-white/5 bg-black/20 p-6 backdrop-blur-md">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-gray-400 text-sm font-medium">Total Revenue</h3>
                    <div className="flex items-center text-green-400 text-xs bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
                        <ArrowUp className="w-3 h-3 mr-1" /> 12%
                    </div>
                </div>
                <p className="text-3xl font-bold text-white mb-4">${stats.revenue.toLocaleString()}</p>

                {/* Visual Sparkline Placeholder */}
                <div className="h-12 w-full flex items-end gap-1 opacity-50">
                    {[40, 65, 50, 80, 55, 90, 70, 85, 60, 95].map((h, i) => (
                        <div
                            key={i}
                            style={{ height: `${h}%` }}
                            className="flex-1 bg-indigo-500/50 rounded-t-sm hover:bg-indigo-400 transition-colors"
                        />
                    ))}
                </div>
            </div>

            {/* 2. System Health - Circular Progress */}
            <div className="relative group overflow-hidden rounded-2xl border border-white/5 bg-black/20 p-6 backdrop-blur-md flex items-center justify-between">
                <div>
                    <h3 className="text-gray-400 text-sm font-medium mb-1">System Health</h3>
                    <p className="text-2xl font-bold text-white mb-2">
                        {stats.systemHealth > 80 ? 'Excellent' : 'Stable'}
                    </p>
                    <p className="text-xs text-neutral-500">Firestore Usage: Normal</p>
                </div>

                <div className="relative h-20 w-20 flex items-center justify-center">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                        <path
                            className="text-white/10"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                            strokeDasharray={`${stats.systemHealth}, 100`}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Activity className="h-5 w-5 text-emerald-400" />
                    </div>
                </div>
            </div>

            {/* 3. Active Students - Face Pile */}
            <div className="relative group overflow-hidden rounded-2xl border border-white/5 bg-black/20 p-6 backdrop-blur-md">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-gray-400 text-sm font-medium mb-4">Active Students</h3>
                <div className="flex items-center -space-x-3 mb-4">
                    {stats.activeUsers.slice(0, 5).map((user, i) => (
                        <div key={i} className="h-10 w-10 rounded-full border-2 border-black bg-neutral-800 flex items-center justify-center text-xs font-bold text-white relative z-10 hover:z-20 hover:scale-110 transition-transform cursor-pointer" title={user.name}>
                            {user.name.substring(0, 2).toUpperCase()}
                        </div>
                    ))}
                    {stats.totalStudents > 5 && (
                        <div className="h-10 w-10 rounded-full border-2 border-black bg-neutral-900 flex items-center justify-center text-xs font-medium text-white relative z-0">
                            +{stats.totalStudents - 5}
                        </div>
                    )}
                </div>
                <div className="flex items-center text-xs text-neutral-400">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                    {stats.activeUsers.length} users online now
                </div>
            </div>
        </div>
    );
}
