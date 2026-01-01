import { db } from "../firebase";
import {
    collection,
    doc,
    getDocs,
    deleteDoc,
    updateDoc,
    query,
    orderBy,
    limit,
    Timestamp,
    where,
    runTransaction,
} from "firebase/firestore";
import { Event } from "./event-service";

export interface Registration {
    id?: string;
    eventId?: string;
    courseId?: string;
    productId?: string;
    userId?: string;
    email: string;
    name: string;
    phone?: string;
    trxId?: string;
    screenshotUrl?: string; // Payment Proof
    paymentMethod?: string;
    additionalInfo?: string;
    status: "approved" | "pending";
    registeredAt: Timestamp;
    completedLessonIds?: string[]; // IDs of completed lessons
}

export const RegistrationService = {
    // Admin Action: Approve Registration
    approveRegistration: async (registrationId: string) => {
        const regRef = doc(db, "registrations", registrationId);

        try {
            await runTransaction(db, async (transaction) => {
                const regDoc = await transaction.get(regRef);
                if (!regDoc.exists()) throw "Registration not found";

                const regData = regDoc.data() as Registration;
                if (regData.status === "approved") throw "Already approved";

                let notificationTitle = "Registration Approved";
                let notificationMessage = "Your registration has been approved.";
                let notificationLink = "/courses"; // Default redirect

                // Only check Event limits if it's an Event registration
                if (regData.eventId) {
                    const eventRef = doc(db, "events", regData.eventId);
                    const eventDoc = await transaction.get(eventRef);
                    if (!eventDoc.exists()) throw "Event not found";

                    const eventData = eventDoc.data() as Event;
                    if ((eventData.registeredCount || 0) >= eventData.totalSeats) {
                        throw "Event is full, cannot approve more seats.";
                    }

                    transaction.update(eventRef, { registeredCount: (eventData.registeredCount || 0) + 1 });
                    notificationTitle = "Event Registration Approved";
                    notificationMessage = `Your registration for "${eventData.title}" is confirmed!`;
                    notificationLink = `/events`;
                } else if (regData.courseId) {
                    // Fetch course title for better message
                    const courseRef = doc(db, "courses", regData.courseId);
                    const courseDoc = await transaction.get(courseRef);
                    if (courseDoc.exists()) {
                        const courseTitle = courseDoc.data().title;
                        notificationMessage = `You now have access to "${courseTitle}".`;
                        notificationLink = `/courses/view?id=${regData.courseId}`;
                    }
                }

                transaction.update(regRef, { status: "approved" });

                // Create Notification Doc (Only if user is a registered user with an ID)
                if (regData.userId) {
                    const notifRef = doc(collection(db, "users", regData.userId, "notifications"));
                    transaction.set(notifRef, {
                        title: notificationTitle,
                        message: notificationMessage,
                        link: notificationLink,
                        read: false,
                        createdAt: Timestamp.now()
                    });
                }
            });
            return { success: true };
        } catch (e) {
            console.error("Approval failed: ", e);
            return { success: false, error: e };
        }
    },

    // Admin Action: Reject Registration
    rejectRegistration: async (registrationId: string) => {
        await deleteDoc(doc(db, "registrations", registrationId));
        return { success: true };
    },

    updateRegistration: async (id: string, data: Partial<Registration>) => {
        const docRef = doc(db, "registrations", id);
        await updateDoc(docRef, data);
    },

    bulkApproveRegistrations: async (ids: string[]) => {
        // Process sequentially to reuse complex transactional logic (validations, seat counts, notifications)
        const results = [];
        for (const id of ids) {
            results.push(await RegistrationService.approveRegistration(id));
        }
        return results;
    },

    bulkRejectRegistrations: async (ids: string[]) => {
        const promises = ids.map(id => deleteDoc(doc(db, "registrations", id)));
        await Promise.all(promises);
    },

    getRegistrations: async (eventId?: string) => {
        // If eventId provided, filter by it. Else get all (for Dashboard).
        let q;
        if (eventId) {
            q = query(collection(db, "registrations"), where("eventId", "==", eventId), orderBy("registeredAt", "desc"));
        } else {
            q = query(collection(db, "registrations"), orderBy("registeredAt", "desc"), limit(50)); // Cap for safety
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Registration));
    },

    getAllRegistrations: async (limitCount: number = 100) => {
        const q = query(collection(db, "registrations"), orderBy("registeredAt", "desc"), limit(limitCount));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Registration));
    },

    // --- Registrations Queries ---
    getRegistrationsByUser: async (userId: string) => {
        // Query by userId to match security rules
        const q = query(collection(db, "registrations"), where("userId", "==", userId), orderBy("registeredAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Registration));
    },
};
