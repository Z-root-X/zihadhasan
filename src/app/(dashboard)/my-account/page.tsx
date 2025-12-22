"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { BentoGrid, BentoGridItem } from "@/components/shared/bento-grid";
import {
    User,
    Settings,
    BookOpen,
    Shield,
    Award,
    LogOut,
    User as UserIcon,
    Lock as LockIcon,
    CheckCircle,
    XCircle,
    Edit3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";

export default function MyAccountPage() {
    const { user, profile, logout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: "", phone: "" });
    const [processing, setProcessing] = useState(false);

    // Password Change State
    const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" });
    const [changingPassword, setChangingPassword] = useState(false);

    useEffect(() => {
        if (profile) {
            setEditForm({
                name: profile.name || "",
                phone: profile.phone || ""
            });
        }
    }, [profile]);

    const handleSaveProfile = async () => {
        if (!user) return;
        setProcessing(true);
        try {
            await updateDoc(doc(db, "users", user.uid), {
                name: editForm.name,
                phone: editForm.phone
            });
            setIsEditing(false);
            window.location.reload();
        } catch (error) {
            console.error("Failed to update profile", error);
            alert("Failed to update profile");
        } finally {
            setProcessing(false);
        }
    };

    const handlePasswordChange = async () => {
        if (passwordData.new !== passwordData.confirm) {
            alert("New passwords do not match.");
            return;
        }
        if (passwordData.new.length < 6) {
            alert("Password must be at least 6 characters.");
            return;
        }

        setProcessing(true);
        try {
            if (!user?.email) throw new Error("No user email");

            const credential = EmailAuthProvider.credential(user.email, passwordData.current);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, passwordData.new);

            alert("Password updated successfully!");
            setChangingPassword(false);
            setPasswordData({ current: "", new: "", confirm: "" });
        } catch (error: any) {
            console.error("Password update failed", error);
            if (error.code === 'auth/wrong-password') {
                alert("Incorrect current password.");
            } else if (error.code === 'auth/requires-recent-login') {
                alert("Please log out and log back in before changing your password.");
            } else {
                alert("Failed to update password: " + error.message);
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">
                    Welcome back, {profile?.name || user?.displayName?.split(" ")[0] || "Friend"}!
                </h1>
                <p className="text-gray-400 mt-2">
                    Manage your account settings and track your learning progress.
                </p>
            </div>

            <BentoGrid className="max-w-4xl mx-auto">
                {/* Profile Card */}
                <BentoGridItem
                    title={
                        isEditing ? (
                            <Input
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                className="h-8 bg-black/20 border-white/10 text-white"
                                placeholder="Your Name"
                            />
                        ) : profile?.name || user?.displayName || "User"
                    }
                    description={profile?.email || user?.email}
                    header={
                        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 border border-white/10 p-4 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-black/20" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-20 w-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center overflow-hidden">
                                    {profile?.photoURL ? (
                                        <img src={profile.photoURL} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center">
                                            <UserIcon className="h-10 w-10 text-white/50" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="absolute bottom-4 left-4 z-10">
                                {isEditing ? (
                                    <Input
                                        value={editForm.phone}
                                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                        className="h-8 bg-black/50 border-white/10 text-white w-40"
                                        placeholder="Phone Number"
                                    />
                                ) : (
                                    <div className="text-sm text-gray-400">{profile?.phone || "No Phone Added"}</div>
                                )}
                            </div>

                            <div className="absolute top-2 right-2 z-20">
                                {isEditing ? (
                                    <div className="flex gap-2">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-400 hover:text-green-300 hover:bg-green-900/20" onClick={handleSaveProfile} disabled={processing}>
                                            <CheckCircle className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/20" onClick={() => setIsEditing(false)}>
                                            <XCircle className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10" onClick={() => setIsEditing(true)}>
                                        <Edit3 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    }
                    className="md:col-span-2"
                    icon={<UserIcon className="h-4 w-4 text-neutral-500" />}
                />

                {/* My Learning (Updated Empty State) */}
                <BentoGridItem
                    title="My Learning"
                    description={
                        <span className="text-xs text-neutral-400">
                            Track your enrolled courses here.
                        </span>
                    }
                    header={
                        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 border border-white/10 p-4 relative group">
                            <div className="absolute inset-0 flex flex-col justify-center items-center gap-3 text-neutral-500">
                                <BookOpen className="h-8 w-8 opacity-50" />
                                <span className="text-xs">No active courses found.</span>

                                <Button size="sm" variant="outline" className="h-7 text-xs border-primary/20 text-primary hover:bg-primary/10" onClick={() => window.location.href = "/courses"}>
                                    Browse Courses
                                </Button>
                            </div>
                        </div>
                    }
                    className="md:col-span-1"
                    icon={<BookOpen className="h-4 w-4 text-neutral-500" />}
                />

                {/* Security Card */}
                <BentoGridItem
                    title="Security"
                    description="Manage your password and security settings."
                    header={
                        <div className="p-4 space-y-4">
                            {!changingPassword ? (
                                <Button
                                    variant="outline"
                                    className="w-full justify-start border-white/10 text-gray-300 hover:bg-white/5 hover:text-white"
                                    onClick={() => setChangingPassword(true)}
                                >
                                    <LockIcon className="mr-2 h-4 w-4" /> Change Password
                                </Button>
                            ) : (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                    <Input
                                        type="password"
                                        placeholder="Current Password"
                                        className="h-8 bg-black/20 border-white/10 text-xs"
                                        value={passwordData.current}
                                        onChange={e => setPasswordData({ ...passwordData, current: e.target.value })}
                                    />
                                    <Input
                                        type="password"
                                        placeholder="New Password"
                                        className="h-8 bg-black/20 border-white/10 text-xs"
                                        value={passwordData.new}
                                        onChange={e => setPasswordData({ ...passwordData, new: e.target.value })}
                                    />
                                    <Input
                                        type="password"
                                        placeholder="Confirm New"
                                        className="h-8 bg-black/20 border-white/10 text-xs"
                                        value={passwordData.confirm}
                                        onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                    />
                                    <div className="flex gap-2">
                                        <Button size="sm" className="flex-1 bg-primary text-primary-foreground h-8 text-xs" onClick={handlePasswordChange} disabled={processing}>
                                            {processing ? "Updating..." : "Update"}
                                        </Button>
                                        <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setChangingPassword(false)}>
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    }
                    className="md:col-span-1"
                    icon={<Shield className="h-4 w-4 text-neutral-500" />}
                />

                {/* Certificates */}
                <BentoGridItem
                    title="Certificates"
                    description="View earned certificates."
                    header={
                        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 border border-white/10 flex items-center justify-center">
                            <Award className="h-10 w-10 text-neutral-700" />
                        </div>
                    }
                    className="md:col-span-2"
                    icon={<Award className="h-4 w-4 text-neutral-500" />}
                />
            </BentoGrid>

            {/* Logout Button */}
            <div className="flex justify-center mt-8">
                <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-900/10" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </Button>
            </div>
        </div>
    );
}
