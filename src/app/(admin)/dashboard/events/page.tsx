"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Calendar, MapPin, Users, Globe, Loader2, ListTodo } from "lucide-react";
import { CMSService, Event } from "@/lib/cms-service";
import { Button } from "@/components/ui/button";
import { EventForm } from "@/components/admin/event-form";
import { Badge } from "@/components/ui/badge";
import { Timestamp } from "firebase/firestore";

import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        setLoading(true);
        try {
            const data = await CMSService.getEvents();
            setEvents(data);
        } catch (error) {
            console.error("Failed to load events", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingEvent(null);
        setIsFormOpen(true);
    };

    const handleEdit = (event: Event) => {
        setEditingEvent(event);
        setIsFormOpen(true);
    };

    const handleSubmit = async (data: any) => {
        if (editingEvent && editingEvent.id) {
            await CMSService.updateEvent(editingEvent.id, data);
        } else {
            await CMSService.addEvent(data);
        }
        await loadEvents();
    };

    const handleDelete = (id: string) => {
        setDeletingEventId(id);
    };

    const executeDelete = async (deleteRegistrations: boolean) => {
        if (!deletingEventId) return;
        setIsDeleting(true);
        try {
            await CMSService.deleteEvent(deletingEventId, deleteRegistrations);
            setEvents(prev => prev.filter(e => e.id !== deletingEventId));
            setDeletingEventId(null);
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete event.");
        } finally {
            setIsDeleting(false);
        }
    };

    const formatDate = (timestamp: Timestamp) => {
        if (!timestamp) return "";
        return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Events</h2>
                    <p className="text-muted-foreground">Manage upcoming workshops and sessions.</p>
                </div>
                <Button onClick={handleCreate} className="bg-primary text-black hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" /> Schedule Event
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="animate-spin text-primary h-8 w-8" />
                </div>
            ) : (
                <div className="space-y-4">
                    {events.map((event) => (
                        <div
                            key={event.id}
                            className="flex flex-col md:flex-row gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:border-primary/20 transition-colors"
                        >
                            {/* Date Badge */}
                            <div className="flex-shrink-0 flex flex-col items-center justify-center p-3 rounded-lg bg-black/40 border border-white/10 w-full md:w-20 text-center">
                                <span className="text-xs uppercase text-gray-500 font-bold">
                                    {event.date && new Date(event.date.seconds * 1000).toLocaleString('default', { month: 'short' })}
                                </span>
                                <span className="text-xl font-bold text-white">
                                    {event.date && new Date(event.date.seconds * 1000).getDate()}
                                </span>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-semibold text-white truncate">{event.title}</h3>
                                    {event.isVirtual && (
                                        <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px] h-5">
                                            Virtual
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-400 mb-2">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {formatDate(event.date)}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {event.isVirtual ? <Globe className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
                                        <span className="truncate max-w-[200px]">{event.location}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Users className="h-3.5 w-3.5" />
                                        <span>{event.registeredCount || 0} / {event.totalSeats} Registered</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 md:self-center">
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={() => handleEdit(event)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => event.id && handleDelete(event.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}

                    {events.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-xl bg-white/5">
                            <ListTodo className="h-10 w-10 text-gray-500 mb-4" />
                            <h3 className="text-xl font-medium text-white">No Events Scheduled</h3>
                            <p className="text-gray-400 mt-2">Create your first event to start accepting registrations.</p>
                        </div>
                    )}
                </div>
            )}

            <EventForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                onSubmit={handleSubmit}
                initialData={editingEvent}
            />

            <AlertDialog open={!!deletingEventId} onOpenChange={(open) => !open && setDeletingEventId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Event?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. How should we handle the registrations associated with this event?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex flex-col gap-2 mt-4">
                        <Button
                            variant="destructive"
                            onClick={() => executeDelete(true)}
                            disabled={isDeleting}
                        >
                            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                            Delete Event & All Registrations
                        </Button>
                        <Button
                            variant="outline"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                            onClick={() => executeDelete(false)}
                            disabled={isDeleting}
                        >
                            Delete Event Only (Keep Data)
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setDeletingEventId(null)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
