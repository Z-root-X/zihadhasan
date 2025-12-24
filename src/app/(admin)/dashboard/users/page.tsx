"use client";

import { useEffect, useState } from "react";
import { UserProfile } from "@/components/auth/auth-provider";
import { GlassCard } from "@/components/shared/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Loader2, Search, Trash2, Shield, Ban, Pencil, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
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
import { EditUserDialog } from "@/components/admin/users/edit-user-dialog";
import { CMSService } from "@/lib/cms-service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function UsersPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [processing, setProcessing] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

    // Pagination State
    const [lastVisible, setLastVisible] = useState<any>(null);
    const [pageStack, setPageStack] = useState<any[]>([null]); // Stack of "startAfter" cursors
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const USERS_PER_PAGE = 20;

    useEffect(() => {
        fetchUsers();
    }, []);

    // Reset pagination when search changes
    useEffect(() => {
        if (searchTerm) {
            // If searching, we skip pagination logic for now and just filter client side 
            // OR we validly implement search. 
            // For this iteration, let's keep search acting on "loaded" users or reset?
            // Actually, client-side filtering on paginated data is bad UX.
            // But implementation of Full Text Search in Firestore is hard.
            // Let's assume search filters CURRENT page for now, or fetch all?
            // "Gap Analysis" doc said: "Optimize... by implementing pagination."
            // Let's keep search simple: It filters the DISPLAYED users.
            // Ideally, we would search backend, but that requires Algolia/Elastic.
        }
    }, [searchTerm]);

    const fetchUsers = async (cursor: any = null) => {
        setLoading(true);
        try {
            // Note: If searching, we might want to disable pagination or search all?
            // For now, standard pagination.
            const { users: newUsers, lastVisible: newLast } = await CMSService.getUsers(cursor, USERS_PER_PAGE);

            const mappedUsers = newUsers.map(u => ({ ...u, uid: u.id } as unknown as UserProfile));
            setUsers(mappedUsers);
            setLastVisible(newLast);
            setHasMore(newUsers.length === USERS_PER_PAGE); // Rough check

        } catch (error) {
            console.error("Failed to fetch users", error);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const loadNext = () => {
        if (!hasMore) return;
        setPageStack([...pageStack, lastVisible]);
        setCurrentPage(currentPage + 1);
        fetchUsers(lastVisible);
    };

    const loadPrevious = () => {
        if (currentPage <= 1 || pageStack.length <= 1) return;
        const newStack = [...pageStack];
        newStack.pop(); // Remove current page's cursor
        const prevCursor = newStack[newStack.length - 1]; // Get previous page's cursor

        setPageStack(newStack);
        setCurrentPage(currentPage - 1);
        fetchUsers(prevCursor);
    };

    const handleUpdateUser = async (uid: string, data: any) => {
        try {
            await CMSService.updateUser(uid, data);
            setUsers(users.map(u => u.uid === uid ? { ...u, ...data } : u));
            toast.success("User updated successfully");
            setEditingUser(null);
        } catch (error) {
            console.error("Failed to update user", error);
            toast.error("Failed to update user");
        }
    };

    const toggleRole = async (uid: string, currentRole: string) => {
        setProcessing(uid);
        try {
            const newRole = currentRole === "admin" ? "user" : "admin";
            await CMSService.updateUser(uid, { role: newRole });
            setUsers(users.map(u => u.uid === uid ? { ...u, role: newRole } : u));
            toast.success(`Role updated to ${newRole}`);
        } catch (error) {
            console.error("Failed to update role", error);
            toast.error("Failed to change role");
        } finally {
            setProcessing(null);
        }
    };

    const toggleBan = async (uid: string, isBanned: boolean) => {
        setProcessing(uid);
        try {
            await CMSService.updateUser(uid, { isBanned: !isBanned });
            setUsers(users.map(u => u.uid === uid ? { ...u, isBanned: !isBanned } : u));
            toast.success(isBanned ? "User unbanned" : "User banned");
        } catch (error) {
            console.error("Failed to ban/unban user", error);
            toast.error("Failed to update ban status");
        } finally {
            setProcessing(null);
        }
    };

    const handleDelete = async (uid: string) => {
        // Confirmation is done via AlertDialog
        setProcessing(uid);
        try {
            await CMSService.deleteUser(uid);
            setUsers(users.filter(u => u.uid !== uid));
            setDeletingId(null);
            toast.success("User profile deleted");
        } catch (error) {
            console.error("Error deleting user", error);
            toast.error("Failed to delete user");
        } finally {
            setProcessing(null);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">User Directory</h1>
                    <p className="text-gray-400">Manage registered users and permissions.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search users..."
                        className="pl-9 w-[250px] bg-white/5 border-white/10 text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <GlassCard className="p-0 overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/10 hover:bg-white/5">
                            <TableHead className="text-gray-400">Name</TableHead>
                            <TableHead className="text-gray-400">Email</TableHead>
                            <TableHead className="text-gray-400">Role</TableHead>
                            <TableHead className="text-gray-400">Joined</TableHead>
                            <TableHead className="text-right text-gray-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                                </TableCell>
                            </TableRow>
                        ) : filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.uid} className="border-white/10 hover:bg-white/5">
                                    <TableCell className="font-medium text-white">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-[1px]">
                                                <div className="h-full w-full rounded-full bg-black overflow-hidden">
                                                    {user.photoURL ? (
                                                        <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-xs font-bold text-white">
                                                            {user.name?.[0] || "?"}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {user.name || "No Name"}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-300">{user.email}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-gray-400">
                                        {user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString() : "N/A"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                disabled={processing === user.uid}
                                                onClick={() => setEditingUser(user)}
                                                className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                                                title="Edit User"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>

                                            {/* Role Toggle */}
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                disabled={processing === user.uid}
                                                onClick={() => toggleRole(user.uid, user.role)}
                                                className={cn(
                                                    "h-8 w-8 p-0 hover:bg-white/10",
                                                    user.role === 'admin' ? "text-purple-400" : "text-gray-400 hover:text-white"
                                                )}
                                                title={user.role === 'admin' ? "Demote to User" : "Promote to Admin"}
                                            >
                                                <Shield className={cn("h-4 w-4", user.role === 'admin' && "fill-current")} />
                                            </Button>

                                            {/* Ban Toggle */}
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                disabled={processing === user.uid || user.uid === users.find(u => u.role === 'admin')?.uid}
                                                onClick={() => toggleBan(user.uid, !!user.isBanned)}
                                                className={cn(
                                                    "h-8 w-8 p-0 hover:bg-white/10",
                                                    user.isBanned ? "text-green-400" : "text-orange-400 hover:text-orange-300"
                                                )}
                                                title={user.isBanned ? "Unban User" : "Ban User"}
                                            >
                                                {user.isBanned ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                disabled={processing === user.uid}
                                                onClick={() => setDeletingId(user.uid)}
                                                className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                                title="Delete Profile"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </GlassCard>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-2">
                <div className="text-sm text-gray-400">
                    Page {currentPage}
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={loadPrevious}
                        disabled={currentPage === 1 || loading}
                        className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={loadNext}
                        disabled={!hasMore || loading}
                        className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
                    >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            </div>

            <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User Profile?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This removes the user profile data from the database. <br />
                            <span className="font-bold text-red-400">Note: This does NOT delete the Firebase Auth account.</span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deletingId && handleDelete(deletingId)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Delete Profile
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <EditUserDialog
                user={editingUser}
                open={!!editingUser}
                onOpenChange={(open) => !open && setEditingUser(null)}
                onSubmit={handleUpdateUser}
            />
        </div >
    );
}
