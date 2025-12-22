"use client";

import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Cpu, Globe, Code2, ArrowUpRight, Github } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CMSService, Project } from "@/lib/cms-service";

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProjects() {
            try {
                const data = await CMSService.getProjects();
                setProjects(data);
            } catch (error) {
                console.error("Error fetching projects:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchProjects();
    }, []);

    if (loading) return <div className="min-h-screen pt-24 text-center text-white">Loading projects...</div>;

    return (
        <div className="min-h-screen pt-24 pb-20 px-4">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                    Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Work</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    A collection of projects pushing the boundaries of what&apos;s possible on the web.
                </p>
            </div>

            {projects.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">No projects found. Add some from the Admin Dashboard!</div>
            ) : (
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 max-w-7xl mx-auto block">
                    {projects.map((project, i) => (
                        <div key={i} className="break-inside-avoid mb-6">
                            <SpotlightCard className="group p-6 h-full flex flex-col bg-opacity-40 hover:bg-opacity-100 transition-all duration-500 border-white/5 hover:border-white/20">
                                <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-white/10 mb-6 bg-neutral-900 group-hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.1)] transition-shadow duration-500">
                                    <Image
                                        src={project.imageUrl || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b"}
                                        alt={project.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                </div>

                                <div className="flex-1 flex flex-col relative z-10">
                                    <div className="flex items-start justify-between mb-4">
                                        <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{project.title}</h3>
                                        <div className="flex gap-3 opacity-50 group-hover:opacity-100 transition-opacity">
                                            {project.githubLink && (
                                                <Link href={project.githubLink} target="_blank" className="text-neutral-400 hover:text-white transition-colors">
                                                    <Github className="h-5 w-5" />
                                                </Link>
                                            )}
                                            {project.liveLink && (
                                                <Link href={project.liveLink} target="_blank" className="text-neutral-400 hover:text-white transition-colors">
                                                    <ArrowUpRight className="h-5 w-5" />
                                                </Link>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-neutral-400 text-sm mb-6 flex-1 leading-relaxed">
                                        {project.description}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mt-auto">
                                        {project.tags.map(tag => (
                                            <Badge key={tag} variant="secondary" className="bg-white/5 text-neutral-300 border-white/5 backdrop-blur-sm group-hover:bg-primary/10 group-hover:text-primary-foreground group-hover:border-primary/20 transition-all">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </SpotlightCard>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
