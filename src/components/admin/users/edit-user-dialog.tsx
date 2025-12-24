"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { ImageUploader } from "@/components/admin/image-uploader";
import { UserProfile } from "@/components/auth/auth-provider";
import { useEffect } from "react";

const userSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    role: z.enum(["admin", "user"]),
    phone: z.string().optional().or(z.literal("")),
    photoURL: z.string().optional().or(z.literal("")),
});

type UserFormValues = z.infer<typeof userSchema>;

interface EditUserDialogProps {
    user: UserProfile | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (uid: string, data: UserFormValues) => Promise<void>;
}

export function EditUserDialog({ user, open, onOpenChange, onSubmit }: EditUserDialogProps) {
    const form = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: "",
            role: "user",
            phone: "",
            photoURL: ""
        }
    });

    useEffect(() => {
        if (user) {
            form.reset({
                name: user.name || "",
                role: (user.role as "admin" | "user") || "user",
                phone: user.phone || "",
                photoURL: user.photoURL || ""
            });
        }
    }, [user, form]);

    const handleSubmit = async (data: UserFormValues) => {
        if (user?.uid) {
            await onSubmit(user.uid, data);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>Edit User Profile</DialogTitle>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Profile Photo</Label>
                        <Controller
                            control={form.control}
                            name="photoURL"
                            render={({ field }) => (
                                <ImageUploader
                                    value={field.value || ""}
                                    onChange={field.onChange}
                                    label="Upload Photo"
                                    className="aspect-square w-32 mx-auto"
                                />
                            )}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" {...form.register("name")} className="bg-black/50 border-white/10" />
                        {form.formState.errors.name && (
                            <p className="text-xs text-red-400">{form.formState.errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Controller
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger className="bg-black/50 border-white/10">
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                        <SelectItem value="user">User</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" {...form.register("phone")} className="bg-black/50 border-white/10" placeholder="+880..." />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="hover:bg-white/10 hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.formState.isSubmitting} className="bg-primary hover:bg-primary/90 text-white">
                            {form.formState.isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
