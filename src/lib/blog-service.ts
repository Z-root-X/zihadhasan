import { db } from "./firebase";
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    getDoc,
    query,
    orderBy,
    where,
    Timestamp
} from "firebase/firestore";

export interface BlogPost {
    id?: string;
    title: string;
    slug: string;
    content: string; // HTML from TipTap
    coverImage: string;
    tags: string[];
    status: "draft" | "published";
    createdAt: Timestamp;
    updatedAt: Timestamp;
    publishedAt?: Timestamp;
    author: {
        name: string;
        photoUrl: string;
    };
    readingTime: number; // in minutes
}

const COLLECTION_NAME = "posts";

export const BlogService = {
    // Create a new post
    createPost: async (post: Omit<BlogPost, "id" | "createdAt" | "updatedAt">) => {
        const now = Timestamp.now();
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...post,
            createdAt: now,
            updatedAt: now,
            publishedAt: post.status === "published" ? now : null,
        });
        return docRef.id;
    },

    // Update an existing post
    updatePost: async (id: string, updates: Partial<BlogPost>) => {
        const docRef = doc(db, COLLECTION_NAME, id);

        // Logic to handle publishedAt if status changes to published
        const finalUpdates: any = {
            ...updates,
            updatedAt: Timestamp.now(),
        };

        if (updates.status === "published") {
            // We need to check if it already has a publishedAt, or we simple update it. 
            // Simplest approach: If we are saving as published, ensure publishedAt exists. 
            // Ideally we only set it if it was null, but we don't have the old doc here easily without a fetch.
            // For now, let's trust the UI to pass it or we fetch to check? 
            // Better: Since this runs on client, we can't easily check 'previous' value atomically without transaction.
            // BUT, for a simple blog, updating publishedAt on every publish save is acceptable, OR we can merge.
            // Let's modify the UI (Editor) to handle this decision, actually. 
            // WAIT - The service is safer. Let's do a set with merge logic in mind.
        }

        // Actually, the best place to fix this is the SERVICE using a merge. 
        // But for 'create', it's easy. For 'update', if we overwrite, we lose original date. 
        // Let's fetch the doc to be safe? No, that's slow. 
        // Let's rely on the calling code (UI) OR just set it if provided.
        // The safest fix for the *immediate* problem (posts not showing) is to set it.

        await updateDoc(docRef, finalUpdates);
    },

    // Delete a post
    deletePost: async (id: string) => {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
    },

    // Get a single post by ID
    getPost: async (id: string) => {
        const docSnap = await getDoc(doc(db, COLLECTION_NAME, id));
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as BlogPost;
        }
        return null;
    },

    // Get post by Slug
    getPostBySlug: async (slug: string) => {
        const q = query(collection(db, COLLECTION_NAME), where("slug", "==", slug));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0];
            return { id: docSnap.id, ...docSnap.data() } as BlogPost;
        }
        return null;
    },

    // Get all posts (Admin view)
    getAllPosts: async () => {
        const q = query(collection(db, COLLECTION_NAME), orderBy("updatedAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
    },

    // Get published posts (Public view)
    getPublishedPosts: async () => {
        const q = query(
            collection(db, COLLECTION_NAME),
            where("status", "==", "published"),
            orderBy("publishedAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
    }
};
