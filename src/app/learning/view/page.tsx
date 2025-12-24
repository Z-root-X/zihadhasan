"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { CMSService, Course, Registration } from "@/lib/cms-service";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, PlayCircle, Lock, Menu, ArrowLeft } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

function CoursePlayerContent() {
    const { user, loading: authLoading } = useAuth();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();

    // Logic to extract ID from pathname or query param (SPA fallback)
    const [courseId, setCourseId] = useState<string | null>(null);

    useEffect(() => {
        // Priority 1: Query Param ?id=xyz
        const queryId = searchParams.get("id");
        if (queryId) {
            setCourseId(queryId);
            return;
        }

        // Priority 2: Pathname segment /learning/xyz
        if (pathname) {
            const parts = pathname.split('/').filter(Boolean);
            // Expected format: ["learning", "xyz"] or ["learning", "view"] (if fallback)
            const lastPart = parts[parts.length - 1];
            if (lastPart && lastPart !== 'view' && lastPart !== 'learning') {
                setCourseId(lastPart);
            }
        }
    }, [pathname, searchParams]);

    const [course, setCourse] = useState<Course | null>(null);
    const [registration, setRegistration] = useState<Registration | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
    const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);

    useEffect(() => {
        const init = async () => {
            if (!user) return;
            if (!courseId) return;

            try {
                // 1. Check Registration
                const reg = await CMSService.getUserCourseRegistration(user.uid, courseId);

                if (!reg || reg.status !== "approved") {
                    toast.error("Access denied. Please enroll first.");
                    router.push("/my-learning");
                    return;
                }

                setRegistration(reg);
                setCompletedLessonIds(reg.completedLessonIds || []);

                // 2. Fetch Course
                const courseData = await CMSService.getCourse(courseId);
                if (!courseData) {
                    toast.error("Course not found");
                    router.push("/my-learning");
                    return;
                }

                setCourse(courseData);

                // Set initial active lesson (first uncompleted or first overall)
                if (courseData.lessons && courseData.lessons.length > 0) {
                    const firstUncompleted = courseData.lessons.find(l => !reg.completedLessonIds?.includes(l.id));
                    setActiveLessonId(firstUncompleted ? firstUncompleted.id : courseData.lessons[0].id);
                }

            } catch (error) {
                console.error("Error loading course", error);
                toast.error("Fixed to load course");
            } finally {
                setLoading(false);
            }

        };

        if (!authLoading) {
            if (user && courseId) {
                init();
            } else if (user && !courseId) {
                // If we have user but no ID yet (maybe still parsing), wait?
                // actually if courseId is null we just wait.
            } else {
                // Not logged in or loading
                setLoading(false);
            }
        }
    }, [user, authLoading, courseId, router]);

    const handleLessonComplete = async (lessonId: string) => {
        if (!registration?.id) return;

        const isCompleted = completedLessonIds.includes(lessonId);
        const newStatus = !isCompleted; // Toggle

        // Optimistic Update
        setCompletedLessonIds(prev =>
            newStatus
                ? [...prev, lessonId]
                : prev.filter(id => id !== lessonId)
        );

        try {
            await CMSService.toggleLessonCompletion(registration.id, lessonId, newStatus);
            toast.success(newStatus ? "Lesson marked as complete" : "Lesson marked as incomplete");
        } catch (error) {
            console.error("Failed to update progress", error);
            toast.error("Failed to save progress");
            // Revert on error
            setCompletedLessonIds(prev =>
                newStatus
                    ? prev.filter(id => id !== lessonId)
                    : [...prev, lessonId]
            );
        }
    };

    if (authLoading || loading) {
        return (
            <div className="h-screen bg-background flex flex-col">
                <div className="flex-1 container mx-auto p-6 flex gap-6">
                    <div className="flex-1 space-y-4">
                        <Skeleton className="w-full aspect-video rounded-xl" />
                        <Skeleton className="h-8 w-2/3" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                    <div className="w-80 hidden lg:block space-y-4">
                        <Skeleton className="h-full w-full rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    // Wait for ID parsing
    if (!courseId) {
        return <div className="h-screen flex items-center justify-center text-white">Initializing player...</div>;
    }

    if (!user || !course || !registration) {
        return <div className="h-screen flex items-center justify-center text-white">Access Denied</div>;
    }

    const activeLesson = course.lessons.find(l => l.id === activeLessonId);

    const LessonList = () => (
        <div className="flex flex-col h-full bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-black/20">
                <h3 className="font-semibold text-white">Course Content</h3>
                <p className="text-xs text-white/50 mt-1">
                    {completedLessonIds.length} / {course.lessons.length} completed
                </p>
                {/* Visual Progress Bar */}
                <div className="h-1 bg-white/10 rounded-full mt-3 overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${Math.round((completedLessonIds.length / course.lessons.length) * 100)}%` }}
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                <div className="divide-y divide-white/5">
                    {course.lessons.map((lesson, index) => {
                        const isActive = lesson.id === activeLessonId;
                        const isCompleted = completedLessonIds.includes(lesson.id);

                        return (
                            <button
                                key={lesson.id}
                                onClick={() => setActiveLessonId(lesson.id)}
                                className={cn(
                                    "w-full p-4 flex items-start gap-3 text-left hover:bg-white/5 transition-colors",
                                    isActive && "bg-primary/10 hover:bg-primary/10 border-l-2 border-primary"
                                )}
                            >
                                <div className="mt-0.5">
                                    {isCompleted ? (
                                        <CheckCircle className="h-5 w-5 text-green-500 fill-green-500/20" />
                                    ) : (
                                        isActive ? <PlayCircle className="h-5 w-5 text-primary" /> : <Circle className="h-5 w-5 text-white/20" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={cn("text-sm font-medium line-clamp-1", isActive ? "text-primary" : "text-white/80")}>
                                        {index + 1}. {lesson.title}
                                    </p>
                                    <p className="text-xs text-white/40 mt-1">
                                        {lesson.duration || "Video"}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-screen bg-background flex flex-col overflow-hidden">
            {/* Simple Header for Player Mode */}
            <header className="h-16 border-b border-white/10 bg-black/50 backdrop-blur-md flex items-center px-4 justify-between z-10">
                <div className="flex items-center gap-4">
                    <Link href="/my-learning">
                        <Button variant="ghost" size="icon" className="hover:bg-white/10 text-white/70">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-sm font-bold text-white line-clamp-1 hidden md:block">{course.title}</h1>
                        <p className="text-xs text-white/50 md:hidden">Back to Dashboard</p>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div className="lg:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-white">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="p-0 bg-black border-l border-white/10 w-80">
                            <LessonList />
                        </SheetContent>
                    </Sheet>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 ml-0">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {activeLesson ? (
                            <div className="space-y-4">
                                {/* Video Player Container */}
                                <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10 relative group">
                                    {activeLesson.videoUrl ? (
                                        <iframe
                                            src={activeLesson.videoUrl.includes('youtube')
                                                ? activeLesson.videoUrl.replace('watch?v=', 'embed/')
                                                : activeLesson.videoUrl}
                                            className="w-full h-full"
                                            allowFullScreen
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-white/50 bg-zinc-900">
                                            <PlayCircle className="h-16 w-16 mb-4 opacity-50" />
                                            <p>Select a lesson to start learning</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-2">{activeLesson.title}</h2>
                                        <p className="text-white/60 text-sm">Lesson {course.lessons.findIndex(l => l.id === activeLesson.id) + 1} of {course.lessons.length}</p>
                                    </div>
                                    <Button
                                        onClick={() => handleLessonComplete(activeLesson.id)}
                                        variant={completedLessonIds.includes(activeLesson.id) ? "outline" : "default"}
                                        className={cn(
                                            completedLessonIds.includes(activeLesson.id) ? "border-green-500 text-green-500 hover:bg-green-500/10 hover:text-green-500" : ""
                                        )}
                                    >
                                        {completedLessonIds.includes(activeLesson.id) ? (
                                            <>
                                                <CheckCircle className="mr-2 h-4 w-4" /> Completed
                                            </>
                                        ) : (
                                            <>
                                                Mark Complete
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <p className="text-white/50">No lessons available.</p>
                            </div>
                        )}
                    </div>
                </main>

                {/* Desktop Sidebar */}
                <aside className="w-96 border-l border-white/10 bg-black/20 hidden lg:block p-4">
                    <LessonList />
                </aside>
            </div>
        </div>
    );
}

export default function CoursePlayerPage() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center text-white">Loading...</div>}>
            <CoursePlayerContent />
        </Suspense>
    );
}
