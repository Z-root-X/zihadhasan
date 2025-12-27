
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, writeBatch, getCountFromServer } from "firebase/firestore";

export async function getSystemStats() {
    // 1. Storage (Mocked / Manual for now)
    const storageUsed = 4.2;
    const storageLimit = 25;

    // 2. Database Health (Real Counts)
    const collections = [
        "users",
        "registrations",
        "courses",
        "products",
        "posts",
        "events",
        "projects"
    ];

    const counts: Record<string, number> = {};

    try {
        await Promise.all(collections.map(async (col) => {
            const collRef = collection(db, col);
            const snapshot = await getCountFromServer(collRef);
            counts[col] = snapshot.data().count;
        }));
    } catch (error) {
        console.error("Failed to fetch counts:", error);
    }

    // Calculate total docs as a proxy for 'writes' or general health
    const totalDocs = Object.values(counts).reduce((a, b) => a + b, 0);

    return {
        storage: { used: storageUsed, limit: storageLimit },
        firebase: {
            reads: "Normal", // Cannot easily get quota usage from client SDK
            writes: totalDocs.toString() + " Docs",
            status: "Healthy",
            details: counts
        },
        trash: await getSoftDeletedCount()
    };
}

export async function getSoftDeletedCount() {
    const targetCollections = ["projects", "tools", "events", "posts", "courses", "products"];
    let totalSoftDeleted = 0;

    try {
        await Promise.all(targetCollections.map(async (col) => {
            const q = query(collection(db, col), where("isDeleted", "==", true));
            const snapshot = await getCountFromServer(q);
            totalSoftDeleted += snapshot.data().count;
        }));
    } catch (error) {
        console.error("Failed to count soft deleted:", error);
    }

    return totalSoftDeleted;
}

export async function cleanupSoftDeletedItems() {
    const targetCollections = ["projects", "tools", "events", "posts", "courses", "products"];
    let deletedCount = 0;

    const batch = writeBatch(db);
    let operationCount = 0;

    try {
        for (const colName of targetCollections) {
            const q = query(collection(db, colName), where("isDeleted", "==", true));
            const snapshot = await getDocs(q);

            snapshot.docs.forEach(d => {
                if (operationCount < 450) { // Safety buffer for 500 limit
                    batch.delete(d.ref);
                    deletedCount++;
                    operationCount++;
                }
            });
        }

        if (deletedCount > 0) {
            await batch.commit();
        }

        return { success: true, count: deletedCount };
    } catch (error) {
        console.error("Cleanup failed:", error);
        return { success: false, error };
    }
}
