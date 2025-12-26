"use client";

import { useState } from "react";
import { Lock, PlayCircle, CheckCircle, MonitorPlay, X } from "lucide-react";
import { Course, Lesson, Registration } from "@/lib/cms-service";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

interface LessonsListProps {
    course: Course;
    registration: Registration | null;
    className?: string;
    onEnroll?: () => void;
    onToggleLesson?: (lessonId: string, completed: boolean) => void;
}

export function LessonsList({ course, registration, className, onEnroll, onToggleLesson }: LessonsListProps) {
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [showLockedModal, setShowLockedModal] = useState(false);

    const isApproved = registration?.status === "approved";
    const completedIds = registration?.completedLessonIds || [];

    const handleLessonClick = (lesson: Lesson) => {
        if (lesson.isFreePreview || isApproved) {
            setSelectedLesson(lesson);
        } else {
            setShowLockedModal(true);
        }
    };

    return (
        <div id="lessons-list" className={cn("space-y-4", className)}>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <MonitorPlay className="h-6 w-6 text-primary" />
                Course Content
            </h2>

            <div className="space-y-1">
                {course.lessons && course.lessons.length > 0 ? (
                    course.lessons.map((lesson, index) => {
                        const isCompleted = completedIds.includes(lesson.id);

                        // Sequential Logic: 
                        // If course.isSequential is true, a lesson is unlocked ONLY if:
                        // 1. It is a free preview OR
                        // 2. Previous lesson is completed OR
                        // 3. It is the first lesson
                        let isUnlocked = lesson.isFreePreview || isApproved;

                        if (course.isSequential && isApproved && index > 0) {
                            const prevLessonId = course.lessons[index - 1].id;
                            if (!completedIds.includes(prevLessonId)) {
                                isUnlocked = false;
                            }
                        }

                        // Determine visual state
                        const isSelected = selectedLesson?.id === lesson.id;

                        return (
                            <div
                                key={lesson.id || index}
                                onClick={() => handleLessonClick(lesson)}
                                className={cn(
                                    "group flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer",
                                    isSelected
                                        ? "bg-primary/20 border-primary/50"
                                        : (isUnlocked
                                            ? "bg-transparent border-transparent hover:bg-white/5"
                                            : "bg-transparent border-transparent opacity-50 cursor-not-allowed")
                                )}
                            >
                                {/* Status Icon */}
                                <div className={cn(
                                    "shrink-0 h-6 w-6 rounded-full flex items-center justify-center border",
                                    isCompleted
                                        ? "bg-green-500 text-white border-green-500"
                                        : (isUnlocked
                                            ? "border-gray-500 text-gray-400 group-hover:border-primary group-hover:text-primary"
                                            : "border-gray-700 text-gray-700 bg-gray-900/50")
                                )}>
                                    {isCompleted ? (
                                        <CheckCircle className="h-4 w-4" />
                                    ) : !isUnlocked ? (
                                        <Lock className="h-3 w-3" />
                                    ) : (
                                        <div className="h-2 w-2 rounded-full bg-current" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className={cn(
                                        "text-sm font-medium truncate",
                                        isSelected ? "text-primary" : (isUnlocked ? "text-gray-200 group-hover:text-white" : "text-gray-500")
                                    )}>
                                        {index + 1}. {lesson.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                        {lesson.duration && <span>{lesson.duration}</span>}
                                        {lesson.isFreePreview && (
                                            <span className="text-green-400 bg-green-500/10 px-1.5 rounded text-[10px]">
                                                Free
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        No lessons available.
                    </div>
                )}

            </div>

            {/* Video Player Modal */}
            <Dialog open={!!selectedLesson} onOpenChange={(open) => !open && setSelectedLesson(null)}>
                <DialogContent className="max-w-4xl bg-gray-900/95 border-white/10 text-white backdrop-blur-xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <PlayCircle className="h-5 w-5 text-primary" />
                            {selectedLesson?.title}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="aspect-video w-full bg-black rounded-lg overflow-hidden border border-white/10 relative">
                        {selectedLesson?.videoUrl ? (
                            <iframe
                                src={getEmbedUrl(selectedLesson.videoUrl)}
                                title={selectedLesson.title}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                Video URL not available
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Locked Lesson Premium Modal */}
            <Dialog open={showLockedModal} onOpenChange={setShowLockedModal}>
                <DialogContent className="max-w-md p-0 overflow-hidden bg-zinc-950 border-white/10 text-white">
                    <div className="relative h-32 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                        <div className="h-16 w-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl relative z-10">
                            <Lock className="h-8 w-8 text-white drop-shadow-lg" />
                        </div>
                    </div>

                    <div className="p-6 space-y-4 text-center">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Locked Lesson</h3>
                            <p className="text-gray-400 text-sm">
                                This content is exclusive to enrolled members. Unlock full access to continue your learning journey.
                            </p>
                        </div>

                        <div className="pt-2 space-y-3">
                            {!registration ? (
                                <Button
                                    onClick={() => {
                                        setShowLockedModal(false);
                                        onEnroll?.();
                                    }}
                                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-purple-500/25 py-6 text-lg font-semibold"
                                >
                                    Unlock Full Access
                                </Button>
                            ) : (
                                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-sm">
                                    Your enrollment is <strong>{registration.status}</strong>. Please wait for admin approval.
                                </div>
                            )}
                            <Button
                                variant="ghost"
                                onClick={() => setShowLockedModal(false)}
                                className="w-full text-gray-400 hover:text-white"
                            >
                                Maybe Later
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Helper to convert common video URLs to embed format
function getEmbedUrl(url: string): string {
    if (!url) return "";

    // YouTube
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
        let videoId = "";
        if (url.includes("youtu.be")) {
            videoId = url.split("/").pop() || "";
        } else if (url.includes("v=")) {
            videoId = url.split("v=")[1].split("&")[0];
        } else if (url.includes("embed/")) {
            return url;
        }
        return `https://www.youtube.com/embed/${videoId}`;
    }

    // Vimeo
    if (url.includes("vimeo.com")) {
        const videoId = url.split("/").pop();
        return `https://player.vimeo.com/video/${videoId}`;
    }

    // Default: Assume it's already an embed link or direct video file if supported
    return url;
}
