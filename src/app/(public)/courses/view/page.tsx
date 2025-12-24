"use client";

import { CourseViewer } from "@/components/courses/course-viewer";
import { Suspense } from "react";

export default function CourseViewerPage() {
    return (
        <Suspense fallback={<div className="min-h-screen pt-24 text-center text-white">Loading viewer...</div>}>
            <CourseViewer />
        </Suspense>
    );
}
