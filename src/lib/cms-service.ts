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
    limit,
    startAfter,
    writeBatch
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
    bankAccounts?: {
        bankName: string;
        accountName: string;
        accountNumber: string;
        branch: string;
        routingNo: string;
    }[];

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
    siteLogo?: string;
    siteFavicon?: string;

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
    pricingType?: 'free' | 'paid';
    price?: number;
    isSequential?: boolean;
    headerImage?: string;
    published: boolean;
    lessons: Lesson[];
    createdAt?: Timestamp;
    isDeleted?: boolean;
}

export interface Lesson {
    id: string;
    title: string;
    videoUrl: string; // YouTube or Vimeo
    duration?: string;
    isFreePreview: boolean;
}

export interface Product {
    id?: string;
    title: string;
    description: string;
    price: number;
    assets: string[]; // Cloudinary URLs
    imageUrl: string; // Cover Image
    type: 'digital' | 'physical';
    downloadUrl?: string; // Encrypted or hidden until approved
    published: boolean;
    createdAt?: Timestamp;
    isDeleted?: boolean;
}

export const CMSService = {
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
        // Note: For registrations, we might want to keep them or mark them?
        // Let's just soft delete the event for now.
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
                        notificationLink = `/courses/view?id=${regData.courseId}`;
                    }
                }

                transaction.update(regRef, { status: "approved" });

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
            results.push(await CMSService.approveRegistration(id));
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

    // --- Products (Shop) ---
    // --- Products (Shop) ---
    getProducts: async () => {
        const q = query(
            collection(db, "products"),
            where("isDeleted", "==", false)
            // orderBy("createdAt", "desc") // Removed to avoid index requirement
        );
        const snapshot = await getDocs(q);
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        return products.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    },

    getPublishedProducts: async () => {
        const q = query(
            collection(db, "products"),
            where("published", "==", true),
            where("isDeleted", "==", false)
            // orderBy("createdAt", "desc") // Removed to avoid index requirement
        );
        const snapshot = await getDocs(q);
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        return products.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    },

    getProduct: async (id: string) => {
        const docRef = doc(db, "products", id);
        const snapshot = await getDoc(docRef);
        return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as Product : null;
    },

    getSecureProductContent: async (id: string) => {
        // This query will fail unless the user has an approved registration (Security Rules)
        const docRef = doc(db, "products", id, "secure", "content");
        const snapshot = await getDoc(docRef);
        return snapshot.exists() ? snapshot.data()?.downloadUrl : null;
    },

    addProduct: async (product: Omit<Product, "id" | "createdAt">) => {
        // Separate sensitive data
        const { downloadUrl, ...publicData } = product;

        // Sanitize
        const sanitized = Object.fromEntries(
            Object.entries(publicData).filter(([_, v]) => v !== undefined)
        );

        const docRef = await addDoc(collection(db, "products"), {
            ...sanitized,
            isDeleted: false,
            createdAt: Timestamp.now(),
        });

        // Store secure content in sub-collection
        if (downloadUrl) {
            const secureRef = doc(db, "products", docRef.id, "secure", "content");
            await setDoc(secureRef, { downloadUrl });
        }

        return docRef;
    },

    updateProduct: async (id: string, data: Partial<Product>) => {
        const { downloadUrl, ...publicData } = data;
        const docRef = doc(db, "products", id);

        if (Object.keys(publicData).length > 0) {
            await updateDoc(docRef, publicData);
        }

        if (downloadUrl !== undefined) {
            const secureRef = doc(db, "products", id, "secure", "content");
            await setDoc(secureRef, { downloadUrl }, { merge: true });
        }
    },

    deleteProduct: async (id: string) => {
        await updateDoc(doc(db, "products", id), { isDeleted: true });
    },

    // --- Product Registration (Purchase) ---
    registerForProduct: async (productId: string, userDetails: { userId?: string; email: string; name: string; phone?: string; trxId?: string; screenshotUrl?: string; paymentMethod?: string; additionalInfo?: string }) => {
        // Enforce deterministic ID for easy security rule lookup: userId_productId
        // If no userId (guest), fallback to random ID (but they can't access secure content anyway)
        const docId = userDetails.userId ? `${userDetails.userId}_${productId}` : undefined;
        const registrationRef = docId ? doc(db, "registrations", docId) : doc(collection(db, "registrations"));
        try {
            // Check duplicates (optional, maybe allowed for physical?) - enforcing unique for digital
            if (userDetails.userId) {
                const q = query(
                    collection(db, "registrations"),
                    where("productId", "==", productId),
                    where("userId", "==", userDetails.userId)
                );
                const existing = await getDocs(q);
                if (!existing.empty) return { success: false, error: "Already purchased this product" };
            }

            const payload: any = {
                productId,
                email: userDetails.email,
                name: userDetails.name,
                status: "pending", // Always pending for products unless free
                registeredAt: Timestamp.now()
            };
            if (userDetails.userId) payload.userId = userDetails.userId;
            if (userDetails.phone) payload.phone = userDetails.phone;
            if (userDetails.trxId) payload.trxId = userDetails.trxId;
            if (userDetails.screenshotUrl) payload.screenshotUrl = userDetails.screenshotUrl;

            await setDoc(registrationRef, payload);
            return { success: true, id: registrationRef.id };
        } catch (e) {
            console.error("Product purchase failed", e);
            return { success: false, error: e };
        }
    },

    getUserProductPurchase: async (userId: string, productId: string) => {
        const q = query(
            collection(db, "registrations"),
            where("productId", "==", productId),
            where("userId", "==", userId),
            where("status", "==", "approved"),
            limit(1)
        );
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Registration;
    },
    deleteMessage: async (id: string) => {
        await deleteDoc(doc(db, "messages", id));
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
    readingTime?: number;
    isDeleted?: boolean;
}
