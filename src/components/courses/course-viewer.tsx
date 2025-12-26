
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
import { cn } from "@/lib/utils";

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

    // UI States
    const [isTheaterMode, setIsTheaterMode] = useState(false);
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

        // If FREE, skip modal and just enroll
        if (course.pricingType === 'free') {
            setRegLoading(true);
            try {
                const result = await CMSService.registerForCourse(course.id!, {
                    email: user.email!,
                    name: user.displayName || "Unknown",
                    userId: user.uid,
                    phone: profile?.phone
                });

                if (result.success) {
                    toast.success("Enrolled successfully!");
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
            return;
        }

        setShowEnrollModal(true);
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

    // Logic for Sidebar Content
    const SidebarContent = () => (
        <div className="space-y-6">
            {/* Student Status / Buy Card */}
            {registration ? (
                <div className="space-y-4">
                    {registration.status === 'approved' ? (
                        <div className="rounded-xl bg-gradient-to-b from-green-500/10 to-emerald-500/5 border border-green-500/20 p-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                                    <CheckCircle className="h-4 w-4 text-green-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm">Course Progress</h3>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-gray-400">
                                    <span>Completed</span>
                                    <span>{Math.round((registration.completedLessonIds?.length || 0) / (course.lessons?.length || 1) * 100)}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                                    <div
                                        className="h-full bg-green-500 transition-all duration-500 ease-out"
                                        style={{ width: `${((registration.completedLessonIds?.length || 0) / (course.lessons?.length || 1) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full py-4 px-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-center">
                            <h3 className="font-bold text-yellow-400 text-sm mb-1">Approval Pending</h3>
                            <p className="text-xs text-yellow-200/70">Access will be granted soon.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="text-2xl font-bold text-primary">
                        {course.pricingType === 'free' ? "Free" : `৳${course.price}`}
                    </div>
                    <Button
                        size="lg"
                        className="w-full font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
                        onClick={handleEnroll}
                        disabled={regLoading}
                    >
                        {regLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Enroll Now"}
                    </Button>
                </div>
            )}

            <div className="h-px bg-white/10" />

            {/* Lessons List in Sidebar */}
            <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Curriculum</h3>
                <LessonsList
                    course={course}
                    registration={registration}
                    onEnroll={handleEnroll}
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
                            toast.success(isCompleted ? "Lesson completed!" : "Progress updated");
                        } catch (error) {
                            console.error("Failed to toggle completion", error);
                            setRegistration({ ...registration, completedLessonIds: currentCompleted }); // Revert
                        }
                    }}
                />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen pb-20 pt-24">
            {course && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(generateCourseSchema(course)),
                    }}
                />
            )}

            <div className={cn(
                "container mx-auto px-4 transition-all duration-300",
                isTheaterMode ? "max-w-[1600px]" : "max-w-7xl"
            )}>
                {/* Enrollment Modal */}
                {course && (
                    <EnrollmentModal
                        course={course}
                        open={showEnrollModal}
                        onOpenChange={setShowEnrollModal}
                        onSuccess={() => checkRegistration(course.id!)}
                    />
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* LEFT (or TOP mobile) - Video Player & Main Content */}
                    <div className={cn(
                        "space-y-6 transition-all duration-300",
                        isTheaterMode ? "lg:col-span-12" : "lg:col-span-8"
                    )}>
                        {/* Video Player Container */}
                        <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                            {/* Placeholder for now - LessonsList handles the modal player, but LMS usually has embedded player. 
                                 Refactoring Note: Implementation Plan shifted LessonsList to Sidebar. 
                                 The 'Selected Lesson' playback state needs to be lifted to CourseViewer to show HERE. 
                                 For now, we will show Course Hero or Last Played Lesson. 
                             */}
                            {course.headerImage ? (
                                <img
                                    src={course.headerImage}
                                    alt={course.title}
                                    className="w-full h-full object-cover opacity-80"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500">
                                    <PlayCircle className="h-16 w-16 opacity-50" />
                                </div>
                            )}

                            <div className="absolute top-4 right-4 z-20">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="bg-black/50 hover:bg-black/70 text-white border border-white/10 backdrop-blur-md"
                                    onClick={() => setIsTheaterMode(!isTheaterMode)}
                                >
                                    {isTheaterMode ? "Exit Theater" : "Theater Mode"}
                                </Button>
                            </div>

                            {/* Overlay Content if not playing */}
                            <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                                <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">{course.title}</h1>
                                <p className="text-gray-300 line-clamp-2">{course.description}</p>
                            </div>
                        </div>

                        {/* Details Tabs / Content */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <GlassCard className="p-6">
                                <h2 className="text-xl font-bold text-white mb-4">About this Course</h2>
                                <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                                    {course.description}
                                </div>
                            </GlassCard>

                            <GlassCard className="p-6">
                                <h2 className="text-xl font-bold text-white mb-4">What you'll learn</h2>
                                <ul className="space-y-2">
                                    {[1, 2, 3].map((_, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                            <CheckCircle className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                                            <span>Comprehensive understanding of the subject matter.</span>
                                        </li>
                                    ))}
                                </ul>
                            </GlassCard>
                        </div>
                    </div>

                    {/* RIGHT - Sidebar (Hidden in Theater Mode) */}
                    {!isTheaterMode && (
                        <div className="lg:col-span-4 space-y-6">
                            <GlassCard className="p-5 sticky top-24 max-h-[85vh] overflow-y-auto custom-scrollbar">
                                <SidebarContent />
                            </GlassCard>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
