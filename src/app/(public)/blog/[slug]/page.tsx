import { CMSService } from "@/lib/cms-service";
import { BlogPostRenderer } from "@/components/blog/blog-post-renderer";
import { notFound } from "next/navigation";
import { Metadata } from "next";

// Force static generation for known paths, fallback for new ones
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

interface Props {
    params: Promise<{ slug: string }>;
}

// 1. Generate Static Params at Build Time
export async function generateStaticParams() {
    const posts = await CMSService.getPosts(true); // Published only
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

// 2. Generate SEO Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const slug = (await params).slug;
    const post = await CMSService.getPostBySlug(slug);

    if (!post) {
        return {
            title: "Post Not Found | Zihad Hasan",
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

// 3. Server Component Renders the Page
export default async function BlogPostPage({ params }: Props) {
    const slug = (await params).slug;
    const post = await CMSService.getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    return <BlogPostRenderer post={post} />;
}
