"use client";

import { useState, useEffect } from "react";
import { Bell, Check, CheckCheck, Trash2, MailOpen } from "lucide-react";
import { collection, query, where, orderBy, onSnapshot, limit, doc, updateDoc, writeBatch, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth/auth-provider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export interface UserNotification {
    id: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: any;
    link?: string;
}

export function NotificationBell() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<UserNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!user) return;

        // Subscribe to notifications subcollection
        const q = query(
            collection(db, "users", user.uid, "notifications"),
            orderBy("createdAt", "desc"),
            limit(20)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as UserNotification));
            setNotifications(items);
            setUnreadCount(items.filter(n => !n.read).length);
        });

        return () => unsubscribe();
    }, [user]);

    const markAsRead = async (notificationId: string) => {
        if (!user) return;
        try {
            const ref = doc(db, "users", user.uid, "notifications", notificationId);
            await updateDoc(ref, { read: true });
        } catch (error) {
            console.error("Error marking read", error);
        }
    };

    const markAllAsRead = async () => {
        if (!user || unreadCount === 0) return;
        try {
            const batch = writeBatch(db);
            const q = query(
                collection(db, "users", user.uid, "notifications"),
                where("read", "==", false),
                limit(20) // Batch limit safety
            );
            const snapshot = await getDocs(q);
            snapshot.docs.forEach((doc) => {
                batch.update(doc.ref, { read: true });
            });
            await batch.commit();
        } catch (error) {
            console.error("Error marking all read", error);
        }
    };

    const handleNotificationClick = (notification: UserNotification) => {
        if (!notification.read) {
            markAsRead(notification.id);
        }
        setIsOpen(false);
    };

    if (!user) return null;

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-white/70 hover:text-white hover:bg-white/10 rounded-full h-9 w-9">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-red-500 border border-black animate-pulse" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-zinc-950 border-white/10 text-white backdrop-blur-xl" align="end">
                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm">Notifications</h4>
                        {unreadCount > 0 && (
                            <span className="text-[10px] font-bold bg-primary text-black px-1.5 py-0.5 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[10px] px-2 text-white/50 hover:text-white hover:bg-white/10"
                            onClick={markAllAsRead}
                        >
                            <CheckCheck className="mr-1 h-3 w-3" /> Mark all read
                        </Button>
                    )}
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center flex flex-col items-center gap-2 text-white/40">
                            <div className="p-3 bg-white/5 rounded-full">
                                <MailOpen className="h-6 w-6 opacity-50" />
                            </div>
                            <p className="text-sm">No notifications yet</p>
                            <p className="text-xs text-white/20">We'll notify you when something arrives</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "p-4 transition-colors hover:bg-white/5 relative group block text-left w-full",
                                        !notification.read && "bg-white/[0.02]"
                                    )}
                                >
                                    <div className="flex gap-3">
                                        <div className="flex-1 space-y-1">
                                            <p className={cn("text-sm font-medium", !notification.read ? "text-white" : "text-white/70")}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-white/50 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-[10px] text-white/30">
                                                {notification.createdAt?.seconds ? formatDistanceToNow(new Date(notification.createdAt.seconds * 1000), { addSuffix: true }) : 'Just now'}
                                            </p>
                                        </div>
                                        {!notification.read && (
                                            <div className="flex flex-col justify-center">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-primary hover:text-primary hover:bg-primary/20 rounded-full"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        markAsRead(notification.id);
                                                    }}
                                                    title="Mark as read"
                                                >
                                                    <Check className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    {notification.link && (
                                        <Link
                                            href={notification.link}
                                            className="absolute inset-0 z-10"
                                            onClick={() => handleNotificationClick(notification)}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
