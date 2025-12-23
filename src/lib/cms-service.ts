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
    Timestamp,
    getDoc,
    setDoc,
    runTransaction,
    where,
    limit
} from "firebase/firestore";

export interface Event {
    id?: string;
    title: string;
    description: string;
    date: Timestamp;
    location: string;
    totalSeats: number;
    registeredCount: number;
    isVirtual: boolean;
    imageUrl?: string;
    createdAt?: Timestamp;
}

export interface Registration {
    id?: string;
    eventId?: string;
    courseId?: string;
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
}

export interface Project {
    id?: string;
    title: string;
    description: string;
    tags: string[];
    imageUrl: string;
    liveLink: string;
    githubLink: string;
    createdAt?: Timestamp;
}

export interface Tool {
    id?: string;
    name: string;
    description: string;
    category: string;
    url: string;
    imageUrl?: string;
    createdAt?: Timestamp;
}

export interface SocialLink {
    platform: "github" | "twitter" | "linkedin" | "email" | "youtube" | "facebook" | "instagram";
    url: string;
}

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

export interface GlobalSettings {
    // Hero Section
    heroTitle?: string;
    heroSubtitle?: string;
    heroImage?: string;

    // Payment Config
    paymentNumbers?: {
        bkash?: string;
        nagad?: string;
    };

    // Social Media
    socials?: SocialLink[];

    // Feature Flags (Control visibility)
    features?: {
        showBlog: boolean;
        showProjects: boolean;
        showTools: boolean;
        showEvents: boolean;
    };

    // Metadata
    siteTitle?: string;
    siteDescription?: string;
    seoKeywords?: string[];

    // Pages Content Control
    pages?: {
        contact?: {
            title?: string;
            subtitle?: string;
            email?: string;
            location?: string;
        };
        services?: {
            title?: string;
            subtitle?: string;
            email?: string; // Wait, email usually global?
        };
    };
}

export interface Course {
    id?: string;
    title: string;
    description: string;
    price: number;
    headerImage?: string;
    published: boolean;
    lessons: Lesson[];
    createdAt?: Timestamp;
}

export interface Lesson {
    id: string;
    title: string;
    videoUrl: string; // YouTube or Vimeo
    duration?: string;
    isFreePreview: boolean;
}

