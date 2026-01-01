import { db } from "../firebase";
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    query,
    orderBy,
    Timestamp,
    limit,
    startAfter,
} from "firebase/firestore";

export interface Message {
    id?: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    read: boolean;
    createdAt: Timestamp;
}

export interface UserNotification {
    id?: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: Timestamp;
    link?: string;
}

export interface Subscriber {
    id?: string;
    email: string;
    name?: string;
    joinedAt: Timestamp;
}

export const UserService = {
    // --- Messages ---
    addMessage: async (msg: Omit<Message, "id" | "createdAt" | "read">) => {
        return await addDoc(collection(db, "messages"), {
            ...msg,
            read: false,
            createdAt: Timestamp.now(),
        });
    },

    deleteMessage: async (id: string) => {
        await deleteDoc(doc(db, "messages", id));
    },

    // --- Notifications ---
    createNotification: async (userId: string, notification: Omit<UserNotification, "id" | "createdAt" | "read">) => {
        return await addDoc(collection(db, "users", userId, "notifications"), {
            ...notification,
            read: false,
            createdAt: Timestamp.now(),
        });
    },

    // --- Newsletter ---
    subscribeToNewsletter: async (email: string, name?: string) => {
        // Simple add, assuming no duplicates or handled by UI
        return await addDoc(collection(db, "subscribers"), {
            email,
            name: name || null,
            joinedAt: Timestamp.now(),
        });
    },

    getSubscribers: async () => {
        const q = query(collection(db, "subscribers"), orderBy("joinedAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subscriber));
    },

    // --- Users ---
    getUsers: async (lastDoc: any = null, limitCount: number = 20) => {
        let q = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(limitCount));

        if (lastDoc) {
            q = query(collection(db, "users"), orderBy("createdAt", "desc"), startAfter(lastDoc), limit(limitCount));
        }

        const snapshot = await getDocs(q);
        return {
            users: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            lastVisible: snapshot.docs[snapshot.docs.length - 1]
        };
    },

    updateUser: async (uid: string, data: any) => {
        const docRef = doc(db, "users", uid);
        await updateDoc(docRef, data);
    },

    deleteUser: async (uid: string) => {
        await deleteDoc(doc(db, "users", uid));
    },

    updateSubscriber: async (id: string, data: Partial<Subscriber>) => {
        const docRef = doc(db, "subscribers", id);
        await updateDoc(docRef, data);
    },

    deleteSubscriber: async (id: string) => {
        await deleteDoc(doc(db, "subscribers", id));
    },
};
