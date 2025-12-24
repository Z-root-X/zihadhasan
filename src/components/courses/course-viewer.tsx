"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth, UserProfile } from "@/components/auth/auth-provider";
import { CMSService, Registration, Course } from "@/lib/cms-service";
import { Button } from "@/components/ui/button";
import { Loader2, Users, BookOpen, CheckCircle, Clock, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { GlassCard } from "@/components/shared/glass-card";
import { EnrollmentModal } from "@/components/courses/enrollment-modal";
import { LessonsList } from "@/components/courses/lessons-list";
import { generateCourseSchema } from "@/lib/schema-generator";
import Link from "next/link";
import { motion } from "framer-motion";

interface CourseViewerProps {
    initialId?: string;
}

export function CourseViewer({ initialId }: CourseViewerProps) {
    const pathname = usePathname();
    const { user, profile, openAuthModal } = useAuth();

    const [id, setId] = useState<string | null>(initialId || null);
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [registration, setRegistration] = useState<Registration | null>(null);
    const [regLoading, setRegLoading] = useState(false);
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const searchParams = useSearchParams();

    useEffect(() => {
        // Priority: Prop > SearchParam > Pathname
        if (initialId) {
            setId(initialId);
            return;
        }

        const queryId = searchParams.get("id");
        if (queryId) {
            setId(queryId);
            return;
        }

        if (pathname) {
            const parts = pathname.split('/').filter(Boolean);
            const extractedId = parts[parts.length - 1];
            if (extractedId && extractedId !== 'view') {
                setId(extractedId);
            }
        }
    }, [pathname, searchParams, initialId]);

    useEffect(() => {
        if (id) {
            fetchCourse(id);
        }
    }, [id]);

    useEffect(() => {
        if (user && id) {
            checkRegistration(id);
        } else {
            setRegistration(null);
        }
    }, [user, id]);

    const fetchCourse = async (courseId: string) => {
        setLoading(true);
        try {
            const data = await CMSService.getCourse(courseId);
            setCourse(data);
        } catch (error) {
            console.error("Failed to fetch course", error);
        } finally {
            setLoading(false);
        }
    };

    const checkRegistration = async (courseId: string) => {
        if (!user?.email) return;
        try {
            const reg = await CMSService.getUserCourseRegistration(user.uid, courseId);
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

        if (!course || !id) return;

        setRegLoading(true);
        try {
            const result = await CMSService.registerForCourse(course.id!, {
                email: user.email!,
                name: user.displayName || "Unknown",
                userId: user.uid,
                phone: profile?.phone
            });

            if (result.success) {
                await checkRegistration(id);
            } else {
                toast.error("Enrollment failed", { description: String(result.error) });
            }
        } catch (error) {
            console.error("Enrollment error", error);
            toast.error("An error occurred during enrollment.");
        } finally {
            setRegLoading(false);
        }
    };

    if (!id) return <div className="min-h-screen pt-24 text-center text-white">Initializing course viewer...</div>;

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
            {course && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(generateCourseSchema(course)),
                    }}
                />
            )}
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

                        {/* Lessons List with Access Control */}
                        <GlassCard className="p-8">
                            <LessonsList
                                course={course}
                                registration={registration}
                                onEnroll={() => {
                                    if (user) {
                                        setShowEnrollModal(true);
                                    } else {
                                        openAuthModal();
                                    }
                                }}
                                onToggleLesson={async (lessonId, isCompleted) => {
                                    if (!registration) return;

                                    // Optimistic update
                                    const currentCompleted = registration.completedLessonIds || [];
                                    const newCompleted = isCompleted
                                        ? [...currentCompleted, lessonId]
                                        : currentCompleted.filter(id => id !== lessonId);

                                    setRegistration({ ...registration, completedLessonIds: newCompleted });

                                    try {
                                        await CMSService.toggleLessonCompletion(registration.id!, lessonId, isCompleted);
                                        toast.success(isCompleted ? "Lesson completed!" : "Lesson marked as incomplete");
                                    } catch (error) {
                                        console.error("Failed to toggle completion", error);
                                        // Revert on failure
                                        setRegistration({ ...registration, completedLessonIds: currentCompleted });
                                        toast.error("Failed to update progress");
                                    }
                                }}
                            />
                        </GlassCard>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <GlassCard className="p-6 sticky top-24 space-y-6">
                            <div className="text-3xl font-bold text-primary mb-2">
                                ৳{course.price}
                            </div>

                            {/* --- UPDATED SIDEBAR SECTION FOR STUDENTS --- */}
                            {registration ? (
                                <div className="space-y-4">
                                    {registration.status === 'approved' ? (
                                        // 🟢 APPROVED: SHOW STUDENT DASHBOARD
                                        <div className="rounded-xl bg-gradient-to-b from-green-500/10 to-emerald-500/5 border border-green-500/20 p-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                                                    <CheckCircle className="h-5 w-5 text-green-400" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white text-sm">Course Unlocked</h3>
                                                    <p className="text-xs text-green-400">Welcome back, Student</p>
                                                </div>
                                            </div>

                                            {/* Dynamic Progress Bar */}
                                            <div className="space-y-2 mb-6">
                                                <div className="flex justify-between text-xs text-gray-400">
                                                    <span>Progress</span>
                                                    <span>{Math.round((registration.completedLessonIds?.length || 0) / (course.lessons?.length || 1) * 100)}%</span>
                                                </div>
                                                <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                                                    <div
                                                        className="h-full bg-green-500 transition-all duration-500 ease-out"
                                                        style={{ width: `${((registration.completedLessonIds?.length || 0) / (course.lessons?.length || 1) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Primary Action */}
                                            <Button
                                                className="w-full font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20 transition-all active:scale-95"
                                                onClick={() => {
                                                    const lessonsElement = document.getElementById('lessons-list');
                                                    lessonsElement?.scrollIntoView({ behavior: 'smooth' });
                                                    toast.success("Select a lesson to start watching!");
                                                }}
                                            >
                                                <PlayCircle className="mr-2 h-4 w-4" />
                                                Start Learning
                                            </Button>

                                            {/* Secondary Actions */}
                                            <div className="grid grid-cols-2 gap-2 mt-3">
                                                <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5 text-gray-300 text-xs">
                                                    Course Files
                                                </Button>
                                                <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5 text-gray-300 text-xs">
                                                    Get Help
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        // 🟡 PENDING: SHOW STATUS
                                        <div className="w-full py-6 px-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-center animate-pulse">
                                            <div className="h-12 w-12 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-3">
                                                <Clock className="h-6 w-6 text-yellow-400" />
                                            </div>
                                            <h3 className="font-bold text-yellow-400 mb-1">Verification Pending</h3>
                                            <p className="text-xs text-yellow-200/70 mb-4 px-2">
                                                We are verifying your payment. This usually takes 30-60 minutes.
                                            </p>
                                            <div className="text-xs text-muted-foreground bg-black/20 py-2 rounded">
                                                TrxID: <span className="font-mono text-yellow-500">{registration.trxId || "N/A"}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // 🔵 NOT ENROLLED: SHOW BUY BUTTON
                                <div className="space-y-4">
                                    <Button
                                        size="lg"
                                        className="w-full text-lg font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
                                        onClick={() => {
                                            if (user) {
                                                setShowEnrollModal(true);
                                            } else {
                                                openAuthModal();
                                            }
                                        }}
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
                                    <p className="text-xs text-center text-muted-foreground">
                                        30-Day Money-Back Guarantee • Lifetime Access
                                    </p>
                                </div>
                            )}

                            {course && (
                                <EnrollmentModal
                                    course={course}
                                    open={showEnrollModal}
                                    onOpenChange={setShowEnrollModal}
                                    onSuccess={() => checkRegistration(course.id!)}
                                />
                            )}

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
