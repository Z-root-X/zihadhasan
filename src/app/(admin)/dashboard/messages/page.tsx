"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { GlassCard } from "@/components/shared/glass-card";
import { Badge } from "@/components/ui/badge";
import { Message } from "@/lib/cms-service";
import { Loader2, Mail, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function MessagesPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const q = query(
                    collection(db, "messages"),
                    orderBy("createdAt", "desc"),
                    limit(50)
                );
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Message[];
                setMessages(data);
            } catch (error) {
                console.error("Failed to fetch messages", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Inbox</h1>
                <p className="text-gray-400">View messages from your contact form.</p>
            </div>

            <div className="grid gap-4">
                {messages.length === 0 ? (
                    <GlassCard className="p-8 text-center text-gray-400">
                        <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No messages yet.</p>
                    </GlassCard>
                ) : (
                    messages.map((msg) => (
                        <GlassCard key={msg.id} className="p-6 transition-all hover:bg-white/5 group">
                            <div className="flex flex-col md:flex-row gap-4 justify-between md:items-start">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-white text-lg">{msg.subject}</h3>
                                        {!msg.read && (
                                            <Badge className="bg-primary text-black hover:bg-primary/90">New</Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <span className="font-medium text-gray-300">{msg.name}</span>
                                        <span>•</span>
                                        <span className="text-primary">{msg.email}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 whitespace-nowrap">
                                    <Clock className="h-3 w-3" />
                                    {msg.createdAt ? formatDistanceToNow(msg.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                                </div>
                            </div>

                            <div className="mt-4 p-4 rounded-lg bg-black/40 border border-white/5 text-gray-300 whitespace-pre-wrap">
                                {msg.message}
                            </div>
                        </GlassCard>
                    ))
                )}
            </div>
        </div>
    );
}
