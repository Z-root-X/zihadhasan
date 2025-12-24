import { CMSService } from "@/lib/cms-service";
import { BlogPostRenderer } from "@/components/blog/blog-post-renderer";
import { notFound } from "next/navigation";
import { Metadata } from "next";



interface Props {
    params: Promise<{ slug: string }>;
}

// 1. Generate Static Params at Build Time
export async function generateStaticParams() {
    try {
        const posts = await CMSService.getPosts(true); // Published only
        return posts.map((post) => ({
            slug: post.slug,
        }));
    } catch (error) {
        console.warn("Failed to generate static params for blog posts (likely missing index):", error);
        return [];
    }
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
        other: {
            "readingTime": post.readingTime ? `${post.readingTime} min read` : "5 min read"
        }
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
