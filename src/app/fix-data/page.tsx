"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function FixDataPage() {
    const [status, setStatus] = useState("Idle");

    useEffect(() => {
        const fix = async () => {
            setStatus("Fixing...");
            try {
                const courseId = "GZ3DL4hfhaQEeFOhzPJB";
                const docRef = doc(db, "courses", courseId);
                const snap = await getDoc(docRef);
                if (!snap.exists()) {
                    setStatus("Course not found");
                    return;
                }
                const data = snap.data();
                if (data.lessons) {
                    const newLessons = data.lessons.map((l: any, i: number) => ({
                        ...l,
                        id: l.id || crypto.randomUUID()
                    }));
                    await updateDoc(docRef, { lessons: newLessons });
                    setStatus("Fixed: " + newLessons.length + " lessons updated.");
                } else {
                    setStatus("No lessons to fix");
                }
            } catch (e: any) {
                console.error(e);
                setStatus("Error: " + e.message);
            }
        };
        fix();
    }, []);

    return (
        <div className="p-10 text-white bg-black h-screen">
            <h1>Data Fixer</h1>
            <pre id="status">{status}</pre>
        </div>
    );
}
