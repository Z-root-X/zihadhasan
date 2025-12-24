"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Course, CourseEditor } from "@/components/admin/course-editor";
import { CourseStudentsDialog } from "@/components/admin/course-students-dialog";
import { GlassCard } from "@/components/shared/glass-card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Edit, Trash2, BookOpen, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [viewingStudentsCourse, setViewingStudentsCourse] = useState<Course | null>(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            // Courses might not have timestamps yet, so orderBy might fail if index missing.
            // Using simple fetch for now.
            const q = query(collection(db, "courses"));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Course));
            setCourses(data);
        } catch (error) {
            console.error("Failed to fetch courses", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (course: Course) => {
        setSelectedCourse(course);
        setIsEditing(true);
    };

    const handleCreate = () => {
        setSelectedCourse(null);
        setIsEditing(true);
    };

    const handleDelete = async (id: string) => {
        // Confirmation handled by AlertDialog
        try {
            await deleteDoc(doc(db, "courses", id));
            setCourses(courses.filter(c => c.id !== id));
            setDeletingId(null);
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    const handleSave = () => {
        setIsEditing(false);
        fetchCourses();
    };

    if (isEditing) {
        return (
            <CourseEditor
                course={selectedCourse}
                onSave={handleSave}
                onCancel={() => setIsEditing(false)}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Course Management</h1>
                    <p className="text-gray-400">Create and manage your educational content.</p>
                </div>
                <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" /> New Course
                </Button>
            </div>

            {loading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Skeleton Grid */}
                    {Array(3).fill(0).map((_, i) => (
                        <div key={i} className="rounded-xl border border-white/5 bg-white/5 overflow-hidden">
                            <Skeleton className="aspect-video w-full bg-white/10" />
                            <div className="p-5 space-y-3">
                                <Skeleton className="h-6 w-3/4 bg-white/10" />
                                <Skeleton className="h-4 w-full bg-white/5" />
                                <Skeleton className="h-4 w-2/3 bg-white/5" />
                                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                                    <Skeleton className="h-5 w-16 bg-white/10" />
                                    <div className="flex gap-2">
                                        <Skeleton className="h-8 w-8 bg-white/10" />
                                        <Skeleton className="h-8 w-8 bg-white/10" />
                                        <Skeleton className="h-8 w-8 bg-white/10" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : courses.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-xl border border-dashed border-white/10 bg-white/5">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium text-white">No courses yet</h3>
                    <p className="text-gray-400 mb-6">Get started by creating your first course.</p>
                    <Button onClick={handleCreate}>Create Course</Button>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {courses.map(course => (
                        <GlassCard key={course.id} className="p-0 overflow-hidden group flex flex-col h-full">
                            <div className="relative aspect-video bg-black/40 overflow-hidden border-b border-white/5">
                                {course.headerImage ? (
                                    <img
                                        src={course.headerImage}
                                        alt={course.title}
                                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-white/20">
                                        <BookOpen className="h-10 w-10" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${course.published ? "bg-green-500/80 text-white" : "bg-yellow-500/80 text-black"
                                        }`}>
                                        {course.published ? "Published" : "Draft"}
                                    </span>
                                </div>
                            </div>
                            <div className="p-5 flex flex-col flex-1">
                                <h3 className="font-bold text-lg text-white mb-2 line-clamp-1">{course.title}</h3>
                                <p className="text-gray-400 text-sm line-clamp-2 mb-4 flex-1">{course.description}</p>

                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                    <span className="font-bold text-primary">৳{course.price}</span>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => setViewingStudentsCourse(course)} className="h-8 w-8 p-0" title="View Students">
                                            <Users className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(course)} className="h-8 w-8 p-0">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => course.id && setDeletingId(course.id)} className="h-8 w-8 p-0 text-red-400 hover:text-red-300">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}

            <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the course and all its lessons.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deletingId && handleDelete(deletingId)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Delete Course
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <CourseStudentsDialog
                open={!!viewingStudentsCourse}
                onOpenChange={(open) => !open && setViewingStudentsCourse(null)}
                courseId={viewingStudentsCourse?.id || null}
                courseTitle={viewingStudentsCourse?.title}
            />
        </div>
    );
}
