"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
    User,
    onAuthStateChanged,
    signOut as firebaseSignOut
} from "firebase/auth";
import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
    DocumentData
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

// Define the shape of our User Profile
export interface UserProfile {
    uid: string;
    email: string;
    name: string | null;
    photoURL: string | null;
    role: "user" | "admin";
    phone?: string;
    enrolledCourses?: string[];
    createdAt?: any;
}

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    isAdmin: boolean;
    logout: () => Promise<void>;
    isAuthModalOpen: boolean;
    openAuthModal: () => void;
    closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
    isAdmin: false,
    logout: async () => { },
    isAuthModalOpen: false,
    openAuthModal: () => { },
    closeAuthModal: () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const openAuthModal = () => setIsAuthModalOpen(true);
    const closeAuthModal = () => setIsAuthModalOpen(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                // Fetch User Profile
                const docRef = doc(db, "users", currentUser.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setProfile(docSnap.data() as UserProfile);
                } else {
                    // Create Profile if it doesn't exist (e.g. first Google Login)
                    const newProfile: UserProfile = {
                        uid: currentUser.uid,
                        email: currentUser.email!,
                        name: currentUser.displayName,
                        photoURL: currentUser.photoURL,
                        role: "user", // Default role
                        createdAt: serverTimestamp(),
                        enrolledCourses: []
                    };

                    // Allow writes if it is the own user (per rules)
                    await setDoc(docRef, newProfile);
                    setProfile(newProfile);
                }
            } else {
                setProfile(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        await firebaseSignOut(auth);
    };

    // Derived state
    const isAdmin = profile?.role === "admin" || user?.email === "zihad.connects@gmail.com";

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            loading,
            isAdmin,
            logout,
            isAuthModalOpen,
            openAuthModal,
            closeAuthModal
        }}>
            {children}
        </AuthContext.Provider>
    );
}
