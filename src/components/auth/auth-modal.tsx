"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    updateProfile
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Loader2, Mail, Lock, User as UserIcon, Phone, Chrome } from "lucide-react";

export function AuthModal() {
    const { isAuthModalOpen, closeAuthModal } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Form States
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");

    const resetForm = () => {
        setEmail("");
        setPassword("");
        setName("");
        setPhone("");
        setError("");
        setIsLoading(false);
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError("");
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            // Profile creation handled by AuthProvider's onAuthStateChanged
            closeAuthModal();
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to sign in with Google");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            if (isLogin) {
                // Login
                await signInWithEmailAndPassword(auth, email, password);
                closeAuthModal();
            } else {
                // Signup
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Update Auth Profile
                await updateProfile(user, {
                    displayName: name,
                    // photoURL can be default
                });

                // Create Firestore Profile manually here to ensure fields like Phone are saved immediately
                // (AuthProvider might race condition, so explicit write is safe as setDoc merges)
                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    email: user.email!,
                    name: name,
                    phone: phone || null,
                    role: "user",
                    createdAt: serverTimestamp(),
                    enrolledCourses: [],
                    photoURL: user.photoURL
                }, { merge: true });

                closeAuthModal();
            }
            resetForm();
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError("This email is already registered. Please login.");
            } else if (err.code === 'auth/invalid-credential') {
                setError("Invalid email or password.");
            } else {
                setError(err.message || "Authentication failed.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isAuthModalOpen} onOpenChange={(open) => !open && closeAuthModal()}>
            <DialogContent className="sm:max-w-md bg-black/90 border-white/10 backdrop-blur-xl text-white p-0 overflow-hidden gap-0">
                <div className="p-6 pb-0">
                    <DialogTitle className="text-2xl font-bold text-center mb-2">
                        {isLogin ? "Welcome Back" : "Create Account"}
                    </DialogTitle>
                    <p className="text-center text-gray-400 text-sm mb-6">
                        {isLogin ? "Enter your details to access your learning hub." : "Join thousands of students learning with Zihad."}
                    </p>

                    {/* Google Button */}
                    <Button
                        variant="outline"
                        onClick={handleGoogleLogin}
                        className="w-full bg-white text-black hover:bg-gray-100 border-none h-12 font-medium"
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> :
                            <Chrome className="mr-2 h-4 w-4" />}
                        Continue with Google
                    </Button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-black/90 px-2 text-gray-500">Or continue with</span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 pt-0 space-y-4">
                    {!isLogin && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                    <Input
                                        id="name"
                                        placeholder="John Doe"
                                        className="pl-9 bg-white/5 border-white/10 text-white"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone (Optional)</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                    <Input
                                        id="phone"
                                        placeholder="017..."
                                        className="pl-9 bg-white/5 border-white/10 text-white"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="hello@example.com"
                                className="pl-9 bg-white/5 border-white/10 text-white"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="pl-9 bg-white/5 border-white/10 text-white"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isLogin ? "Sign In" : "Create Account"}
                    </Button>

                    <div className="text-center text-sm pt-2">
                        <span className="text-gray-400">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                        </span>
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError("");
                            }}
                            className="text-blue-400 hover:text-blue-300 font-medium hover:underline"
                        >
                            {isLogin ? "Sign up" : "Log in"}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
