"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { CMSService, Registration, Course } from "@/lib/cms-service";
import { GlassCard } from "@/components/shared/glass-card";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, CheckCircle, Clock } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { motion } from "framer-motion";

export default function MyAccountPage() {
    const { user, profile } = useAuth();
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [courses, setCourses] = useState<{ [key: string]: Course }>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            // AuthProvider handles global check, but maybe we redirect here?
            // window.location.href = "/";
        } else {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        if (!user?.email) return;

        try {
            // Can't easily filter by email in getAllRegistrations without index?
            // CMSService doesn't have "getUserRegistrations". Let's use getCourseRegistrations logic but filtered by email?
            // No, the service only has getCourseRegistrations(courseId) or all.
            // I should add getUserRegistrations to CMSService or query manually here.
            // Let's assume I can query for now.

            // Wait, I need a new service method: getRegistrationsByUser
            // Wait, I need a new service method: getRegistrationsByUser
            const userRegs = await CMSService.getRegistrationsByUser(user.uid);
            setRegistrations(userRegs);

            // Fetch course details for each registration
            const courseData: { [key: string]: Course } = {};
            for (const reg of userRegs) {
                if (reg.courseId && !courseData[reg.courseId]) {
                    const c = await CMSService.getCourse(reg.courseId);
                    if (c) courseData[reg.courseId] = c;
                }
            }
            setCourses(courseData);

        } catch (error) {
            console.error("Failed to load dashboard", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        window.location.href = "/";
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen pt-24 text-center">
                <p>Please login to view your account.</p>
                <Link href="/" className="text-primary hover:underline mt-4 block">Go Home</Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Profile Sidebar */}
                <GlassCard className="w-full md:w-80 p-6 space-y-6">
                    <div className="flex flex-col items-center text-center">
                        <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-primary mb-4 bg-white/5">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt={user.displayName || "User"} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-3xl font-bold text-gray-500">
                                    {user.email?.[0].toUpperCase()}
                                </div>
                            )}
                        </div>
                        <h2 className="text-xl font-bold text-white mb-1">{user.displayName || "User"}</h2>
                        <p className="text-sm text-gray-400 mb-6">{user.email}</p>

                        <Button variant="outline" className="w-full gap-2 border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-400" onClick={handleLogout}>
                            <LogOut className="h-4 w-4" /> Sign Out
                        </Button>
                    </div>
                </GlassCard>

                {/* Main Content */}
                <div className="flex-1 space-y-6 w-full">
                    <h2 className="text-2xl font-bold text-white">My Courses</h2>

                    {registrations.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-white/10 rounded-xl bg-white/5">
                            <p className="text-gray-400 mb-4">You haven't enrolled in any courses yet.</p>
                            <Link href="/courses">
                                <Button>Browse Courses</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {registrations.map((reg) => {
                                const course = courses[reg.courseId!];
                                if (!course) return null;

                                return (
                                    <GlassCard key={reg.id} className="p-4 flex flex-col sm:flex-row gap-4 items-center">
                                        <div className="h-24 w-40 bg-black/40 rounded-md overflow-hidden shrink-0">
                                            {course.headerImage ? (
                                                <img src={course.headerImage} alt={course.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-indigo-900/20" />
                                            )}
                                        </div>

                                        <div className="flex-1 text-center sm:text-left">
                                            <h3 className="font-bold text-lg text-white mb-1">{course.title}</h3>
                                            <p className="text-sm text-gray-400 mb-2">TrxID: {reg.trxId || "N/A"}</p>

                                            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                                                {reg.status === 'approved' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                                                        <CheckCircle className="h-3 w-3" /> Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                                                        <Clock className="h-3 w-3" /> Pending Verification
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            {reg.status === 'approved' ? (
                                                <Link href={`/courses/view?id=${course.id}`}>
                                                    <Button className="w-full sm:w-auto">Start Learning</Button>
                                                </Link>
                                            ) : (
                                                <Button variant="secondary" disabled className="opacity-50 w-full sm:w-auto">Awaiting Approval</Button>
                                            )}
                                        </div>
                                    </GlassCard>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
