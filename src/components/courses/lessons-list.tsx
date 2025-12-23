"use client";

import { useState } from "react";
import { Lock, PlayCircle, CheckCircle, MonitorPlay, X } from "lucide-react";
import { Course, Lesson, Registration } from "@/lib/cms-service";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface LessonsListProps {
    course: Course;
    registration: Registration | null;
    className?: string;
}

export function LessonsList({ course, registration, className }: LessonsListProps) {
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [showLockedModal, setShowLockedModal] = useState(false);

    const isApproved = registration?.status === "approved";

    const handleLessonClick = (lesson: Lesson) => {
        if (lesson.isFreePreview || isApproved) {
            setSelectedLesson(lesson);
        } else {
            setShowLockedModal(true);
        }
    };

    return (
        <div className={cn("space-y-4", className)}>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <MonitorPlay className="h-6 w-6 text-primary" />
                Course Content
            </h2>

            <div className="space-y-3">
                {course.lessons && course.lessons.length > 0 ? (
                    course.lessons.map((lesson, index) => {
                        const isUnlocked = lesson.isFreePreview || isApproved;

                        return (
                            <div
                                key={lesson.id || index}
                                onClick={() => handleLessonClick(lesson)}
                                className={cn(
                                    "group flex items-center justify-between p-4 rounded-xl border transition-all duration-300",
                                    isUnlocked
                                        ? "bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer"
                                        : "bg-black/20 border-white/5 opacity-70 cursor-not-allowed hover:border-primary/30"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                                        isUnlocked
                                            ? "bg-primary/20 text-primary group-hover:bg-primary group-hover:text-white transition-colors"
                                            : "bg-white/5 text-gray-500"
                                    )}>
                                        {isUnlocked ? (
                                            <PlayCircle className="h-5 w-5" />
                                        ) : (
                                            <Lock className="h-5 w-5" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className={cn(
                                            "font-medium text-lg",
                                            isUnlocked ? "text-gray-200 group-hover:text-white" : "text-gray-500"
                                        )}>
                                            {index + 1}. {lesson.title}
                                        </h3>
                                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                            {lesson.duration && <span>{lesson.duration}</span>}
                                            {lesson.isFreePreview && (
                                                <span className="text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                                                    Free Preview
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {isUnlocked && (
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-white">
                                            Play
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-8 text-gray-500 bg-white/5 rounded-xl border border-white/5">
                        No lessons available yet.
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
                <DialogContent className="max-w-md bg-black/95 border-white/10 text-white backdrop-blur-xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                            Unlock this Masterclass
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                                <Lock className="h-8 w-8 text-primary" />
                            </div>
                            <p className="text-white/70">
                                This lesson is part of the premium curriculum.
                                {!registration
                                    ? " Enroll now to access all lessons, resources, and mentorship."
                                    : registration.status === 'pending'
                                        ? " Your enrollment is currently pending approval. Please check back soon!"
                                        : " Your enrollment status is currently: " + registration.status
                                }
                            </p>
                        </div>
                    </div>
                    {/* Simplified CTA - in a real app this would go to checkout or status page */}
                    {!registration && (
                        <div className="flex justify-center">
                            <a href="#enroll" onClick={() => setShowLockedModal(false)} className="bg-primary hover:bg-primary/90 text-black font-bold py-2 px-6 rounded-full transition-colors">
                                Enroll Now
                            </a>
                        </div>
                    )}
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
