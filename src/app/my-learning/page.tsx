"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { collection, query, where, getDocs, documentId } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { SmartImage } from "@/components/shared/smart-image";
import { Button } from "@/components/ui/button";
import { Lock, PlayCircle } from "lucide-react";
import { CMSService } from "@/lib/cms-service";

export default function MyLearningPage() {
    const { user, loading: authLoading } = useAuth();
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            if (!user) return;

            try {
                // 1. Get ALL my registrations (pending + approved)
                const myRegs = await CMSService.getRegistrationsByUser(user.uid);

                if (myRegs.length === 0) {
                    setCourses([]);
                    setLoading(false);
                    return;
                }

                // Create a map of courseId -> registration to check status easily
                const regMap = new Map<string, any>();
                myRegs.forEach(reg => {
                    if (reg.courseId) {
                        regMap.set(reg.courseId, reg);
                    }
                });

                const courseIds = Array.from(regMap.keys());

                // 2. Fetch courses
                // Firestore 'in' query supports max 10 items.
                if (courseIds.length > 0) {
                    const coursesQuery = query(
                        collection(db, "courses"),
                        where(documentId(), "in", courseIds.slice(0, 10))
                    );
                    const coursesSnap = await getDocs(coursesQuery);
                    const coursesData = coursesSnap.docs.map(doc => {
                        const courseData = doc.data();
                        return {
                            id: doc.id,
                            ...courseData,
                            registrationStatus: regMap.get(doc.id)?.status || 'pending'
                        };
                    });
                    setCourses(coursesData);
                } else {
                    setCourses([]);
                }
            } catch (error) {
                console.error("Failed to fetch my learning", error);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            if (user) {
                fetchCourses();
            } else {
                setLoading(false);
            }
        }
    }, [user, authLoading]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <div className="container mx-auto py-12 px-6 flex-1 space-y-8">
                    <Skeleton className="h-10 w-48" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} className="aspect-video w-full h-[300px]" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return <div className="min-h-screen flex items-center justify-center text-white">Please log in to view your courses.</div>;
    }

    return (
        <main className="min-h-screen bg-background flex flex-col">
            <div className="flex-1 container mx-auto py-12 px-6">
                <h1 className="text-3xl font-bold mb-8 text-white">My Learning</h1>

                {courses.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10">
                        <Lock className="h-12 w-12 text-white/20 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-white mb-2">No courses enrolled yet</h2>
                        <p className="text-white/50 mb-6">Enroll in a course to start your journey.</p>
                        <Link href="/courses">
                            <Button variant="default">Browse Courses</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course: any) => {
                            const isLocked = course.registrationStatus !== 'approved';

                            return (
                                <Link href={`/learning/${course.id}`} key={course.id} className="group block h-full">
                                    <div className={`bg-white/5 border rounded-xl overflow-hidden transition-colors h-full flex flex-col ${isLocked ? 'border-amber-500/30' : 'border-white/10 hover:border-primary/50'}`}>
                                        <div className="relative aspect-video">
                                            <SmartImage
                                                src={course.headerImage}
                                                alt={course.title}
                                                fill
                                                className={isLocked ? "grayscale opacity-60" : ""}
                                            />
                                            <div className={`absolute inset-0 flex items-center justify-center ${isLocked ? 'bg-black/40' : 'bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity'}`}>
                                                {isLocked ? <Lock className="h-10 w-10 text-amber-500" /> : <PlayCircle className="h-12 w-12 text-white" />}
                                            </div>
                                            {isLocked && (
                                                <div className="absolute top-2 right-2 bg-amber-500 text-black text-xs font-bold px-2 py-1 rounded">
                                                    Verification Pending
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col">
                                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                                {course.title}
                                            </h3>
                                            {isLocked && <p className="text-amber-400 text-xs mb-2">Wait for admin verification to unlock.</p>}
                                            <p className="text-white/50 text-sm line-clamp-2 mb-4 flex-1">
                                                {course.description}
                                            </p>
                                            <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
                                                <span>{course.lessons?.length || 0} Lessons</span>
                                                <span className={isLocked ? "text-amber-500 font-medium" : "text-green-400 font-medium"}>
                                                    {isLocked ? "Locked" : "Unlocked"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
