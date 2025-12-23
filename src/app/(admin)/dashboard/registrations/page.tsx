"use client";

import { useEffect, useState } from "react";
import { CMSService, Registration, Event, Course } from "@/lib/cms-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, CheckCircle, XCircle, Download, Pencil, Trash2, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { GlassCard } from "@/components/shared/glass-card";
import { downloadCSV } from "@/lib/utils";

export default function RegistrationsPage() {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedEntity, setSelectedEntity] = useState("all"); // Filter by Event or Course ID
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [editingRegistration, setEditingRegistration] = useState<Registration | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const [regData, eventData, courseData] = await Promise.all([
                CMSService.getAllRegistrations(),
                CMSService.getEvents(),
                CMSService.getCourses()
            ]);
            setRegistrations(regData);
            setEvents(eventData);
            setCourses(courseData);
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    }

    // ... handleUpdateRegistration, handleApprove, handleReject (same as before) ...
    const handleUpdateRegistration = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRegistration || !editingRegistration.id) return;

        setProcessingId(editingRegistration.id);
        try {
            await CMSService.updateRegistration(editingRegistration.id, {
                name: editingRegistration.name,
                email: editingRegistration.email,
                phone: editingRegistration.phone,
                trxId: editingRegistration.trxId,
            });
            // Optimistic update
            setRegistrations(prev => prev.map(r => r.id === editingRegistration.id ? editingRegistration : r));
            setEditingRegistration(null);
        } catch (error) {
            console.error(error);
            alert("Failed to update registration");
        } finally {
            setProcessingId(null);
        }
    };

    const handleApprove = async (id: string | undefined) => {
        if (!id) return;
        setProcessingId(id);
        try {
            const result = await CMSService.approveRegistration(id);
            if (result.success) {
                setRegistrations(prev => prev.map(r => r.id === id ? { ...r, status: "approved" } : r));
            } else {
                alert("Failed to approve. " + result.error);
            }
        } catch (error) {
            console.error(error);
            alert("Error approving registration.");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id: string | undefined) => {
        if (!id) return;
        if (!confirm("Are you sure you want to reject (delete) this registration?")) return;

        setProcessingId(id);
        try {
            await CMSService.rejectRegistration(id);
            setRegistrations(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            console.error(error);
            alert("Error rejecting registration.");
        } finally {
            setProcessingId(null);
        }
    };

    const getEntityName = (reg: Registration) => {
        if (reg.eventId) return events.find(e => e.id === reg.eventId)?.title || "Unknown Event";
        if (reg.courseId) return courses.find(c => c.id === reg.courseId)?.title || "Unknown Course";
        return "Unknown";
    };

    const filteredRegistrations = registrations.filter(r => {
        const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.trxId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.phone?.includes(searchTerm);

        const matchesEntity = selectedEntity === "all" || r.eventId === selectedEntity || r.courseId === selectedEntity;
        const matchesStatus = selectedStatus === "all" || r.status === selectedStatus;

        return matchesSearch && matchesEntity && matchesStatus;
    });

    const handleExport = () => {
        if (filteredRegistrations.length === 0) {
            alert("No data to export");
            return;
        }

        const headers = ["Registration ID", "Type", "Title", "Name", "Email", "Phone", "TrxID", "Status", "Date"];
        const rows = filteredRegistrations.map(r => {
            const entityType = r.eventId ? "Event" : "Course";
            const title = getEntityName(r);
            return [
                r.id,
                entityType,
                title,
                r.name,
                r.email,
                r.phone,
                r.trxId,
                r.status,
                r.registeredAt ? new Date(r.registeredAt.seconds * 1000).toISOString() : ""
            ];
        });

        downloadCSV(`registrations_export_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
    };

    if (loading) return <div className="flex justify-center p-12 text-white"><Loader2 className="animate-spin mr-2" /> Loading data...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Registrations</h2>
                    <p className="text-muted-foreground">Manage enrollments for events and courses.</p>
                </div>
                <Button onClick={handleExport} variant="outline" className="border-green-500/20 text-green-400 hover:bg-green-500/10">
                    <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
            </div>

            {/* Filters */}
            <div className="grid gap-4 md:grid-cols-4">
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search TrxID, Name..."
                        className="pl-8 bg-white/5 border-white/10 text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <Select value={selectedEntity} onValueChange={setSelectedEntity}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Filter by Item" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Items</SelectItem>
                        {events.length > 0 && (
                            <>
                                <SelectItem value="disabled-events" disabled className="font-bold opacity-100 mt-2">Events:</SelectItem>
                                {events.map(e => (
                                    <SelectItem key={e.id} value={e.id || "unknown"}>{e.title}</SelectItem>
                                ))}
                            </>
                        )}
                        {courses.length > 0 && (
                            <>
                                <SelectItem value="disabled-courses" disabled className="font-bold opacity-100 mt-2">Courses:</SelectItem>
                                {courses.map(c => (
                                    <SelectItem key={c.id} value={c.id || "unknown"}>{c.title}</SelectItem>
                                ))}
                            </>
                        )}
                    </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                    </SelectContent>
                </Select>

                <div className="flex items-center text-sm text-gray-400">
                    Showing {filteredRegistrations.length} records
                </div>
            </div>

            <GlassCard className="overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/10 hover:bg-white/5">
                            <TableHead className="text-gray-300">User</TableHead>
                            <TableHead className="text-gray-300">Event / Course</TableHead>
                            <TableHead className="text-gray-300">Payment Info</TableHead>
                            <TableHead className="text-gray-300">Proof</TableHead>
                            <TableHead className="text-gray-300">Status</TableHead>
                            <TableHead className="text-right text-gray-300">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredRegistrations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-gray-400">
                                    No registrations found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredRegistrations.map((reg) => {
                                const title = getEntityName(reg);
                                const isCourse = !!reg.courseId;
                                return (
                                    <TableRow key={reg.id} className="border-white/10 hover:bg-white/5">
                                        <TableCell className="font-medium text-white">
                                            <div>{reg.name}</div>
                                            <div className="text-xs text-gray-500">{reg.email}</div>
                                        </TableCell>
                                        <TableCell className="text-gray-300">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className={`text-xs ${isCourse ? 'border-purple-500 text-purple-400' : 'border-blue-500 text-blue-400'}`}>
                                                    {isCourse ? 'Course' : 'Event'}
                                                </Badge>
                                                <span className="truncate max-w-[150px]" title={title}>{title}</span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">{reg.id}</div>
                                        </TableCell>
                                        <TableCell>
                                            {reg.trxId ? (
                                                <Badge variant="outline" className="font-mono border-blue-500/50 text-blue-400 bg-blue-500/10">
                                                    {reg.trxId}
                                                </Badge>
                                            ) : (
                                                <span className="text-xs text-gray-500 italic">Free/No TrxID</span>
                                            )}
                                            {reg.phone && <div className="text-xs text-gray-500 mt-1">{reg.phone}</div>}
                                        </TableCell>
                                        <TableCell>
                                            {reg.screenshotUrl ? (
                                                <a href={reg.screenshotUrl} target="_blank" rel="noopener noreferrer" className="block w-16 h-10 rounded overflow-hidden border border-white/20 hover:border-primary transition-colors relative group">
                                                    <img src={reg.screenshotUrl} alt="Proof" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                        <Search className="h-4 w-4 text-white" />
                                                    </div>
                                                </a>
                                            ) : (
                                                <span className="text-xs text-gray-600">No Img</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`${reg.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                                {reg.status.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                                                    onClick={() => setEditingRegistration(reg)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>

                                                {reg.status === 'pending' && (
                                                    <>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-8 w-8 text-green-400 hover:text-green-300 hover:bg-green-500/20"
                                                            onClick={() => handleApprove(reg.id)}
                                                            disabled={processingId === reg.id}
                                                        >
                                                            {processingId === reg.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                                            onClick={() => handleReject(reg.id)}
                                                            disabled={processingId === reg.id}
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                                {reg.status === 'approved' && (
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                                        onClick={() => handleReject(reg.id)}
                                                        disabled={processingId === reg.id}
                                                        title="Revoke & Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </GlassCard>

            {/* Edit Dialog (Kept same) */}
            <Dialog open={!!editingRegistration} onOpenChange={(open) => !open && setEditingRegistration(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Registration</DialogTitle>
                    </DialogHeader>
                    {editingRegistration && (
                        <form onSubmit={handleUpdateRegistration} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name</label>
                                <Input
                                    value={editingRegistration.name}
                                    onChange={e => setEditingRegistration({ ...editingRegistration, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input
                                    type="email"
                                    value={editingRegistration.email}
                                    onChange={e => setEditingRegistration({ ...editingRegistration, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Phone</label>
                                <Input
                                    value={editingRegistration.phone || ''}
                                    onChange={e => setEditingRegistration({ ...editingRegistration, phone: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">TrxID</label>
                                <Input
                                    value={editingRegistration.trxId || ''}
                                    onChange={e => setEditingRegistration({ ...editingRegistration, trxId: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="ghost" onClick={() => setEditingRegistration(null)}>Cancel</Button>
                                <Button type="submit" disabled={!!processingId}>
                                    {processingId ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
