import { Metadata } from "next";
import { CMSService } from "@/lib/cms-service";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BlogPostRenderer } from "@/components/blog/blog-post-renderer";

export const dynamicParams = false;

type Props = {
    params: Promise<{ slug: string }>;
};

// Generate static params for all published posts
export async function generateStaticParams() {
    try {
        const posts = await CMSService.getPosts(true);
        if (posts.length === 0) {
            return [{ slug: 'welcome' }];
        }
        return posts.map((post) => ({
            slug: post.slug,
        }));
    } catch (error) {
        console.error("Error in generateStaticParams:", error);
        return [{ slug: 'welcome' }];
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = await CMSService.getPostBySlug(slug);

    if (!post) {
        return {
            title: "Article Not Found",
        };
    }

    return {
        title: `${post.title} | Zihad Hasan`,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            images: post.coverImage ? [post.coverImage] : [],
        },
    };
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const post = await CMSService.getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    return <BlogPostRenderer post={post} />;
}

function ButtonAsLink({ href, children, variant }: { href: string, children: React.ReactNode, variant?: "default" | "outline" }) {
    return (
        <Button asChild variant={variant} className="bg-primary text-black hover:bg-primary/90">
            <Link href={href}>{children}</Link>
        </Button>
    )
}
