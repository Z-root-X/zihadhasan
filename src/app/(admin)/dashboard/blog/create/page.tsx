"use client";

import { BlogEditor } from "@/components/admin/blog-editor";

export default function CreateBlogPostPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Create New Post</h2>
                <p className="text-muted-foreground">Share your thoughts with the world.</p>
            </div>

            <BlogEditor />
        </div>
    );
}
