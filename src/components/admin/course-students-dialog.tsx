"use client";

import { useEffect, useState } from "react";
import { CMSService, Registration } from "@/lib/cms-service";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, UserX, CheckCircle, Edit } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface CourseStudentsDialogProps {
    courseId: string | null;
    courseTitle?: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CourseStudentsDialog({ courseId, courseTitle, open, onOpenChange }: CourseStudentsDialogProps) {
    const [students, setStudents] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(false);
    const [kickingId, setKickingId] = useState<string | null>(null);

    useEffect(() => {
        if (open && courseId) {
            fetchStudents();
        }
    }, [open, courseId]);

    const fetchStudents = async () => {
        if (!courseId) return;
        setLoading(true);
        try {
            const data = await CMSService.getCourseRegistrations(courseId);
            setStudents(data);
        } catch (error) {
            console.error("Failed to fetch students", error);
        } finally {
            setLoading(false);
        }
    };

    const handleKick = async (registrationId: string) => {
        if (!confirm("Are you sure you want to remove this student?")) return;

        setKickingId(registrationId);
        try {
            // We use CMSService.rejectRegistration for now as it deletes the doc
            await CMSService.rejectRegistration(registrationId);
            setStudents(students.filter(s => s.id !== registrationId));
        } catch (error) {
            console.error("Failed to kick student", error);
        } finally {
            setKickingId(null);
        }
    };

    // ... inside CourseStudentsDialog
    const [editingStudent, setEditingStudent] = useState<Registration | null>(null);

    const handleApprove = async (registrationId: string) => {
        try {
            await CMSService.approveRegistration(registrationId);
            setStudents(students.map(s => s.id === registrationId ? { ...s, status: 'approved' } : s));
            toast.success("Student approved successfully");
        } catch (error) {
            console.error("Failed to approve", error);
            toast.error("Failed to approve student");
        }
    };

    const handleUpdateStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingStudent?.id) return;

        try {
            await CMSService.updateRegistration(editingStudent.id, {
                trxId: editingStudent.trxId,
                phone: editingStudent.phone,
                name: editingStudent.name
            });
            setStudents(students.map(s => s.id === editingStudent.id ? editingStudent : s));
            setEditingStudent(null);
            toast.success("Student info updated");
        } catch (error) {
            console.error(error);
            toast.error("Update failed");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl bg-neutral-900 border-white/10 text-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Students: {courseTitle}</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Manage enrolled students and verify payments.
                    </DialogDescription>
                </DialogHeader>

                {editingStudent && (
                    <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-lg">
                        <h4 className="font-bold mb-4 text-primary">Edit Student Info</h4>
                        <form onSubmit={handleUpdateStudent} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div className="space-y-2">
                                <label className="text-xs">Trx ID</label>
                                <input
                                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1"
                                    value={editingStudent.trxId || ''}
                                    onChange={e => setEditingStudent({ ...editingStudent, trxId: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs">Phone</label>
                                <input
                                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1"
                                    value={editingStudent.phone || ''}
                                    onChange={e => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" type="submit">Save Changes</Button>
                                <Button size="sm" variant="ghost" onClick={() => setEditingStudent(null)}>Cancel</Button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="mt-4">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : students.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-white/10 rounded-lg bg-white/5">
                            <UserX className="h-10 w-10 text-gray-500 mx-auto mb-3" />
                            <p className="text-gray-400">No students enrolled yet.</p>
                        </div>
                    ) : (
                        <div className="border border-white/10 rounded-md overflow-hidden">
                            <Table>
                                <TableHeader className="bg-white/5">
                                    <TableRow className="border-white/10 hover:bg-white/5">
                                        <TableHead className="text-gray-400">Name/Email</TableHead>
                                        <TableHead className="text-gray-400">Payment Info</TableHead>
                                        <TableHead className="text-gray-400">Status</TableHead>
                                        <TableHead className="text-gray-400">Joined</TableHead>
                                        <TableHead className="text-right text-gray-400">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.map((student) => (
                                        <TableRow key={student.id} className="border-white/10 hover:bg-white/5">
                                            <TableCell>
                                                <div className="font-medium">{student.name}</div>
                                                <div className="text-xs text-gray-400">{student.email}</div>
                                                {student.additionalInfo && (
                                                    <div className="text-xs text-yellow-400/80 mt-1">Note: {student.additionalInfo}</div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <span className="text-gray-500">Trx:</span> <span className="font-mono text-white">{student.trxId || "N/A"}</span>
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    <span className="text-gray-500">Phone:</span> {student.phone || "N/A"}
                                                </div>
                                                <div className="text-xs text-gray-500 uppercase">{student.paymentMethod || "N/A"}</div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-0.5 rounded text-xs lowercase ${student.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                                    }`}>
                                                    {student.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-gray-400 text-sm">
                                                {student.registeredAt?.seconds ? format(student.registeredAt.toDate(), "MMM d, yyyy") : "-"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {student.status !== 'approved' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-green-400 hover:text-green-300 hover:bg-green-900/20 h-8 w-8 p-0"
                                                            title="Approve"
                                                            onClick={() => student.id && handleApprove(student.id)}
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                    )}

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 h-8 w-8 p-0"
                                                        title="Edit Info"
                                                        onClick={() => setEditingStudent(student)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-8 w-8 p-0"
                                                        title="Reject/Kick"
                                                        onClick={() => student.id && handleKick(student.id)}
                                                        disabled={kickingId === student.id}
                                                    >
                                                        {kickingId === student.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
