"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { collection, query, orderBy, limit, startAfter, getDocs, doc, writeBatch, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserNotification } from "@/components/shared/notification-bell"; // Reuse interface
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, CheckCheck, Trash2, MailOpen, Bell, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { SmartImage } from "@/components/shared/smart-image";

export default function NotificationsPage() {
    const { user, loading: authLoading } = useAuth();
    const [notifications, setNotifications] = useState<UserNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastVisible, setLastVisible] = useState<any>(null);
    const [hasMore, setHasMore] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    useEffect(() => {
        if (!user) return;

        // Initial Load
        const fetchNotifications = async () => {
            setLoading(true);
            try {
                let q = query(
                    collection(db, "users", user.uid, "notifications"),
                    orderBy("createdAt", "desc"),
                    limit(20)
                );

                if (filter === 'unread') {
                    q = query(
                        collection(db, "users", user.uid, "notifications"),
                        where("read", "==", false),
                        orderBy("createdAt", "desc"),
                        limit(20)
                    );
                }

                const snapshot = await getDocs(q);
                const items = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as UserNotification));

                setNotifications(items);
                setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
                setHasMore(snapshot.docs.length === 20);
            } catch (error) {
                console.error("Error fetching notifications", error);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            fetchNotifications();
        }
    }, [user, authLoading, filter]);

    const loadMore = async () => {
        if (!user || !lastVisible) return;

        try {
            let q = query(
                collection(db, "users", user.uid, "notifications"),
                orderBy("createdAt", "desc"),
                startAfter(lastVisible),
                limit(20)
            );

            if (filter === 'unread') {
                q = query(
                    collection(db, "users", user.uid, "notifications"),
                    where("read", "==", false),
                    orderBy("createdAt", "desc"),
                    startAfter(lastVisible),
                    limit(20)
                );
            }

            const snapshot = await getDocs(q);
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as UserNotification));

            setNotifications(prev => [...prev, ...items]);
            setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
            setHasMore(snapshot.docs.length === 20);
        } catch (error) {
            console.error("Error loading more", error);
        }
    };

    const markAsRead = async (id: string) => {
        if (!user) return;
        try {
            // Optimistic update
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            // Actual update usually handled by Bell component logic anyway if we use same collection, 
            // but here we might not have real-time listener for THIS list to avoid flickers on "unread" filter.
            // Actually, for consistency, let's just update.

            // Note: If filter is 'unread', the item should disappear. 
            // We'll let it stay "read" until refresh or let user clear it manually to avoid UI jumping.

            const ref = doc(db, "users", user.uid, "notifications", id);
            // Dynamic import to avoid updateDoc missing if reused? No, standard import.
            // Using direct updateDoc import.
            const { updateDoc } = await import("firebase/firestore");
            await updateDoc(ref, { read: true });

        } catch (error) {
            console.error("Failed to mark read", error);
        }
    };

    const markAllRead = async () => {
        if (!user) return;
        try {
            const batch = writeBatch(db);
            const unread = notifications.filter(n => !n.read);

            if (unread.length === 0) {
                toast.info("No unread notifications loaded");
                return;
            }

            unread.forEach(n => {
                const ref = doc(db, "users", user.uid, "notifications", n.id);
                batch.update(ref, { read: true });
            });

            await batch.commit();

            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            toast.success("Marked all loaded as read");
        } catch (error) {
            console.error("Failed to mark all read", error);
            toast.error("Failed to update");
        }
    };

    if (authLoading || (loading && notifications.length === 0)) {
        return (
            <div className="min-h-screen bg-background container mx-auto py-12 px-6 space-y-6">
                <Skeleton className="h-10 w-48" />
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <Skeleton key={i} className="h-24 w-full rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (!user) return <div className="min-h-screen flex items-center justify-center text-white">Please log in.</div>;

    return (
        <main className="min-h-screen bg-background text-white">
            <div className="container mx-auto py-12 px-4 md:px-6 max-w-4xl">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/my-learning">
                            <Button variant="ghost" size="icon" className="hover:bg-white/10 text-white/70">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold">Notifications</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="bg-white/5 rounded-lg p-1 flex items-center text-sm">
                            <button
                                onClick={() => setFilter('all')}
                                className={cn("px-3 py-1.5 rounded-md transition-colors", filter === 'all' ? "bg-primary text-black font-medium" : "text-white/60 hover:text-white")}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter('unread')}
                                className={cn("px-3 py-1.5 rounded-md transition-colors", filter === 'unread' ? "bg-primary text-black font-medium" : "text-white/60 hover:text-white")}
                            >
                                Unread
                            </button>
                        </div>
                        <Button onClick={markAllRead} variant="outline" size="sm" className="hidden md:flex gap-2 border-white/10 hover:bg-white/5">
                            <CheckCheck className="h-4 w-4" /> Mark all read
                        </Button>
                    </div>
                </div>

                {notifications.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10">
                        <MailOpen className="h-12 w-12 text-white/20 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-white mb-2">No notifications found</h2>
                        <p className="text-white/50">You're all caught up!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={cn(
                                    "p-5 rounded-xl border transition-all flex gap-4 group relative overflow-hidden",
                                    notification.read ? "bg-background border-white/5 opacity-80 hover:opacity-100" : "bg-white/5 border-primary/20",
                                    !notification.read && "shadow-[0_0_30px_-10px_rgba(var(--primary),0.1)]"
                                )}
                            >
                                <div className={cn("h-10 w-10 rounded-full flex items-center justify-center shrink-0", notification.read ? "bg-white/5 text-white/40" : "bg-primary/20 text-primary")}>
                                    <Bell className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <h3 className={cn("font-semibold text-lg", !notification.read ? "text-white" : "text-white/70")}>{notification.title}</h3>
                                        {!notification.read && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => markAsRead(notification.id)}
                                                className="h-8 w-8 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Mark as read"
                                            >
                                                <Check className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                    <p className="text-white/60 mb-3">{notification.message}</p>
                                    <div className="flex items-center justify-between text-xs text-white/40">
                                        <span>{notification.createdAt?.seconds ? formatDistanceToNow(new Date(notification.createdAt.seconds * 1000), { addSuffix: true }) : 'Just now'}</span>
                                        {notification.link && (
                                            <Link href={notification.link} className="text-primary hover:underline z-10 relative">
                                                View Details
                                            </Link>
                                        )}
                                    </div>
                                </div>
                                {/* Clickable area for filtered views logic if needed, but link button is safer */}
                            </div>
                        ))}

                        {hasMore && (
                            <div className="pt-4 text-center">
                                <Button variant="ghost" onClick={loadMore} disabled={loading} className="text-white/50 hover:text-white">
                                    {loading ? "Loading..." : "Load More"}
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
