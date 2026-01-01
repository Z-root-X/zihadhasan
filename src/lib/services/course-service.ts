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
    setDoc,
    runTransaction
} from "firebase/firestore";
import { Registration } from "./registration-service";

export interface Lesson {
    id: string;
    title: string;
    videoUrl: string; // YouTube or Vimeo
    duration?: string;
    isFreePreview: boolean;
}

export interface Course {
    id?: string;
    title: string;
    description: string;
    pricingType?: 'free' | 'paid';
    price?: number;
    isSequential?: boolean;
    headerImage?: string;
    published: boolean;
    lessons: Lesson[];
    createdAt?: Timestamp;
    isDeleted?: boolean;
}

export const CourseService = {
    // --- Courses ---
    getCourses: async () => {
        // Get all courses (Admin)
        // Note: Fetching ALL and filtering client-side to catch legacy data where isDeleted might be undefined
        const q = query(collection(db, "courses"));
        const snapshot = await getDocs(q);
        return snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Course))
            .filter(c => c.isDeleted !== true); // Show undefined isDeleted as valid
    },

    getPublishedCourses: async () => {
        // Query ONLY published to satisfy Security Rules
        const q = query(
            collection(db, "courses"),
            where("published", "==", true),
            where("isDeleted", "==", false)
        );
        const snapshot = await getDocs(q);
        const courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
        // Client-side sort to match other services
        return courses.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    },

    getCourse: async (id: string) => {
        const docRef = doc(db, "courses", id);
        const snapshot = await getDoc(docRef);
        return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as Course : null;
    },

    addCourse: async (course: Omit<Course, "id" | "createdAt">) => {
        return await addDoc(collection(db, "courses"), {
            ...course,
            isDeleted: false,
            createdAt: Timestamp.now(),
        });
    },

    updateCourse: async (id: string, data: Partial<Course>) => {
        const docRef = doc(db, "courses", id);
        await updateDoc(docRef, data);
    },

    deleteCourse: async (id: string) => {
        await updateDoc(doc(db, "courses", id), { isDeleted: true });
    },

    // --- Course Registrations ---
    getCourseRegistrations: async (courseId?: string) => {
        let q;
        if (courseId) {
            q = query(collection(db, "registrations"), where("courseId", "==", courseId), orderBy("registeredAt", "desc"));
        } else {
            q = query(collection(db, "registrations"), where("courseId", "!=", null), orderBy("registeredAt", "desc"), limit(50));
        }
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Registration));
    },

    registerForCourse: async (courseId: string, userDetails: { userId?: string; email: string; name: string; phone?: string; trxId?: string; screenshotUrl?: string; paymentMethod?: string; additionalInfo?: string }) => {
        // Schema Enforcement: Use deterministic ID if User ID is known
        const docId = userDetails.userId ? `${userDetails.userId}_${courseId}` : undefined;
        const registrationRef = docId ? doc(db, "registrations", docId) : doc(collection(db, "registrations"));
        try {
            // Check duplicates (client-side of query) which aligns with Security Rules (must filter by userId)
            const q = query(
                collection(db, "registrations"),
                where("courseId", "==", courseId),
                where("userId", "==", userDetails.userId)
            );
            const existing = await getDocs(q);
            if (!existing.empty) return { success: false, error: "Already registered for this course" };

            // Fetch course to check pricing
            const courseRef = doc(db, "courses", courseId);
            const courseDoc = await getDoc(courseRef);
            let status: "pending" | "approved" = "pending";

            if (courseDoc.exists()) {
                const courseData = courseDoc.data() as Course;
                if (courseData.pricingType === 'free') {
                    status = "approved";
                }
            }

            // Sanitize Payload
            const payload: any = {
                courseId,
                email: userDetails.email,
                name: userDetails.name,
                status: status,
                registeredAt: Timestamp.now()
            };
            if (userDetails.userId) payload.userId = userDetails.userId;
            if (userDetails.phone) payload.phone = userDetails.phone;
            if (userDetails.trxId) payload.trxId = userDetails.trxId;
            if (userDetails.screenshotUrl) payload.screenshotUrl = userDetails.screenshotUrl;
            if (userDetails.paymentMethod) payload.paymentMethod = userDetails.paymentMethod;
            if (userDetails.additionalInfo) payload.additionalInfo = userDetails.additionalInfo;

            await setDoc(registrationRef, payload);
            return { success: true, id: registrationRef.id };
        } catch (e) {
            console.error("Course reg failed", e);
            return { success: false, error: e };
        }
    },

    getUserCourseRegistration: async (userId: string, courseId: string) => {
        const q = query(collection(db, "registrations"), where("courseId", "==", courseId), where("userId", "==", userId), limit(1));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Registration;
    },

    toggleLessonCompletion: async (registrationId: string, lessonId: string, isCompleted: boolean) => {
        const docRef = doc(db, "registrations", registrationId);
        await runTransaction(db, async (transaction) => {
            const docSnap = await transaction.get(docRef);
            if (!docSnap.exists()) throw new Error("Registration not found");

            const currentCompleted = docSnap.data().completedLessonIds || [];
            let newCompleted;

            if (isCompleted) {
                if (!currentCompleted.includes(lessonId)) {
                    newCompleted = [...currentCompleted, lessonId];
                } else {
                    newCompleted = currentCompleted;
                }
            } else {
                newCompleted = currentCompleted.filter((id: string) => id !== lessonId);
            }

            transaction.update(docRef, { completedLessonIds: newCompleted });
        });
    },
};
