import { BlogPosting, WithContext, Person, Organization } from "schema-dts";

export function generatePersonSchema(): WithContext<Person> {
    return {
        "@context": "https://schema.org",
        "@type": "Person",
        name: "Zihad Hasan",
        url: "https://zihadhasan.web.app",
        jobTitle: "Software Engineer",
        sameAs: [
            "https://github.com/zihadhasan",
            "https://linkedin.com/in/zihadhasan"
        ],
        description: "Visionary Software Engineer building the future with AI and Next.js."
    };
}

export function generateBlogPostSchema(post: any): WithContext<BlogPosting> {
    return {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.excerpt,
        image: post.coverImage ? [post.coverImage] : [],
        datePublished: post.publishedAt ? new Date(post.publishedAt.seconds * 1000).toISOString() : new Date().toISOString(),
        author: {
            "@type": "Person",
            name: "Zihad Hasan",
            url: "https://zihadhasan.web.app"
        },
        publisher: {
            "@type": "Organization",
            name: "Zihad Hasan",
            logo: {
                "@type": "ImageObject",
                url: "https://zihadhasan.web.app/logo.png"
            }
        },
        url: `https://zihadhasan.web.app/blog/${post.slug}`,
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `https://zihadhasan.web.app/blog/${post.slug}`
        }
    };
}
