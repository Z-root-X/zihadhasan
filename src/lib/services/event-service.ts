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
    writeBatch,
    runTransaction
} from "firebase/firestore";

export interface Event {
    id?: string;
    title: string;
    description: string;
    date: Timestamp;
    pricingType?: 'free' | 'paid';
    price?: number;
    location: string;
    totalSeats: number;
    registeredCount: number;
    isVirtual: boolean;
    imageUrl?: string;
    createdAt?: Timestamp;
    isDeleted?: boolean;
}

export const EventService = {
    // --- Events ---
    addEvent: async (event: Omit<Event, "id" | "createdAt" | "registeredCount">) => {
        return await addDoc(collection(db, "events"), {
            ...event,
            registeredCount: 0,
            isDeleted: false,
            createdAt: Timestamp.now(),
        });
    },

    getEvents: async () => {
        const q = query(
            collection(db, "events"),
            where("isDeleted", "==", false),
            orderBy("date", "asc"),
            limit(20)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Event));
    },

    getEvent: async (id: string) => {
        const docRef = doc(db, "events", id);
        const snapshot = await getDoc(docRef);
        return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as Event : null;
    },

    deleteEvent: async (id: string, deleteRegistrations: boolean = false) => {
        if (deleteRegistrations) {
            // Delete all associated registrations
            const q = query(collection(db, "registrations"), where("eventId", "==", id));
            const snapshot = await getDocs(q);

            // Batch delete (limit 500)
            const batch = writeBatch(db);
            snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });
            await batch.commit();
        }
        // Soft delete event
        await updateDoc(doc(db, "events", id), { isDeleted: true });
    },

    updateEvent: async (id: string, data: Partial<Event>) => {
        const docRef = doc(db, "events", id);
        await updateDoc(docRef, data);
    },

    // --- Event Registration (Concurrency Handled) ---
    // Updated Logic: Defaults to "pending" to allow Admin verification of Payment
    registerForEvent: async (eventId: string, userDetails: { userId?: string; email: string; name: string; phone?: string; trxId?: string }): Promise<{ success: boolean; error?: any; id?: string }> => {
        const eventRef = doc(db, "events", eventId);
        // Schema Enforcement: Use deterministic ID if User ID is known
        const docId = userDetails.userId ? `${userDetails.userId}_${eventId}` : undefined;
        const registrationRef = docId ? doc(db, "registrations", docId) : doc(collection(db, "registrations"));

        try {
            await runTransaction(db, async (transaction) => {
                const eventDoc = await transaction.get(eventRef);
                if (!eventDoc.exists()) {
                    throw "Event does not exist!";
                }

                const eventData = eventDoc.data() as Event;
                const currentRegistered = eventData.registeredCount || 0;
                const totalSeats = eventData.totalSeats;

                if (currentRegistered >= totalSeats) {
                    throw "Sorry, this event is sold out!";
                }

                // Check for duplicate pending/approved registration (email + eventId)
                // Note: Querying strings in transaction is limited. We'll skip strict READ check in transaction for now for speed/cost.
                // Assuming UI prevents simple double-clicks.

                // IMPORTANT: We do NOT increment registeredCount yet.
                // Count is incremented ONLY when Admin approves the registration.

                // Auto-approve if Free
                let status: "pending" | "approved" = "pending";
                if (eventData.pricingType === 'free') {
                    status = "approved";
                    // If approved immediately, we SHOULD increment count now
                    transaction.update(eventRef, { registeredCount: (currentRegistered || 0) + 1 });
                }

                // Sanitize Payload: Remove undefined values (Firestore throws on undefined)
                const payload: any = {
                    eventId,
                    email: userDetails.email,
                    name: userDetails.name,
                    status: status,
                    registeredAt: Timestamp.now(),
                };
                if (userDetails.userId) payload.userId = userDetails.userId;
                if (userDetails.phone) payload.phone = userDetails.phone;
                if (userDetails.trxId) payload.trxId = userDetails.trxId;

                transaction.set(registrationRef, payload);
            });
            return { success: true, id: registrationRef.id };
        } catch (e) {
            console.error("Registration failed: ", e);
            return { success: false, error: e };
        }
    },

    // Added for Access Control Check
    getUserEventRegistration: async (userId: string, eventId: string) => {
        // 1. Try Deterministic ID
        const docId = `${userId}_${eventId}`;
        const docRef = doc(db, "registrations", docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as any; // Using explicit type is better but 'any' matches file convention
        }

        // 2. Fallback Query
        const q = query(collection(db, "registrations"), where("eventId", "==", eventId), where("userId", "==", userId), limit(1));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        const fallbackDoc = snapshot.docs[0];
        return { id: fallbackDoc.id, ...fallbackDoc.data() } as any;
    },
};
