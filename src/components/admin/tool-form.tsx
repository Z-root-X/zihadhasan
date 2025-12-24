"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { Tool } from "@/lib/cms-service";

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
import { ImageUploader } from "@/components/admin/image-uploader";
// Native select used for simplicity
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const toolSchema = z.object({
    name: z.string().min(2, "Name is required"),
    description: z.string().min(5, "Description is required"),
    category: z.string().min(1, "Category is required"),
    url: z.string().url("Must be a valid URL"),
    imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type ToolFormValues = z.infer<typeof toolSchema>;

interface ToolFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: Tool) => Promise<void>;
    initialData?: Tool | null;
}

const CATEGORIES = [
    "Development",
    "Design",
    "Productivity",
    "Writing",
    "Video/Audio",
    "Marketing",
    "Other"
];

export function ToolForm({ open, onOpenChange, onSubmit, initialData }: ToolFormProps) {
    const [submitting, setSubmitting] = useState(false);

    const form = useForm<ToolFormValues>({
        resolver: zodResolver(toolSchema),
        defaultValues: {
            name: "",
            description: "",
            category: "",
            url: "",
            imageUrl: "",
        },
        values: initialData ? {
            name: initialData.name,
            description: initialData.description,
            category: initialData.category,
            url: initialData.url,
            imageUrl: initialData.imageUrl || "",
        } : undefined
    });

    const handleSubmit = async (values: ToolFormValues) => {
        setSubmitting(true);
        try {
            await onSubmit({
                ...initialData,
                name: values.name,
                description: values.description,
                category: values.category,
                url: values.url,
                imageUrl: values.imageUrl,
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
            <DialogContent className="bg-black/90 border-white/10 text-white sm:max-w-[500px] backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Edit AI Tool" : "Add AI Tool"}</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Add a new tool to your curated collection.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name" className="text-white">Tool Name</Label>
                        <Input
                            id="name"
                            {...form.register("name")}
                            placeholder="e.g. ChatGPT"
                            className="bg-white/5 border-white/10 text-white focus:border-primary/50"
                        />
                        {form.formState.errors.name && (
                            <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="category" className="text-white">Category</Label>
                        <select
                            id="category"
                            {...form.register("category")}
                            className="flex h-9 w-full rounded-md border border-white/10 bg-white/5 px-3 py-1 text-sm shadow-sm transition-colors text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="" className="bg-black">Select a category</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat} className="bg-black">{cat}</option>
                            ))}
                        </select>
                        {form.formState.errors.category && (
                            <p className="text-xs text-red-500">{form.formState.errors.category.message}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description" className="text-white">Description</Label>
                        <Textarea
                            id="description"
                            {...form.register("description")}
                            placeholder="What does it do?"
                            className="bg-white/5 border-white/10 text-white min-h-[80px] focus:border-primary/50"
                        />
                        {form.formState.errors.description && (
                            <p className="text-xs text-red-500">{form.formState.errors.description.message}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <ImageUploader
                            label="Logo/Icon"
                            value={form.watch("imageUrl") || ""}
                            onChange={(url) => form.setValue("imageUrl", url)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="url" className="text-white">Website URL</Label>
                        <Input
                            id="url"
                            {...form.register("url")}
                            placeholder="https://..."
                            className="bg-white/5 border-white/10 text-white focus:border-primary/50"
                        />
                        {form.formState.errors.url && (
                            <p className="text-xs text-red-500">{form.formState.errors.url.message}</p>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-gray-400 hover:text-white hover:bg-white/10">
                        Cancel
                    </Button>
                    <Button onClick={form.handleSubmit(handleSubmit)} disabled={submitting} className="bg-primary text-black hover:bg-primary/90">
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData ? "Save Tool" : "Add Tool"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
