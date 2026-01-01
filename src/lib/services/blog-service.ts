import { db } from "../firebase";
import {
    collection,
    addDoc,
    updateDoc,
    doc,
    getDocs,
    getDoc,
    query,
    orderBy,
    Timestamp,
    where,
    limit,
} from "firebase/firestore";

export interface BlogPost {
    id?: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string; // HTML
    coverImage: string;
    tags: string[];
    published: boolean;
    publishedAt?: Timestamp;
    createdAt?: Timestamp;
    author: {
        name: string;
        avatar?: string;
    };
    readingTime?: number;
    isDeleted?: boolean;
}

export const BlogService = {
    // --- Blog ---
    getPosts: async (publishedOnly: boolean = false) => {
        let q;

        if (publishedOnly) {
            q = query(
                collection(db, "posts"),
                where("isDeleted", "==", false),
                where("published", "==", true)
                // orderBy("publishedAt", "desc") // Removed to avoid index requirement
            );
        } else {
            q = query(
                collection(db, "posts"),
                where("isDeleted", "==", false),
                orderBy("createdAt", "desc")
            );
        }

        const snapshot = await getDocs(q);
        const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));

        // Sort client-side to ensure order without composite index
        posts.sort((a, b) => {
            const dateA = publishedOnly ? (a.publishedAt?.seconds || 0) : (a.createdAt?.seconds || 0);
            const dateB = publishedOnly ? (b.publishedAt?.seconds || 0) : (b.createdAt?.seconds || 0);
            return dateB - dateA;
        });

        return posts;
    },

    getPostBySlug: async (slug: string) => {
        const q = query(collection(db, "posts"), where("slug", "==", slug), limit(1));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as BlogPost;
    },

    getPost: async (id: string) => {
        const docRef = doc(db, "posts", id);
        const snapshot = await getDoc(docRef);
        return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as BlogPost : null;
    },

    checkSlug: async (slug: string, collectionName: string = "posts") => {
        const q = query(
            collection(db, collectionName),
            where("slug", "==", slug),
            where("isDeleted", "==", false)
        );
        const snapshot = await getDocs(q);
        return !snapshot.empty;
    },

    createPost: async (post: Omit<BlogPost, "id" | "createdAt">) => {
        return await addDoc(collection(db, "posts"), {
            ...post,
            isDeleted: false,
            createdAt: Timestamp.now(),
        });
    },

    updatePost: async (id: string, data: Partial<BlogPost>) => {
        const docRef = doc(db, "posts", id);
        await updateDoc(docRef, data);
    },

    deletePost: async (id: string) => {
        await updateDoc(doc(db, "posts", id), { isDeleted: true });
    },
};
