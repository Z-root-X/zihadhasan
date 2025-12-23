"use client";

import { BlogPost } from "@/lib/cms-service";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { generateBlogPostSchema } from "@/lib/schema-generator";
import sanitizeHtml from "sanitize-html";
import { NewsletterForm } from "@/components/blog/newsletter-form";
import "@/styles/syntax-highlight.css";

interface BlogPostRendererProps {
    post: BlogPost;
}

export function BlogPostRenderer({ post }: BlogPostRendererProps) {
    const formattedDate = post.publishedAt
        ? new Date(post.publishedAt.seconds * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
        : "";

    return (
        <article className="min-h-screen pt-24 pb-20 container mx-auto px-4 max-w-3xl">
            <Link href="/blog" className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-8 transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
            </Link>

            <header className="mb-12 text-center">
                <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                    {post.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                            {tag}
                        </Badge>
                    ))}
                </div>

                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
                    {post.title}
                </h1>

                <div className="flex items-center justify-center gap-4 text-gray-400 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gray-700 overflow-hidden">
                            {/* Placeholder Avatar */}
                            <img src="https://github.com/shadcn.png" alt="Zihad" className="h-full w-full object-cover" />
                        </div>
                        <span>Zihad Hasan</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formattedDate}
                    </div>
                </div>
            </header>

            {post.coverImage && (
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden mb-12 border border-white/10">
                    <img src={post.coverImage} alt={post.title} className="object-cover w-full h-full" />
                </div>
            )}

            {/* Schema.org JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(generateBlogPostSchema(post)),
                }}
            />

            <div className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-purple-400 hover:prose-a:text-purple-300 prose-img:rounded-xl">
                <div dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(post.content, {
                        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'pre', 'code', 'span']),
                        allowedAttributes: {
                            ...sanitizeHtml.defaults.allowedAttributes,
                            'img': ['src', 'alt', 'class'],
                            'code': ['class'],
                            'span': ['class', 'style'],
                            '*': ['style']
                        }
                    })
                }} />
            </div>

            <hr className="my-12 border-white/10" />

            <NewsletterForm />
        </article>
    );
}

function ButtonAsLink({ href, children, variant }: { href: string, children: React.ReactNode, variant?: "default" | "outline" }) {
    return (
        <Button asChild variant={variant} className="bg-primary text-black hover:bg-primary/90">
            <Link href={href}>{children}</Link>
        </Button>
    )
}
