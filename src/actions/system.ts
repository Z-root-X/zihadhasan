

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, writeBatch, doc } from "firebase/firestore";

export async function getSystemStats() {
    // Mock Cloudinary Usage
    // In a real scenario, you would use cloudinary.v2.api.usage() here.
    const storageUsed = 4.2; // GB (Mocked)
    const storageLimit = 25;

    // Firebase Health (Mocked)
    // Real implementation would require Google Cloud Monitoring API.
    return {
        storage: { used: storageUsed, limit: storageLimit },
        firebase: {
            reads: "Low",
            writes: "Normal",
            status: "Healthy"
        }
    };
}

export async function cleanupSoftDeletedItems() {
    const targetCollections = ["projects", "tools", "events", "posts", "courses"];
    let deletedCount = 0;

    // Firestore batch limit is 500 operations.
    // For safety, we'll create a new batch if needed, but here we assume manageable size.
    const batch = writeBatch(db);
    let operationCount = 0;

    for (const colName of targetCollections) {
        const q = query(collection(db, colName), where("isDeleted", "==", true));
        const snapshot = await getDocs(q);

        snapshot.docs.forEach(d => {
            if (operationCount < 450) {
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
}
