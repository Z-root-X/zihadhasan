"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Calendar as CalendarIcon, MapPin, Users, Globe, Image as ImageIcon } from "lucide-react";
import { Event } from "@/lib/cms-service";
import { Timestamp } from "firebase/firestore";

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
import { Switch } from "@/components/ui/switch"; // Ensure this component exists from Week 1

const eventSchema = z.object({
    title: z.string().min(2, "Title is required"),
    description: z.string().min(10, "Description is required"),
    date: z.string().refine((val) => new Date(val) > new Date(), {
        message: "Date must be in the future",
    }),
    location: z.string().min(2, "Location or URL is required"),
    totalSeats: z.number().min(1, "Must have at least 1 seat"),
    isVirtual: z.boolean(),
    imageUrl: z.string().url().optional().or(z.literal("")),
});

type EventFormValues = z.infer<typeof eventSchema>;

interface EventFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: Omit<Event, "id" | "createdAt" | "registeredCount">) => Promise<void>;
    initialData?: Event | null;
}

export function EventForm({ open, onOpenChange, onSubmit, initialData }: EventFormProps) {
    const [submitting, setSubmitting] = useState(false);

    const form = useForm<EventFormValues>({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            title: "",
            description: "",
            date: "", // HTML datetime-local input
            location: "",
            totalSeats: 50,
            isVirtual: false,
            imageUrl: "",
        },
        values: initialData ? {
            title: initialData.title,
            description: initialData.description,
            // Convert Firestore Timestamp to HTML datetime-local string (YYYY-MM-DDTHH:mm)
            date: initialData.date ? new Date(initialData.date.seconds * 1000).toISOString().slice(0, 16) : "",
            location: initialData.location,
            totalSeats: initialData.totalSeats,
            isVirtual: initialData.isVirtual,
            imageUrl: initialData.imageUrl || "",
        } : undefined
    });

    const handleSubmit = async (values: EventFormValues) => {
        setSubmitting(true);
        try {
            await onSubmit({
                ...initialData || {} as any, // Cast to avoid TS issues with missing properties on partial update
                title: values.title,
                description: values.description,
                date: Timestamp.fromDate(new Date(values.date)),
                location: values.location,
                totalSeats: values.totalSeats,
                isVirtual: values.isVirtual,
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
            <DialogContent className="bg-black/90 border-white/10 text-white sm:max-w-[600px] backdrop-blur-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Edit Event" : "Create Event"}</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Schedule an upcoming speaking engagement or workshop.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title" className="text-white">Event Title</Label>
                        <Input id="title" {...form.register("title")} className="bg-white/5 border-white/10 text-white" />
                        {form.formState.errors.title && <p className="text-xs text-red-500">{form.formState.errors.title.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="date" className="text-white">Date & Time</Label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    id="date"
                                    type="datetime-local"
                                    {...form.register("date")}
                                    className="pl-9 bg-white/5 border-white/10 text-white [color-scheme:dark]"
                                />
                            </div>
                            {form.formState.errors.date && <p className="text-xs text-red-500">{form.formState.errors.date.message}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="totalSeats" className="text-white">Total Seats</Label>
                            <div className="relative">
                                <Users className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    id="totalSeats"
                                    type="number"
                                    {...form.register("totalSeats", { valueAsNumber: true })}
                                    className="pl-9 bg-white/5 border-white/10 text-white"
                                />
                            </div>
                            {form.formState.errors.totalSeats && <p className="text-xs text-red-500">{form.formState.errors.totalSeats.message}</p>}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 py-2">
                        <Switch
                            id="isVirtual"
                            checked={form.watch("isVirtual")}
                            onCheckedChange={(c) => form.setValue("isVirtual", c)}
                        />
                        <Label htmlFor="isVirtual" className="text-white">Virtual Event (Online)</Label>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="location" className="text-white">{form.watch("isVirtual") ? "Meeting Link" : "Venue Location"}</Label>
                        <div className="relative">
                            {form.watch("isVirtual") ? (
                                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                            ) : (
                                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                            )}
                            <Input
                                id="location"
                                {...form.register("location")}
                                placeholder={form.watch("isVirtual") ? "https://meet.google.com/..." : "Dhaka, Bangladesh"}
                                className="pl-9 bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        {form.formState.errors.location && <p className="text-xs text-red-500">{form.formState.errors.location.message}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description" className="text-white">Description</Label>
                        <Textarea id="description" {...form.register("description")} className="bg-white/5 border-white/10 text-white min-h-[100px]" />
                        {form.formState.errors.description && <p className="text-xs text-red-500">{form.formState.errors.description.message}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="imageUrl" className="text-white">Event Banner URL (Optional)</Label>
                        <Input id="imageUrl" {...form.register("imageUrl")} placeholder="https://..." className="bg-white/5 border-white/10 text-white" />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-gray-400 hover:text-white">Cancel</Button>
                    <Button onClick={form.handleSubmit(handleSubmit)} disabled={submitting} className="bg-primary text-black">
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData ? "Save Changes" : "Publish Event"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
