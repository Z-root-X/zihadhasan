"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/shared/glass-card";
import { Badge } from "@/components/ui/badge";
import { CMSService, Tool } from "@/lib/cms-service";
import { cn } from "@/lib/utils";

import { useMemo } from "react";

export default function ToolsPage() {
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");

    useEffect(() => {
        async function fetchTools() {
            try {
                const data = await CMSService.getTools();
                setTools(data);
            } catch (error) {
                console.error("Error fetching tools:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchTools();
    }, []);

    // Dynamically extract categories from the fetched tools
    const categories = useMemo(() => {
        const uniqueCategories = Array.from(new Set(tools.map(t => t.category).filter(Boolean)));
        // Sort alphabetically but keep "All" at the start (implied by separate array logic)
        uniqueCategories.sort();
        return ["All", ...uniqueCategories];
    }, [tools]);

    const filteredTools = tools.filter((tool) => {
        const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase()) ||
            (tool.description || "").toLowerCase().includes(search.toLowerCase());
        const matchesCategory = activeCategory === "All" || tool.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen pt-24 pb-20 container mx-auto px-4">
            {/* Header */}
            <div className="mb-12 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-4"
                >
                    AI Tools Directory
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-muted-foreground max-w-2xl mx-auto"
                >
                    Curated list of the best AI tools, managed dynamically.
                </motion.p>
            </div>

            {/* Controls */}
            <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                {/* Search */}
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search tools..."
                        className="pl-10 h-11 bg-white/5 border-white/10 text-white rounded-full focus-visible:ring-primary/50"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium transition-all backdrop-blur-md border",
                                activeCategory === cat
                                    ? "bg-primary text-white border-primary shadow-[0_0_15px_-5px_var(--primary)]"
                                    : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="text-center text-white">Loading tools...</div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <AnimatePresence mode="popLayout">
                        {filteredTools.map((tool) => (
                            <motion.div
                                key={tool.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                            >
                                <a href={tool.url} target="_blank" rel="noopener noreferrer" className="block h-full group">
                                    <div className="relative h-full flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-[#050505] transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_0_30px_-10px_rgba(59,130,246,0.15)]">

                                        {/* Glow Effect */}
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-primary/50 transition-all duration-500" />

                                        <div className="p-6 flex flex-col h-full">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl font-bold text-gray-700 group-hover:text-primary group-hover:border-primary/20 transition-colors">
                                                    {tool.imageUrl ? (
                                                        <img src={tool.imageUrl} alt={tool.name} className="h-full w-full object-cover rounded-xl" />
                                                    ) : (
                                                        tool.name.substring(0, 1)
                                                    )}
                                                </div>
                                                <Badge variant="outline" className="border-white/10 bg-white/5 text-xs text-gray-400 font-normal px-3 py-1">
                                                    {tool.category}
                                                </Badge>
                                            </div>

                                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                                                {tool.name}
                                            </h3>

                                            <p className="text-sm text-gray-400 line-clamp-3 mb-6 flex-1 leading-relaxed">
                                                {tool.description}
                                            </p>

                                            <div className="flex items-center text-xs font-medium text-white/50 group-hover:text-primary transition-colors mt-auto">
                                                Try this tool <ExternalLink className="ml-2 h-3.5 w-3.5" />
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {!loading && filteredTools.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-muted-foreground">No tools found. Add some via the Dashboard!</p>
                </div>
            )}
        </div>
    );
}
