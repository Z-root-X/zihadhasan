import { db } from "../firebase";
import {
    doc,
    getDoc,
    setDoc,
} from "firebase/firestore";

export interface SocialLink {
    platform: "github" | "twitter" | "linkedin" | "email" | "youtube" | "facebook" | "instagram";
    url: string;
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
        showShop: boolean;
        showCourses: boolean;
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

export const CoreService = {
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
};
