"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Calendar, FileText, CheckCircle, XCircle, Loader2, Search } from "lucide-react";
import { BlogPost, CMSService } from "@/lib/cms-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Timestamp } from "firebase/firestore";

export default function BlogAdminPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        setLoading(true);
        try {
            // Fetch all posts (both draft and published)
            const data = await CMSService.getPosts(false);
            setPosts(data);
        } catch (error) {
            console.error("Failed to load posts", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this post?")) return;
        try {
            await CMSService.deletePost(id);
            setPosts(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Blog Management</h2>
                    <p className="text-muted-foreground">Write, edit, and publish articles.</p>
                </div>
                <Link href="/dashboard/blog/create">
                    <Button className="bg-primary text-black hover:bg-primary/90">
                        <Plus className="mr-2 h-4 w-4" /> New Post
                    </Button>
                </Link>
            </div>

            <div className="flex items-center gap-2 max-w-sm">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                />
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="animate-spin text-primary h-8 w-8" />
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredPosts.map((post) => (
                        <div
                            key={post.id}
                            className="flex flex-col md:flex-row gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:border-primary/20 transition-colors group"
                        >
                            {/* Image Thumbnail */}
                            <div className="h-24 w-full md:w-32 bg-black/40 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                                {post.coverImage ? (
                                    <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-600">
                                        <FileText className="h-8 w-8" />
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-lg font-semibold text-white truncate group-hover:text-primary transition-colors">
                                            {post.title}
                                        </h3>
                                        <Badge variant="outline" className={`h-5 text-[10px] border-none ${post.published ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"}`}>
                                            {post.published ? "Published" : "Draft"}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-400 line-clamp-2">{post.excerpt || "No excerpt..."}</p>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : "Unknown"}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        /api/blog/{post.slug}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 md:self-center">
                                <Link href={`/dashboard/blog/edit?id=${post.id}`}>
                                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => post.id && handleDelete(post.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}

                    {filteredPosts.length === 0 && (
                        <div className="text-center py-20 text-gray-500">
                            No posts found. Start writing something new!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
