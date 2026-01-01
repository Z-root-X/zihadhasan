import { db } from "../firebase";
import {
    collection,
    addDoc,
    updateDoc,
    doc,
    getDocs,
    getDoc,
    query,
    where,
    limit,
    setDoc,
    Timestamp,
} from "firebase/firestore";
import { Registration } from "./registration-service";

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

export const ShopService = {
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
};
