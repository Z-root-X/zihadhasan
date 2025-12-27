import { CMSService } from "@/lib/cms-service";
import { BlogPostRenderer } from "@/components/blog/blog-post-renderer";
import { notFound } from "next/navigation";
import { Metadata } from "next";



interface Props {
    params: Promise<{ slug: string }>;
}

// 1. Generate Static Params at Build Time
// 1. Generate Static Params at Build Time
export async function generateStaticParams() {
    const posts = await CMSService.getPosts();

    if (posts.length > 0) {
        return posts.map((post) => ({
            slug: post.slug,
        }));
    } else {
        // Fallback for empty blog to prevent build failure
        return [{ slug: "placeholder" }];
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
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await CMSService.getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    return <BlogPostRenderer post={post} />;
}
