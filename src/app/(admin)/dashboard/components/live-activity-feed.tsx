"use client";

import { GlassCard } from "@/components/shared/glass-card";
import { Clock, UserPlus, ShoppingCart, MessageSquare } from "lucide-react";

interface ActivityItem {
    id: string;
    type: 'registration' | 'message' | 'purchase' | 'system';
    message: string;
    time: string;
}

interface LiveActivityFeedProps {
    activities: ActivityItem[];
}

export function LiveActivityFeed({ activities }: LiveActivityFeedProps) {
    const getIcon = (type: string) => {
        switch (type) {
            case 'registration': return <UserPlus className="h-4 w-4 text-blue-400" />;
            case 'purchase': return <ShoppingCart className="h-4 w-4 text-emerald-400" />;
            case 'message': return <MessageSquare className="h-4 w-4 text-purple-400" />;
            default: return <Clock className="h-4 w-4 text-neutral-400" />;
        }
    };

    return (
        <GlassCard className="p-0 overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <h3 className="font-bold text-white">Live Activity</h3>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-xs text-neutral-400 uppercase tracking-wider">Real-time</span>
                </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[400px] space-y-0 relative">
                {/* Vertical Line */}
                <div className="absolute left-[35px] top-6 bottom-6 w-px bg-white/10" />

                {activities.length === 0 ? (
                    <div className="text-center text-neutral-500 py-10">No recent activity</div>
                ) : (
                    activities.map((item, i) => (
                        <div key={item.id} className="relative flex items-start gap-4 pb-8 last:pb-0 group">
                            <div className={`z-10 mt-1 h-8 w-8 flex items-center justify-center rounded-full border border-white/5 bg-neutral-900 ring-4 ring-black transform transition-transform group-hover:scale-110`}>
                                {getIcon(item.type)}
                            </div>
                            <div className="flex-1 -mt-1 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                                <p className="text-sm text-neutral-200 leading-snug">{item.message}</p>
                                <p className="text-xs text-neutral-500 mt-1 font-mono">{item.time}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </GlassCard>
    );
}
