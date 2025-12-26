"use client";

import { useEffect, useState } from "react";
import { Download, Mail, Users, Loader2, Search, Pencil, Trash2, Calendar, Save, X } from "lucide-react";
import { CMSService, Subscriber } from "@/lib/cms-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { downloadCSV } from "@/lib/utils";
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
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/shared/glass-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewsletterPage() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);

    // Filtering State
    const [searchQuery, setSearchQuery] = useState("");
    const [dateFilter, setDateFilter] = useState(""); // YYYY-MM-DD

    // Editing State
    const [editingSubscriber, setEditingSubscriber] = useState<Subscriber | null>(null);
    const [editName, setEditName] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Deleting State
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        loadSubscribers();
    }, []);

    const loadSubscribers = async () => {
        setLoading(true);
        try {
            const data = await CMSService.getSubscribers();
            setSubscribers(data as Subscriber[]);
        } catch (error) {
            console.error("Failed to load subscribers", error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        const headers = ["Name", "Email", "Joined At"];
        const rows = subscribers.map(s => [
            s.name || "N/A",
            s.email,
            s.joinedAt ? new Date(s.joinedAt.seconds * 1000).toISOString() : ""
        ]);

        downloadCSV("subscribers_list.csv", headers, rows);
    };

    // --- Computed / Filtered List ---
    const filteredSubscribers = subscribers.filter(sub => {
        const matchesSearch = sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (sub.name || "").toLowerCase().includes(searchQuery.toLowerCase());

        let matchesDate = true;
        if (dateFilter) {
            const date = sub.joinedAt ? new Date(sub.joinedAt.seconds * 1000).toISOString().slice(0, 10) : "";
            matchesDate = date === dateFilter;
        }

        return matchesSearch && matchesDate;
    });

    // --- Actions ---
    const startEdit = (sub: Subscriber) => {
        setEditingSubscriber(sub);
        setEditName(sub.name || "");
        setEditEmail(sub.email);
    };

    const saveEdit = async () => {
        if (!editingSubscriber || !editingSubscriber.id) return;
        setIsSaving(true);
        try {
            await CMSService.updateSubscriber(editingSubscriber.id, {
                name: editName,
                email: editEmail
            });
            // Update local state
            setSubscribers(prev => prev.map(s =>
                s.id === editingSubscriber.id ? { ...s, name: editName, email: editEmail } : s
            ));
            setEditingSubscriber(null);
        } catch (error) {
            console.error("Failed to update subscriber", error);
        } finally {
            setIsSaving(false);
        }
    };

    const confirmDelete = async () => {
        if (!deletingId) return;
        try {
            await CMSService.deleteSubscriber(deletingId);
            setSubscribers(prev => prev.filter(s => s.id !== deletingId));
            setDeletingId(null);
        } catch (error) {
            console.error("Failed to delete subscriber", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Newsletter</h2>
                    <p className="text-muted-foreground">Manage your audience, clean up lists, and track growth.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleExport} variant="outline" className="border-white/10 text-white hover:bg-white/10">
                        <Download className="mr-2 h-4 w-4" /> Export CSV
                    </Button>
                </div>
            </div>

            {/* Stats & Search Bar */}
            <div className="grid gap-6 md:grid-cols-4">
                <GlassCard className="md:col-span-1 p-6 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users className="w-16 h-16 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-400">Total Subscribers</p>
                        <h3 className="text-3xl font-bold text-white mt-1">{subscribers.length}</h3>
                    </div>
                    <div className="mt-4 flex items-center text-xs text-primary">
                        <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                        Active Audience
                    </div>
                </GlassCard>

                <div className="md:col-span-3 flex flex-col gap-4">
                    {/* Search & Filter Toolbar */}
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col sm:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by email or name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 bg-black/20 border-white/10 text-white focus:border-primary/50 transition-colors"
                            />
                        </div>
                        <div className="relative w-full sm:w-auto">
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="date"
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className="pl-9 bg-black/20 border-white/10 text-white w-full sm:w-[180px] [color-scheme:dark]"
                                />
                            </div>
                            {dateFilter && (
                                <button
                                    onClick={() => setDateFilter("")}
                                    className="absolute -right-2 -top-2 bg-red-500 text-white rounded-full p-0.5 shadow-lg hover:bg-red-600 transition-colors"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main List */}
            <GlassCard className="overflow-hidden">
                <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
                    <h3 className="font-semibold text-white">Subscribers List</h3>
                    <Badge variant="outline" className="border-white/10 text-gray-400">{filteredSubscribers.length} Records</Badge>
                </div>

                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/10 hover:bg-white/5">
                            <TableHead className="text-gray-300">Subscriber</TableHead>
                            <TableHead className="text-gray-300">Joined Date</TableHead>
                            <TableHead className="text-right text-gray-300">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center py-12">
                                    <Loader2 className="animate-spin text-primary h-8 w-8 mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : filteredSubscribers.length > 0 ? (
                            filteredSubscribers.map((sub) => (
                                <TableRow key={sub.id} className="border-white/10 hover:bg-white/5 group">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                                <Mail className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-white">{sub.email}</div>
                                                {sub.name && <div className="text-xs text-gray-500">{sub.name}</div>}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-400 text-sm">
                                        {sub.joinedAt && new Date(sub.joinedAt.seconds * 1000).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="icon" variant="ghost" onClick={() => startEdit(sub)} className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" onClick={() => sub.id && setDeletingId(sub.id)} className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/20">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center py-16 text-gray-500">
                                    <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                    No subscribers found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </GlassCard>

            {/* Edit Dialog */}
            <Dialog open={!!editingSubscriber} onOpenChange={(open) => !open && setEditingSubscriber(null)}>
                <DialogContent className="bg-zinc-950 border-white/10 text-white sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Subscriber</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Update contact information for this subscriber.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-white">Name (Optional)</Label>
                            <Input id="name" value={editName} onChange={(e) => setEditName(e.target.value)} className="bg-white/5 border-white/10 text-white" placeholder="John Doe" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-white">Email Address</Label>
                            <Input id="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="bg-white/5 border-white/10 text-white" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setEditingSubscriber(null)}>Cancel</Button>
                        <Button onClick={saveEdit} disabled={isSaving} className="bg-primary text-black hover:bg-primary/90">
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
                <AlertDialogContent className="bg-zinc-950 border-white/10 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Subscriber?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            This action cannot be undone. This will permanently remove the subscriber from your database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/10 hover:text-white">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 text-white hover:bg-red-700">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