export const CMSService = {
    // --- Projects ---
    addProject: async (project: Project) => {
        return await addDoc(collection(db, "projects"), {
            ...project,
            createdAt: Timestamp.now(),
        });
    },

    getProjects: async () => {
        const q = query(collection(db, "projects"), orderBy("createdAt", "desc"), limit(20));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
    },

    deleteProject: async (id: string) => {
        await deleteDoc(doc(db, "projects", id));
    },

    updateProject: async (id: string, data: Partial<Project>) => {
        const docRef = doc(db, "projects", id);
        await updateDoc(docRef, data);
    },

    // --- Tools ---
    addTool: async (tool: Tool) => {
        return await addDoc(collection(db, "tools"), {
            ...tool,
            createdAt: Timestamp.now(),
        });
    },

    getTools: async () => {
        const q = query(collection(db, "tools"), orderBy("createdAt", "desc"), limit(20));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tool));
    },

    deleteTool: async (id: string) => {
        await deleteDoc(doc(db, "tools", id));
    },

    updateTool: async (id: string, data: Partial<Tool>) => {
        const docRef = doc(db, "tools", id);
        await updateDoc(docRef, data);
    },

    // --- Messages ---
    addMessage: async (msg: Omit<Message, "id" | "createdAt" | "read">) => {
        return await addDoc(collection(db, "messages"), {
            ...msg,
            read: false,
            createdAt: Timestamp.now(),
        });
    },

    // --- Global Settings ---
    getGlobalSettings: async (): Promise<GlobalSettings | null> => {
        const docRef = doc(db, "settings", "global");
        const snapshot = await getDoc(docRef);
        return snapshot.exists() ? snapshot.data() as GlobalSettings : null;
    },

    updateGlobalSettings: async (data: Partial<GlobalSettings>) => {
        const docRef = doc(db, "settings", "global");
        await setDoc(docRef, data, { merge: true });
    },

    // --- Events ---
    addEvent: async (event: Omit<Event, "id" | "createdAt" | "registeredCount">) => {
        return await addDoc(collection(db, "events"), {
            ...event,
            registeredCount: 0,
            createdAt: Timestamp.now(),
        });
    },

    getEvents: async () => {
        const q = query(collection(db, "events"), orderBy("date", "asc"), limit(20));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
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
            const batch = runTransaction(db, async (transaction) => {
                // We'll just do parallel deletes since transaction might be too big for simple batch? 
                // Actually, simple Promise.all is better for large numbers if not strictly transactional strict consistency requirements
                // But let's simple delete doc
            });
            // Firestore batch limit is 500. Let's just loop delete for simplicity or use batched writes if we want atomicity. 
            // Loop is safer for now without complexity.
            const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
        }
        await deleteDoc(doc(db, "events", id));
    },

    updateEvent: async (id: string, data: Partial<Event>) => {
        const docRef = doc(db, "events", id);
        await updateDoc(docRef, data);
    },



    // --- Event Registration (Concurrency Handled) ---
    // Updated Logic: Defaults to "pending" to allow Admin verification of Payment
    registerForEvent: async (eventId: string, userDetails: { userId?: string; email: string; name: string; phone?: string; trxId?: string }): Promise<{ success: boolean; error?: any; id?: string }> => {
        const eventRef = doc(db, "events", eventId);
        const registrationRef = doc(collection(db, "registrations")); // Auto-ID

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

                transaction.set(registrationRef, {
                    eventId,
                    ...userDetails,
                    status: "pending", // Default to pending
                    registeredAt: Timestamp.now(),
                });
            });
            return { success: true, id: registrationRef.id };
        } catch (e) {
            console.error("Registration failed: ", e);
            return { success: false, error: e };
        }
    },

    // --- Notifications ---
    createNotification: async (userId: string, notification: Omit<UserNotification, "id" | "createdAt" | "read">) => {
        return await addDoc(collection(db, "users", userId, "notifications"), {
            ...notification,
            read: false,
            createdAt: Timestamp.now(),
        });
    },

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
                        notificationLink = `/learning/${regData.courseId}`;
                    }
                }

                transaction.update(regRef, { status: "approved" });

                // Create Notification Doc
                const notifRef = doc(collection(db, "users", regData.userId!, "notifications"));
                transaction.set(notifRef, {
                    title: notificationTitle,
                    message: notificationMessage,
                    link: notificationLink,
                    read: false,
                    createdAt: Timestamp.now()
                });
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

    getAllRegistrations: async () => {
        const q = query(collection(db, "registrations"), orderBy("registeredAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Registration));
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

    updateSubscriber: async (id: string, data: Partial<Subscriber>) => {
        const docRef = doc(db, "subscribers", id);
        await updateDoc(docRef, data);
    },

    deleteSubscriber: async (id: string) => {
        await deleteDoc(doc(db, "subscribers", id));
    },

    // --- Blog ---
    getPosts: async (publishedOnly = true) => {
        // Simple query to avoid Index requirements for initial build
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        let posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));

        if (publishedOnly) {
            posts = posts.filter(p => p.published);
        }

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

    createPost: async (post: Omit<BlogPost, "id" | "createdAt">) => {
        return await addDoc(collection(db, "posts"), {
            ...post,
            createdAt: Timestamp.now(),
        });
    },

    updatePost: async (id: string, data: Partial<BlogPost>) => {
        const docRef = doc(db, "posts", id);
        await updateDoc(docRef, data);
    },

    deletePost: async (id: string) => {
        await deleteDoc(doc(db, "posts", id));
    },

    // --- Registrations Queries ---
    getRegistrationsByUser: async (userId: string) => {
        // Query by userId to match security rules
        const q = query(collection(db, "registrations"), where("userId", "==", userId), orderBy("registeredAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Registration));
    },

    // --- Courses ---
    getCourses: async () => {
        // Get all courses (Admin)
        const q = query(collection(db, "courses"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
    },

    getPublishedCourses: async () => {
        // Get only published courses (Public)
        // MUST use where clause to match Security Rules condition (allow read if published == true)
        const q = query(collection(db, "courses"), where("published", "==", true));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
    },

    getCourse: async (id: string) => {
        const docRef = doc(db, "courses", id);
        const snapshot = await getDoc(docRef);
        return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as Course : null;
    },

    addCourse: async (course: Omit<Course, "id" | "createdAt">) => {
        return await addDoc(collection(db, "courses"), {
            ...course,
            createdAt: Timestamp.now(),
        });
    },

    updateCourse: async (id: string, data: Partial<Course>) => {
        const docRef = doc(db, "courses", id);
        await updateDoc(docRef, data);
    },

    deleteCourse: async (id: string) => {
        await deleteDoc(doc(db, "courses", id));
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
        const registrationRef = doc(collection(db, "registrations"));
        try {
            // Check duplicates (client-side of query) which aligns with Security Rules (must filter by userId)
            const q = query(
                collection(db, "registrations"),
                where("courseId", "==", courseId),
                where("userId", "==", userDetails.userId)
            );
            const existing = await getDocs(q);
            if (!existing.empty) return { success: false, error: "Already registered for this course" };

            await setDoc(registrationRef, {
                courseId,
                ...userDetails,
                status: "pending", // Default to pending for verification
                registeredAt: Timestamp.now()
            });
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
};

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
}
