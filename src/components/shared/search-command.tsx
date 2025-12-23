"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Loader2, BookOpen, PenTool, Layout, Calendar } from "lucide-react";
import { CMSService, BlogPost, Project, Course, Event } from "@/lib/cms-service";
import { cn } from "@/lib/utils";

interface SearchResult {
    id: string;
    type: 'course' | 'project' | 'blog' | 'event';
    title: string;
    description?: string;
    url: string;
}

export function SearchCommand() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Cache
    const [allData, setAllData] = useState<SearchResult[]>([]);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    // Prefetch data when opened or on mount appropriately
    useEffect(() => {
        if (open && allData.length === 0) {
            setLoading(true);
            Promise.all([
                CMSService.getPublishedCourses(),
                CMSService.getProjects(),
                CMSService.getPosts(true), // Only published
                CMSService.getEvents()     // Potentially verify published/upcoming logic if needed
            ]).then(([courses, projects, posts, events]) => {
                const standardized: SearchResult[] = [
                    ...courses.map((c: Course) => ({
                        id: c.id!, type: 'course' as const, title: c.title, description: c.description, url: `/courses/view/${c.id}`
                    })),
                    ...projects.map((p: Project) => ({
                        id: p.id!, type: 'project' as const, title: p.title, description: p.description, url: p.liveLink || p.githubLink || '/projects' // fallback
                    })),
                    ...posts.map((p: BlogPost) => ({
                        id: p.id!, type: 'blog' as const, title: p.title, description: p.excerpt, url: `/blog/view?id=${p.id}`
                    })),
                    ...events.map((e: Event) => ({
                        id: e.id!, type: 'event' as const, title: e.title, description: e.description, url: '/events' // fallback or specific
                    }))
                ];
                setAllData(standardized);
                setLoading(false);
            }).catch(err => {
                console.error("Search fetch failed", err);
                setLoading(false);
            });
        }
    }, [open, allData.length]);

    useEffect(() => {
        if (!query) {
            setResults([]);
            return;
        }

        const lower = query.toLowerCase();
        const filtered = allData.filter(item =>
            item.title.toLowerCase().includes(lower) ||
            (item.description && item.description.toLowerCase().includes(lower))
        ).slice(0, 5); // Limit 5

        setResults(filtered);
    }, [query, allData]);

    const handleSelect = (url: string) => {
        setOpen(false);
        if (url.startsWith("http")) {
            window.open(url, "_blank");
        } else {
            router.push(url);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'course': return <BookOpen className="h-4 w-4" />;
            case 'project': return <Layout className="h-4 w-4" />;
            case 'blog': return <PenTool className="h-4 w-4" />;
            case 'event': return <Calendar className="h-4 w-4" />;
            default: return <Search className="h-4 w-4" />;
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="p-0 gap-0 bg-[#0A0A0A] border-white/10 sm:max-w-[550px] shadow-2xl backdrop-blur-3xl">
                    <DialogHeader className="p-4 border-b border-white/5">
                        <DialogTitle className="sr-only">Search</DialogTitle>
                        <div className="flex items-center gap-3 px-2">
                            <Search className="h-5 w-5 text-gray-500" />
                            <Input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search courses, projects, blogs..."
                                className="border-0 bg-transparent text-lg focus-visible:ring-0 placeholder:text-gray-600 h-auto p-0 text-white"
                                autoFocus
                            />
                            {loading && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}
                        </div>
                    </DialogHeader>

                    <div className="max-h-[300px] overflow-y-auto p-2">
                        {results.length > 0 ? (
                            <div className="space-y-1">
                                {results.map((result) => (
                                    <button
                                        key={`${result.type}-${result.id}`}
                                        onClick={() => handleSelect(result.url)}
                                        className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors group flex items-start gap-4"
                                    >
                                        <div className={cn(
                                            "mt-1 p-2 rounded-md bg-white/5 text-gray-400 group-hover:text-white group-hover:bg-white/10 transition-colors"
                                        )}>
                                            {getIcon(result.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">
                                                {result.title}
                                            </h4>
                                            <p className="text-xs text-gray-500 truncate mt-0.5">
                                                {result.description}
                                            </p>
                                        </div>
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-600 group-hover:text-gray-400 self-center">
                                            {result.type}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        ) : query ? (
                            <div className="py-12 text-center text-sm text-gray-500">
                                No results found for "{query}"
                            </div>
                        ) : (
                            <div className="py-12 text-center text-sm text-gray-600">
                                Type to search across the entire platform
                            </div>
                        )}
                    </div>

                    <div className="p-2 border-t border-white/5 bg-white/[0.02] flex justify-between items-center px-4">
                        <span className="text-[10px] text-gray-600">ProTip: Search for "Next.js"</span>
                        <div className="flex gap-2">
                            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-gray-400 opacity-100">
                                <span className="text-xs">esc</span>
                            </kbd>
                            <span className="text-[10px] text-gray-600 self-center">to close</span>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
