"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Link as LinkIcon, Github, Image as ImageIcon } from "lucide-react";
import { Project } from "@/lib/cms-service";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const projectSchema = z.object({
    title: z.string().min(2, "Title is required"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    tags: z.string().min(1, "At least one tag is required"), // We'll parse this from comma-separated string
    imageUrl: z.string().url("Must be a valid URL"),
    liveLink: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    githubLink: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: Project) => Promise<void>;
    initialData?: Project | null;
}

export function ProjectForm({ open, onOpenChange, onSubmit, initialData }: ProjectFormProps) {
    const [submitting, setSubmitting] = useState(false);

    const form = useForm<ProjectFormValues>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            title: "",
            description: "",
            tags: "",
            imageUrl: "",
            liveLink: "",
            githubLink: "",
        },
        values: initialData ? {
            title: initialData.title,
            description: initialData.description,
            tags: initialData.tags.join(", "),
            imageUrl: initialData.imageUrl,
            liveLink: initialData.liveLink,
            githubLink: initialData.githubLink,
        } : undefined
    });

    const handleSubmit = async (values: ProjectFormValues) => {
        setSubmitting(true);
        try {
            await onSubmit({
                ...initialData, // Keep ID if editing
                title: values.title,
                description: values.description,
                tags: values.tags.split(",").map(t => t.trim()).filter(Boolean),
                imageUrl: values.imageUrl,
                liveLink: values.liveLink || "",
                githubLink: values.githubLink || "",
            });
            form.reset();
            onOpenChange(false);
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-black/90 border-white/10 text-white sm:max-w-[600px] backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Edit Project" : "Add New Project"}</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Showcase your latest work. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title" className="text-white">Project Title</Label>
                        <Input
                            id="title"
                            {...form.register("title")}
                            placeholder="e.g. Neon Analytics Dashboard"
                            className="bg-white/5 border-white/10 text-white focus:border-primary/50"
                        />
                        {form.formState.errors.title && (
                            <p className="text-xs text-red-500">{form.formState.errors.title.message}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description" className="text-white">Description</Label>
                        <Textarea
                            id="description"
                            {...form.register("description")}
                            placeholder="Briefly describe the tech stack and problem solved..."
                            className="bg-white/5 border-white/10 text-white min-h-[100px] focus:border-primary/50"
                        />
                        {form.formState.errors.description && (
                            <p className="text-xs text-red-500">{form.formState.errors.description.message}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="tags" className="text-white">Tags (Comma separated)</Label>
                        <Input
                            id="tags"
                            {...form.register("tags")}
                            placeholder="Next.js, Firebase, Tailwind"
                            className="bg-white/5 border-white/10 text-white focus:border-primary/50"
                        />
                        {form.formState.errors.tags && (
                            <p className="text-xs text-red-500">{form.formState.errors.tags.message}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="imageUrl" className="text-white">Image URL</Label>
                        <div className="flex gap-2">
                            <Input
                                id="imageUrl"
                                {...form.register("imageUrl")}
                                placeholder="https://i.ibb.co/..."
                                className="bg-white/5 border-white/10 text-white focus:border-primary/50"
                            />
                        </div>
                        {form.watch("imageUrl") && (
                            <div className="rounded-lg overflow-hidden border border-white/10 h-32 w-full relative group">
                                <img
                                    src={form.watch("imageUrl")}
                                    alt="Preview"
                                    className="h-full w-full object-cover"
                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-xs font-medium text-white">Preview</span>
                                </div>
                            </div>
                        )}
                        {form.formState.errors.imageUrl && (
                            <p className="text-xs text-red-500">{form.formState.errors.imageUrl.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="liveLink" className="text-white">Live Demo</Label>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    id="liveLink"
                                    {...form.register("liveLink")}
                                    className="pl-9 bg-white/5 border-white/10 text-white focus:border-primary/50"
                                    placeholder="https://"
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="githubLink" className="text-white">GitHub Repo</Label>
                            <div className="relative">
                                <Github className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    id="githubLink"
                                    {...form.register("githubLink")}
                                    className="pl-9 bg-white/5 border-white/10 text-white focus:border-primary/50"
                                    placeholder="https://"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-gray-400 hover:text-white hover:bg-white/10">
                        Cancel
                    </Button>
                    <Button onClick={form.handleSubmit(handleSubmit)} disabled={submitting} className="bg-primary text-black hover:bg-primary/90">
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData ? "Save Changes" : "Create Project"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
