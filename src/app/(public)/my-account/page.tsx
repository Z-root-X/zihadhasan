"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { CMSService, Registration, Course, Event } from "@/lib/cms-service";
import { GlassCard } from "@/components/shared/glass-card";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, CheckCircle, Clock, LayoutDashboard, Ticket, BookOpen, Crown } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function MyAccountPage() {
    const { user, profile, isAdmin } = useAuth();
    const router = useRouter();
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [courses, setCourses] = useState<{ [key: string]: Course }>({});
    const [events, setEvents] = useState<{ [key: string]: Event }>({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"learning" | "events">("learning");

    useEffect(() => {
        if (user === undefined) return; // Auth initializing
        if (user === null) {
            // Not logged in
        } else {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        if (!user?.uid) return;

        try {
            const userRegs = await CMSService.getRegistrationsByUser(user.uid);
            setRegistrations(userRegs);

            // Fetch details
            const courseData: { [key: string]: Course } = {};
            const eventData: { [key: string]: Event } = {};

            const promises = userRegs.map(async (reg) => {
                if (reg.courseId && !courseData[reg.courseId]) {
                    const c = await CMSService.getCourse(reg.courseId);
                    if (c) courseData[reg.courseId] = c;
                }
                if (reg.eventId && !eventData[reg.eventId]) {
                    const e = await CMSService.getEvent(reg.eventId);
                    if (e) eventData[reg.eventId] = e;
                }
            });

            await Promise.all(promises);
            setCourses(courseData);
            setEvents(eventData);

        } catch (error) {
            console.error("Failed to load dashboard", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/");
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-32 flex justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen pt-32 text-center px-4">
                <h1 className="text-3xl font-bold text-white mb-4">Access Restricted</h1>
                <p className="text-gray-400 mb-8">Please login to view your command center.</p>
                <Link href="/">
                    <Button size="lg" className="bg-primary text-black hover:bg-primary/90">Go Home</Button>
                </Link>
            </div>
        )
    }

    const courseRegs = registrations.filter(r => r.courseId);
    const eventRegs = registrations.filter(r => r.eventId);

    return (
        <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
                {/* User Profile Card */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full md:w-80 shrink-0"
                >
                    <GlassCard className="p-6">
                        <div className="flex flex-col items-center text-center">
                            <div className="relative">
                                <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-primary/50 mb-4 bg-white/5 ring-4 ring-primary/10">
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt={user.displayName || "User"} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-3xl font-bold text-gray-500">
                                            {user.email?.[0].toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                {isAdmin && (
                                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-amber-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                                        <Crown className="h-3 w-3" /> ADMIN
                                    </div>
                                )}
                            </div>

                            <h2 className="text-xl font-bold text-white mb-1">{user.displayName || "User"}</h2>
                            <p className="text-sm text-gray-400 mb-6 font-mono">{user.email}</p>

                            <div className="w-full space-y-3">
                                {isAdmin && (
                                    <Link href="/dashboard">
                                        <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-indigo-500/20 mb-3 border-none">
                                            <LayoutDashboard className="h-4 w-4 mr-2" /> Admin Dashboard
                                        </Button>
                                    </Link>
                                )}

                                <Button variant="outline" className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/40 transition-all" onClick={handleLogout}>
                                    <LogOut className="h-4 w-4 mr-2" /> Sign Out
                                </Button>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>

                {/* Main Dashboard Area */}
                <div className="flex-1 w-full relative">
                    {/* Tabs */}
                    <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-1">
                        <button
                            onClick={() => setActiveTab("learning")}
                            className={cn(
                                "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative",
                                activeTab === "learning" ? "text-primary" : "text-gray-400 hover:text-white"
                            )}
                        >
                            <BookOpen className="h-4 w-4" />
                            My Learning
                            <span className="bg-white/10 px-2 py-0.5 rounded-full text-xs ml-1">{courseRegs.length}</span>
                            {activeTab === "learning" && (
                                <motion.div layoutId="activeTab" className="absolute bottom-[-5px] left-0 right-0 h-[2px] bg-primary" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab("events")}
                            className={cn(
                                "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative",
                                activeTab === "events" ? "text-cyan-400" : "text-gray-400 hover:text-white"
                            )}
                        >
                            <Ticket className="h-4 w-4" />
                            My Events
                            <span className="bg-white/10 px-2 py-0.5 rounded-full text-xs ml-1">{eventRegs.length}</span>
                            {activeTab === "events" && (
                                <motion.div layoutId="activeTab" className="absolute bottom-[-5px] left-0 right-0 h-[2px] bg-cyan-400" />
                            )}
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === "learning" ? (
                            <motion.div
                                key="learning"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-4"
                            >
                                {courseRegs.length === 0 ? (
                                    <EmptyState
                                        icon={BookOpen}
                                        title="Start Your Journey"
                                        desc="You haven't enrolled in any courses yet."
                                        actionLink="/courses"
                                        actionText="Browse Courses"
                                    />
                                ) : (
                                    <div className="grid gap-4">
                                        {courseRegs.map((reg) => {
                                            const course = courses[reg.courseId!];
                                            if (!course) return null;
                                            return <RegistrationCard key={reg.id} reg={reg} title={course.title} image={course.headerImage} type="course" id={course.id!} />;
                                        })}
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="events"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-4"
                            >
                                {eventRegs.length === 0 ? (
                                    <EmptyState
                                        icon={Ticket}
                                        title="No Upcoming Events"
                                        desc="You haven't registered for any events yet."
                                        actionLink="/events"
                                        actionText="Explore Events"
                                    />
                                ) : (
                                    <div className="grid gap-4">
                                        {eventRegs.map((reg) => {
                                            const event = events[reg.eventId!];
                                            if (!event) return null;
                                            return <RegistrationCard key={reg.id} reg={reg} title={event.title} image={event.imageUrl} type="event" id={event.id!} date={event.date} />;
                                        })}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

function RegistrationCard({ reg, title, image, type, id, date }: { reg: Registration, title: string, image?: string, type: 'course' | 'event', id: string, date?: any }) {
    const isApproved = reg.status === 'approved';

    return (
        <GlassCard className="p-0 overflow-hidden flex flex-col sm:flex-row group hover:border-primary/30 transition-all duration-300">
            <div className="h-40 sm:h-auto sm:w-48 bg-black/40 relative overflow-hidden shrink-0">
                {image ? (
                    <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full bg-indigo-900/20 flex items-center justify-center">
                        {type === 'course' ? <BookOpen className="h-10 w-10 text-white/10" /> : <Ticket className="h-10 w-10 text-white/10" />}
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-black/20" />

                {/* Mobile Status Badge */}
                <div className="absolute top-2 right-2 sm:hidden">
                    <StatusBadge status={reg.status} />
                </div>
            </div>

            <div className="flex-1 p-5 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors line-clamp-1">{title}</h3>
                        <div className="hidden sm:block">
                            <StatusBadge status={reg.status} />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 text-sm text-gray-400 mb-4">
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs bg-white/5 px-2 py-0.5 rounded border border-white/5">TRX: {reg.trxId || "N/A"}</span>
                            {date && (
                                <span className="text-xs text-cyan-400">
                                    {new Date(date.seconds * 1000).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 mt-2">
                    {isApproved ? (
                        <Link href={type === 'course' ? `/learning/view?id=${id}` : `/events`}>
                            <Button size="sm" className={cn(
                                "font-bold shadow-lg transition-all active:scale-95",
                                type === 'course' ? "bg-primary text-black hover:bg-primary/90 shadow-primary/20" : "bg-cyan-500 text-black hover:bg-cyan-400 shadow-cyan-500/20"
                            )}>
                                {type === 'course' ? "Start Learning" : "View Ticket"}
                            </Button>
                        </Link>
                    ) : (
                        <Button size="sm" variant="outline" disabled className="opacity-70 border-yellow-500/20 text-yellow-500 bg-yellow-500/5 cursor-not-allowed">
                            <Clock className="h-3 w-3 mr-2" /> Awaiting Approval
                        </Button>
                    )}
                </div>
            </div>
        </GlassCard>
    );
}

function StatusBadge({ status }: { status: 'approved' | 'pending' }) {
    if (status === 'approved') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-500/20 text-green-400 border border-green-500/20 shadow-lg shadow-green-900/20 backdrop-blur-md">
                <CheckCircle className="h-3 w-3" /> Active
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 shadow-lg shadow-yellow-900/10 backdrop-blur-md animate-pulse">
            <Clock className="h-3 w-3" /> Pending
        </span>
    );
}

function EmptyState({ icon: Icon, title, desc, actionLink, actionText }: { icon: any, title: string, desc: string, actionLink: string, actionText: string }) {
    return (
        <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/5 flex flex-col items-center">
            <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <Icon className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-gray-400 mb-6 max-w-sm mx-auto">{desc}</p>
            <Link href={actionLink}>
                <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/10">
                    {actionText}
                </Button>
            </Link>
        </div>
    );
}
