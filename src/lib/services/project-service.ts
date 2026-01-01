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
    where,
    limit,
} from "firebase/firestore";

export interface Project {
    id?: string;
    title: string;
    description: string;
    tags: string[];
    imageUrl: string;
    liveLink: string;
    githubLink: string;
    createdAt?: Timestamp;
    isDeleted?: boolean;
}

export interface Tool {
    id?: string;
    name: string;
    description: string;
    category: string;
    url: string;
    imageUrl?: string;
    createdAt?: Timestamp;
    isDeleted?: boolean;
}

export const ProjectService = {
    // --- Projects ---
    addProject: async (project: Project) => {
        return await addDoc(collection(db, "projects"), {
            ...project,
            isDeleted: false,
            createdAt: Timestamp.now(),
        });
    },

    getProjects: async () => {
        const q = query(
            collection(db, "projects"),
            where("isDeleted", "==", false),
            orderBy("createdAt", "desc"),
            limit(20)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Project));
    },

    deleteProject: async (id: string) => {
        // Soft Delete
        await updateDoc(doc(db, "projects", id), { isDeleted: true });
    },

    updateProject: async (id: string, data: Partial<Project>) => {
        const docRef = doc(db, "projects", id);
        await updateDoc(docRef, data);
    },

    bulkDeleteProjects: async (ids: string[]) => {
        const promises = ids.map(id => updateDoc(doc(db, "projects", id), { isDeleted: true }));
        await Promise.all(promises);
    },

    // --- Tools ---
    addTool: async (tool: Tool) => {
        return await addDoc(collection(db, "tools"), {
            ...tool,
            isDeleted: false,
            createdAt: Timestamp.now(),
        });
    },

    getTools: async () => {
        const q = query(
            collection(db, "tools"),
            where("isDeleted", "==", false),
            orderBy("createdAt", "desc"),
            limit(20)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Tool));
    },

    deleteTool: async (id: string) => {
        // Soft Delete
        await updateDoc(doc(db, "tools", id), { isDeleted: true });
    },

    updateTool: async (id: string, data: Partial<Tool>) => {
        const docRef = doc(db, "tools", id);
        await updateDoc(docRef, data);
    },

    bulkDeleteTools: async (ids: string[]) => {
        const promises = ids.map(id => updateDoc(doc(db, "tools", id), { isDeleted: true }));
        await Promise.all(promises);
    },
};
