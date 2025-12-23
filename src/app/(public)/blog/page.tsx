"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";
import { BlogPost, CMSService } from "@/lib/cms-service";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function PublicBlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchPosts = async () => {
            // Only published posts
            const data = await CMSService.getPosts(true);
            setPosts(data);
            setLoading(false);
        };
        fetchPosts();
    }, []);

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="min-h-screen pt-24 pb-20 container mx-auto px-4">
            {/* Header */}
            <div className="mb-16 text-center max-w-2xl mx-auto">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-4"
                >
                    Thoughts & <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Insights</span>
                </motion.h1>
                <p className="text-muted-foreground mb-8">
                    Deep dives into engineering, design, and digital philosophy.
                </p>

                <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search articles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-10 bg-white/5 border-white/10 text-white rounded-full focus:ring-purple-500/20"
                    />
                </div>
            </div>

            {loading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                            <Skeleton className="aspect-video w-full bg-white/10" />
                            <div className="p-6 space-y-3">
                                <Skeleton className="h-4 w-24 bg-white/5" />
                                <Skeleton className="h-6 w-3/4 bg-white/10" />
                                <Skeleton className="h-4 w-full bg-white/5" />
                                <Skeleton className="h-4 w-full bg-white/5" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredPosts.map((post, index) => (
                        <ArticleCard key={post.id} post={post} index={index} />
                    ))}

                    {filteredPosts.length === 0 && (
                        <div className="col-span-full text-center py-20 text-gray-500">
                            No articles found matching your search.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function ArticleCard({ post, index }: { post: BlogPost, index: number }) {
    const date = post.publishedAt ? new Date(post.publishedAt.seconds * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "";

    return (
        <Link href={`/blog/${post.slug}`} className="group relative flex flex-col rounded-xl border border-white/10 bg-white/5 overflow-hidden hover:border-purple-500/30 hover:bg-white/[0.07] transition-all duration-300">
            <div className="aspect-video w-full bg-black/40 overflow-hidden relative">
                {post.coverImage ? (
                    <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                        <span className="text-gray-700 font-bold text-2xl">BLOG</span>
                    </div>
                )}
                <div className="absolute top-4 left-4 flex gap-2">
                    {post.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="secondary" className="bg-black/50 backdrop-blur-md text-gray-300 border-white/10 text-[10px] h-5">
                            {tag}
                        </Badge>
                    ))}
                </div>
            </div>

            <div className="p-6 flex flex-col flex-1">
                <div className="text-xs text-purple-400 font-medium mb-2">{date}</div>
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
                    {post.title}
                </h3>
                <p className="text-sm text-gray-400 line-clamp-3 mb-4 flex-1">
                    {post.excerpt}
                </p>

                <div className="flex items-center text-sm font-medium text-white group-hover:text-purple-400 transition-colors mt-auto">
                    Read Article <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
            </div>
        </Link>
    );
}
