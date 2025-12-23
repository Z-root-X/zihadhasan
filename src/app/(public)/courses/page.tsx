"use client";

import { useEffect, useState } from "react";
import { CMSService, Course } from "@/lib/cms-service";
import { GlassCard } from "@/components/shared/glass-card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, PlayCircle } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import Link from "next/link";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, openAuthModal } = useAuth();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await CMSService.getPublishedCourses();
                setCourses(data);
            } catch (error) {
                console.error("Failed to load courses", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    Premium Courses
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Master advanced topics with our in-depth, project-based video courses.
                </p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-full rounded-xl border border-white/10 overflow-hidden bg-white/5">
                            <Skeleton className="aspect-video w-full bg-white/10" />
                            <div className="p-6 space-y-4">
                                <Skeleton className="h-6 w-3/4 bg-white/10" />
                                <Skeleton className="h-4 w-full bg-white/5" />
                                <Skeleton className="h-4 w-5/6 bg-white/5" />
                                <div className="pt-4 flex justify-between">
                                    <Skeleton className="h-4 w-20 bg-white/5" />
                                    <Skeleton className="h-4 w-20 bg-white/5" />
                                </div>
                                <Skeleton className="h-10 w-full rounded-md bg-white/10" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map((course, index) => (
                        <motion.div
                            key={course.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link href={`/courses/view?id=${course.id}`} className="block h-full cursor-pointer">
                                <GlassCard className="h-full flex flex-col p-0 overflow-hidden group hover:border-primary/30 transition-colors">
                                    <div className="relative aspect-video bg-neutral-900 overflow-hidden">
                                        {course.headerImage ? (
                                            <img
                                                src={course.headerImage}
                                                alt={course.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-white/10">
                                                <BookOpen className="h-12 w-12" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                            <span className="px-2 py-1 bg-primary/20 backdrop-blur-md text-primary text-xs font-bold rounded uppercase tracking-wider border border-primary/20">
                                                Course
                                            </span>
                                            <span className="font-bold text-white text-lg drop-shadow-md">
                                                ৳{course.price}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-6 flex flex-col flex-1">
                                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                            {course.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm line-clamp-2 mb-6 flex-1">
                                            {course.description}
                                        </p>

                                        <div className="flex items-center justify-between text-xs text-gray-500 mb-6 border-t border-white/5 pt-4">
                                            <div className="flex items-center gap-1.5">
                                                <PlayCircle className="h-3.5 w-3.5" />
                                                <span>{course.lessons?.length || 0} Lessons</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="h-3.5 w-3.5" />
                                                <span>Lifetime Access</span>
                                            </div>
                                        </div>

                                        <Button
                                            className="w-full bg-white/5 hover:bg-primary hover:text-black text-white border border-white/10 transition-all font-semibold"
                                        >
                                            View Details
                                        </Button>
                                    </div>
                                </GlassCard>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/5">
                    <BookOpen className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Courses Available</h3>
                    <p className="text-gray-400">We are currently preparing new content. Check back soon!</p>
                </div>
            )}
        </div>
    );
}
