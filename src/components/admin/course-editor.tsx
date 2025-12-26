"use client";

import { useState, useEffect } from "react";
import { doc, collection, addDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Trash2, Video, GripVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploader } from "@/components/admin/image-uploader";
import { toast } from "sonner";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export interface Lesson {
    id: string;
    title: string;
    videoUrl: string;
    order: number;
}

export interface Course {
    id?: string;
    title: string;
    description: string;
    pricingType?: 'free' | 'paid';
    price?: number;
    headerImage: string;
    published: boolean;
    lessons: Lesson[];
}

interface CourseEditorProps {
    course?: Course | null;
    onSave: () => void;
    onCancel: () => void;
}

export function CourseEditor({ course, onSave, onCancel }: CourseEditorProps) {
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState(course?.title || "");
    const [description, setDescription] = useState(course?.description || "");
    const [pricingType, setPricingType] = useState<'free' | 'paid'>(course?.pricingType || 'free');
    const [price, setPrice] = useState(course?.price || 0);
    const [headerImage, setHeaderImage] = useState(course?.headerImage || "");
    const [published, setPublished] = useState(course?.published || false);
    const [lessons, setLessons] = useState<Lesson[]>(() => {
        const initial = course?.lessons || [];
        // Backfill IDs if missing
        return initial.map(l => ({
            ...l,
            id: l.id || crypto.randomUUID()
        }));
    });

    // Draft State
    const [showDraftDialog, setShowDraftDialog] = useState(false);
    const [draftToRestore, setDraftToRestore] = useState<any>(null);

    // Auto-save Draft
    useEffect(() => {
        if (course) return; // Only for new courses

        const saveDraft = () => {
            if (!title && !description) return;

            const draftData = {
                title,
                description,
                pricingType,
                price,
                headerImage,
                published,
                lessons,
                savedAt: Date.now()
            };
            localStorage.setItem('course_draft_new', JSON.stringify(draftData));
        };

        const interval = setInterval(saveDraft, 15000);
        return () => clearInterval(interval);
    }, [title, description, pricingType, price, headerImage, published, lessons, course]);

    // Check Draft on Mount
    useEffect(() => {
        if (!course) {
            const savedDraft = localStorage.getItem('course_draft_new');
            if (savedDraft) {
                try {
                    const parsed = JSON.parse(savedDraft);
                    setDraftToRestore(parsed);
                    setShowDraftDialog(true);
                } catch (e) {
                    console.error("Failed to parse draft", e);
                }
            }
        }
    }, [course]);

    const handleRestoreDraft = () => {
        if (draftToRestore) {
            setTitle(draftToRestore.title || "");
            setDescription(draftToRestore.description || "");
            setPricingType(draftToRestore.pricingType || 'free');
            setPrice(draftToRestore.price || 0);
            setHeaderImage(draftToRestore.headerImage || "");
            setPublished(draftToRestore.published || false);
            setLessons(draftToRestore.lessons || []);
            toast.success("Draft Restored");
        }
        setShowDraftDialog(false);
    };

    const handleDiscardDraft = () => {
        localStorage.removeItem('course_draft_new');
        setShowDraftDialog(false);
        toast.info("Draft Discarded");
    };

    const handleAddLesson = () => {
        setLessons([
            ...lessons,
            { id: crypto.randomUUID(), title: "", videoUrl: "", order: lessons.length + 1 }
        ]);
    };

    const handleLessonChange = (index: number, field: keyof Lesson, value: string | number) => {
        const newLessons = [...lessons];
        newLessons[index] = { ...newLessons[index], [field]: value };
        setLessons(newLessons);
    };

    const handleRemoveLesson = (index: number) => {
        setLessons(lessons.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const courseData = {
            title,
            description,
            pricingType,
            price: pricingType === 'free' ? 0 : Number(price),
            headerImage,
            published,
            lessons,
            updatedAt: serverTimestamp()
        };

        try {
            if (course?.id) {
                await updateDoc(doc(db, "courses", course.id), courseData);
                toast.success("Course updated successfully!");
            } else {
                await addDoc(collection(db, "courses"), {
                    ...courseData,
                    createdAt: serverTimestamp()
                });
                toast.success("Course published successfully!");
            }
            if (!course) localStorage.removeItem('course_draft_new');
            onSave();
        } catch (error) {
            console.error("Failed to save course", error);
            toast.error("Failed to save course. Check console.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                    {course ? "Edit Course" : "Create New Course"}
                </h2>
                <div className="flex gap-2">
                    <Button variant="ghost" onClick={onCancel} className="text-white/60">Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading} className="bg-primary text-primary-foreground">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {course ? "Update Course" : "Publish Course"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Meta Data */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="bg-white/5 border-white/10 text-white">
                        <CardHeader>
                            <CardTitle>Course Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Course Title</Label>
                                <Input
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="bg-black/20 border-white/10 text-white"
                                    placeholder="Mastering Next.js"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="bg-black/20 border-white/10 text-white min-h-[100px]"
                                    placeholder="What will students learn?"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/5 border-white/10 text-white">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Curriculum</CardTitle>
                            <Button size="sm" variant="outline" onClick={handleAddLesson} className="border-white/10 hover:bg-white/10">
                                <Plus className="h-4 w-4 mr-2" /> Add Lesson
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {lessons.length === 0 && (
                                <div className="text-center py-8 text-white/40 border-2 border-dashed border-white/10 rounded-lg">
                                    No lessons added yet.
                                </div>
                            )}
                            {lessons.map((lesson, index) => (
                                <div key={index} className="flex gap-3 bg-black/20 p-4 rounded-lg border border-white/5 group">
                                    <div className="mt-3 text-white/30 cursor-grab">
                                        <GripVertical className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <div className="flex gap-3">
                                            <div className="flex-1">
                                                <Label className="text-xs text-white/50">Lesson Title</Label>
                                                <Input
                                                    value={lesson.title}
                                                    onChange={e => handleLessonChange(index, "title", e.target.value)}
                                                    className="h-9 bg-black/20 border-white/10"
                                                />
                                            </div>
                                            <div className="w-20">
                                                <Label className="text-xs text-white/50">Order</Label>
                                                <Input
                                                    type="number"
                                                    value={lesson.order}
                                                    onChange={e => handleLessonChange(index, "order", Number(e.target.value))}
                                                    className="h-9 bg-black/20 border-white/10"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-white/50">Video URL (YouTube/Vimeo)</Label>
                                            <div className="relative">
                                                <Video className="absolute left-3 top-2.5 h-4 w-4 text-white/30" />
                                                <Input
                                                    value={lesson.videoUrl}
                                                    onChange={e => handleLessonChange(index, "videoUrl", e.target.value)}
                                                    className="pl-9 h-9 bg-black/20 border-white/10"
                                                    placeholder="https://youtube.com/..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveLesson(index)} className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card className="bg-white/5 border-white/10 text-white">
                        <CardHeader>
                            <CardTitle>Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <Label>Published</Label>
                                <Switch checked={published} onCheckedChange={setPublished} />
                            </div>

                            <div className="space-y-3">
                                <Label>Pricing</Label>
                                <RadioGroup
                                    value={pricingType}
                                    onValueChange={(v: 'free' | 'paid') => setPricingType(v)}
                                    className="flex flex-col gap-2"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="free" id="r-free" className="border-white/20 text-primary" />
                                        <Label htmlFor="r-free" className="text-sm font-normal cursor-pointer">Free Course</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="paid" id="r-paid" className="border-white/20 text-primary" />
                                        <Label htmlFor="r-paid" className="text-sm font-normal cursor-pointer">Paid Course</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {pricingType === 'paid' && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <Label>Price (BDT)</Label>
                                    <Input
                                        type="number"
                                        value={price}
                                        onChange={e => setPrice(Number(e.target.value))}
                                        className="bg-black/20 border-white/10 text-white"
                                        placeholder="e.g. 5000"
                                    />
                                </div>
                            )}

                            <div className="space-y-2 pt-2 border-t border-white/10">
                                <ImageUploader
                                    label="Course Header Image"
                                    value={headerImage}
                                    onChange={setHeaderImage}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <AlertDialog open={showDraftDialog} onOpenChange={setShowDraftDialog}>
                <AlertDialogContent className="bg-zinc-900 border-white/10 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Unsaved Course Draft Found</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            We found an unsaved course draft from {draftToRestore?.savedAt ? new Date(draftToRestore.savedAt).toLocaleString() : 'a previous session'}.
                            Would you like to restore it?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleDiscardDraft} className="border-white/10 hover:bg-white/10 hover:text-white text-gray-400">
                            Discard
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleRestoreDraft} className="bg-primary text-black hover:bg-primary/90">
                            Restore Draft
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
