"use client";

import { useEffect, useState, Suspense } from "react";
import { BlogPost, CMSService } from "@/lib/cms-service";
import { usePathname } from "next/navigation";
import { BlogPostRenderer } from "@/components/blog/blog-post-renderer";

function BlogPostContent() {
    const pathname = usePathname();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [slug, setSlug] = useState<string | null>(null);

    useEffect(() => {
        // Extract slug from pathname (e.g., /blog/my-post -> my-post)
        // Note: Firebase rewrite preserves the URL path!
        if (pathname) {
            const parts = pathname.split('/').filter(Boolean);
            const extractedSlug = parts[parts.length - 1]; // Last part is usually the slug
            if (extractedSlug && extractedSlug !== 'view') {
                setSlug(extractedSlug);
            }
        }
    }, [pathname]);

    useEffect(() => {
        if (slug) {
            loadPost(slug);
        }
    }, [slug]);

    const loadPost = async (targetSlug: string) => {
        try {
            // Force fetch from server to get latest data
            const data = await CMSService.getPostBySlug(targetSlug);
            setPost(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!slug) return <div className="min-h-screen pt-24 text-center text-white">Initializing viewer...</div>;
    if (loading) return <div className="min-h-screen pt-24 text-center text-white">Loading post dynamically...</div>;
    if (!post) {
        return (
            <div className="min-h-screen pt-24 text-center text-white flex flex-col items-center justify-center p-4">
                <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
                <p className="text-gray-400 max-w-md">
                    We couldn't find the post "{slug}". It might not exist or hasn't been published yet.
                </p>
                <div className="mt-8">
                    <a href="/blog" className="text-primary hover:underline">Return to Blog</a>
                </div>
            </div>
        );
    }

    return <BlogPostRenderer post={post} />;
}

export default function BlogPostViewerPage() {
    return (
        <Suspense fallback={<div className="min-h-screen pt-24 text-center text-white">Loading viewer...</div>}>
            <BlogPostContent />
        </Suspense>
    );
}
