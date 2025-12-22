import { db } from "./firebase";
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    query,
    orderBy,
    Timestamp
} from "firebase/firestore";

export interface Registration {
    id?: string;
    name: string;
    email: string;
    phone: string;
    event: string;
    trxId: string;
    status: "Pending" | "Approved" | "Rejected";
    createdAt: Timestamp;
}

const COLLECTION_NAME = "registrations";

export const RegistrationService = {
    // Get all registrations
    getAllRegistrations: async () => {
        const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Registration));
    },

    // Create a new registration (for public form)
    createRegistration: async (data: Omit<Registration, "id" | "createdAt" | "status">) => {
        await addDoc(collection(db, COLLECTION_NAME), {
            ...data,
            status: "Pending",
            createdAt: Timestamp.now(),
        });
    },

    // Update status (Approve/Reject)
    updateStatus: async (id: string, status: "Approved" | "Rejected") => {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, { status });
    },

    // Delete registration
    deleteRegistration: async (id: string) => {
        const docRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(docRef);
    }
};
