"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Course } from "@/components/admin/course-editor";
import { useAuth, UserProfile } from "@/components/auth/auth-provider";
import { CMSService, Registration } from "@/lib/cms-service";
import { Button } from "@/components/ui/button";
import { Loader2, Users, BookOpen, CheckCircle, Clock } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";

export default function CourseDetailPage() {
    const params = useParams();
    const id = params?.id as string;
    const { user, profile, openAuthModal } = useAuth();

    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [registration, setRegistration] = useState<Registration | null>(null);
    const [regLoading, setRegLoading] = useState(false);

    useEffect(() => {
        if (id) {
            fetchCourse();
        }
    }, [id]);

    useEffect(() => {
        // Check registration status if user is logged in and course is loaded
        if (user && id) {
            checkRegistration();
        } else {
            setRegistration(null);
        }
    }, [user, id]);

    const fetchCourse = async () => {
        setLoading(true);
        try {
            const data = await CMSService.getCourse(id);
            setCourse(data);
        } catch (error) {
            console.error("Failed to fetch course", error);
        } finally {
            setLoading(false);
        }
    };

    const checkRegistration = async () => {
        if (!user?.email) return;
        try {
            const reg = await CMSService.getUserCourseRegistration(user.email, id);
            setRegistration(reg);
        } catch (error) {
            console.error("Failed to check registration", error);
        }
    };

    const handleEnroll = async () => {
        if (!user) {
            openAuthModal();
            return;
        }

        if (!course) return;

        setRegLoading(true);
        try {
            const result = await CMSService.registerForCourse(course.id!, {
                email: user.email!,
                name: user.displayName || "Unknown",
                userId: user.uid,
                phone: profile?.phone
            });

            if (result.success) {
                // Refresh registration status
                await checkRegistration();
            } else {
                alert("Enrollment failed: " + result.error);
            }
        } catch (error) {
            console.error("Enrollment error", error);
            alert("An error occurred during enrollment.");
        } finally {
            setRegLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20 min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-screen text-center px-4">
                <BookOpen className="h-16 w-16 text-gray-600 mb-4" />
                <h1 className="text-2xl font-bold text-white mb-2">Course Not Found</h1>
                <p className="text-gray-400">The course you are looking for does not exist or has been removed.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20">
            {/* Hero Section */}
            <div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
                {course.headerImage ? (
                    <img
                        src={course.headerImage}
                        alt={course.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-indigo-900/20 flex items-center justify-center">
                        <BookOpen className="h-20 w-20 text-white/10" />
                    </div>
                )}

                <div className="absolute bottom-0 left-0 w-full z-20 pb-12 pt-24 bg-gradient-to-t from-background to-transparent">
                    <div className="container mx-auto px-4 max-w-5xl">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
                            {course.title}
                        </h1>
                        <p className="text-lg md:text-xl text-gray-300 max-w-2xl">
                            {course.description}
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-5xl -mt-8 relative z-30">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <GlassCard className="p-8">
                            <h2 className="text-2xl font-bold text-white mb-4">About this Course</h2>
                            <div className="prose prose-invert max-w-none text-gray-300">
                                {course.description}
                            </div>
                        </GlassCard>

                        <GlassCard className="p-8">
                            <h2 className="text-2xl font-bold text-white mb-4">What you'll learn</h2>
                            <ul className="space-y-3">
                                {[1, 2, 3].map((_, i) => (
                                    <li key={i} className="flex items-start gap-3 text-gray-300">
                                        <CheckCircle className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                                        <span>Comprehensive understanding of the subject matter through hands-on practice.</span>
                                    </li>
                                ))}
                            </ul>
                        </GlassCard>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <GlassCard className="p-6 sticky top-24 space-y-6">
                            <div className="text-3xl font-bold text-primary mb-2">
                                ৳{course.price}
                            </div>

                            {registration ? (
                                <div className="w-full py-4 px-4 rounded-lg bg-green-500/10 border border-green-500/30 text-center">
                                    {registration.status === 'approved' ? (
                                        <>
                                            <CheckCircle className="h-6 w-6 text-green-400 mx-auto mb-2" />
                                            <span className="font-bold text-green-400 block">Enrolled</span>
                                            <p className="text-xs text-green-300/80 mt-1">You have full access</p>
                                        </>
                                    ) : (
                                        <>
                                            <Clock className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                                            <span className="font-bold text-yellow-400 block">Pending Approval</span>
                                            <p className="text-xs text-yellow-300/80 mt-1">Admin will verify soon</p>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <Button
                                    size="lg"
                                    className="w-full text-lg font-bold"
                                    onClick={handleEnroll}
                                    disabled={regLoading}
                                >
                                    {regLoading ? (
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    ) : !user ? (
                                        "Login to Enroll"
                                    ) : (
                                        "Enroll Now"
                                    )}
                                </Button>
                            )}

                            <p className="text-xs text-center text-gray-500">
                                30-day money-back guarantee. Lifetime access.
                            </p>

                            <div className="pt-6 border-t border-white/10 space-y-4">
                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                    <BookOpen className="h-4 w-4" />
                                    <span>Beginner friendly</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                    <Users className="h-4 w-4" />
                                    <span>Community access</span>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>
        </div>
    );
}
