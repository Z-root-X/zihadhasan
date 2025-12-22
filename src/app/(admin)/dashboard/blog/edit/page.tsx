"use client";

import { useEffect, useState, Suspense } from "react";
import { BlogEditor } from "@/components/admin/blog-editor";
import { BlogPost, CMSService } from "@/lib/cms-service";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

function EditBlogPostContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadPost(id);
        } else {
            setLoading(false);
        }
    }, [id]);

    const loadPost = async (postId: string) => {
        try {
            const fetchedPost = await CMSService.getPost(postId);
            if (fetchedPost) {
                setPost(fetchedPost);
            }
        } catch (error) {
            console.error("Failed to load post", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!id) {
        return (
            <div className="flex h-[50vh] items-center justify-center text-gray-400">
                Invalid Request: Missing Post ID.
            </div>
        );
    }

    if (!post) {
        return (
            <div className="flex h-[50vh] items-center justify-center text-gray-400">
                Post not found.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Edit Post</h2>
                <p className="text-muted-foreground">Make changes to your article.</p>
            </div>
            <BlogEditor initialData={post} />
        </div>
    );
}

export default function EditBlogPostPage() {
    return (
        <Suspense fallback={<div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <EditBlogPostContent />
        </Suspense>
    );
}
