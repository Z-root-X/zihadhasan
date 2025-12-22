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
import { Loader2, Trash2, UserX } from "lucide-react";
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl bg-neutral-900 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>Students: {courseTitle}</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Manage enrolled students for this course.
                    </DialogDescription>
                </DialogHeader>

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
                                        <TableHead className="text-gray-400">Name</TableHead>
                                        <TableHead className="text-gray-400">Email</TableHead>
                                        <TableHead className="text-gray-400">Status</TableHead>
                                        <TableHead className="text-gray-400">Joined</TableHead>
                                        <TableHead className="text-right text-gray-400">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.map((student) => (
                                        <TableRow key={student.id} className="border-white/10 hover:bg-white/5">
                                            <TableCell className="font-medium">{student.name}</TableCell>
                                            <TableCell>{student.email}</TableCell>
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
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => student.id && handleKick(student.id)}
                                                    disabled={kickingId === student.id}
                                                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                                >
                                                    {kickingId === student.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                </Button>
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
