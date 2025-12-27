"use client";

import { BentoGrid, BentoGridItem } from "@/components/shared/bento-grid";
import { Project, Tool, BlogPost } from "@/lib/cms-service";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Github, ArrowUpRight, Cpu, Quote } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface BentoShowcaseProps {
    project: Project | null;
    blog: BlogPost | null;
    tool: Tool | null;
}

export function BentoShowcase({ project, blog, tool }: BentoShowcaseProps) {

    return (
        <section className="py-20 px-4 bg-black">
            <div className="max-w-7xl mx-auto mb-12">
                <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                    Discover More
                </h2>
                <p className="text-neutral-400 mt-4 max-w-lg">
                    Explore my latest work, thoughts, and the tools I use to build independent software.
                </p>
            </div>

            <BentoGrid>
                {/* 1. Featured Project (Large) */}
                {project && (
                    <BentoGridItem
                        className="md:col-span-2 md:row-span-2 min-h-[400px]"
                        header={
                            <SpotlightCard className="h-full w-full p-0 border-none bg-neutral-900 group overflow-hidden relative">
                                <Image
                                    src={project.imageUrl}
                                    alt={project.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-60 group-hover:opacity-80"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent p-6 flex flex-col justify-end">
                                    <h3 className="text-2xl font-bold text-white mb-2">{project.title}</h3>
                                    <p className="text-neutral-300 line-clamp-2">{project.description}</p>
                                    <div className="flex gap-2 mt-4">
                                        {project.tags.slice(0, 3).map(tag => (
                                            <span key={tag} className="text-xs bg-white/10 px-2 py-1 rounded-full text-white/80 border border-white/5">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <Link href={`/projects`} className="absolute inset-0 z-20" aria-label={`View project: ${project.title}`} />
                            </SpotlightCard>
                        }
                    />
                )}

                {/* 2. Latest Blog (Medium) */}
                {blog && (
                    <BentoGridItem
                        className="md:col-span-1 md:row-span-1"
                        header={
                            <SpotlightCard className="h-full w-full p-6 flex flex-col justify-between bg-neutral-900 group">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-xs font-mono text-blue-400">LATEST POST</span>
                                        <ArrowUpRight className="h-4 w-4 text-white/40 group-hover:text-white transition-colors" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                                        {blog.title}
                                    </h3>
                                </div>
                                <div className="text-xs text-neutral-500">
                                    {blog.readingTime} min read
                                </div>
                                <Link href={`/blog/${blog.slug}`} className="absolute inset-0 z-20" aria-label={`Read blog post: ${blog.title}`} />
                            </SpotlightCard>
                        }
                    />
                )}

                {/* 3. GitHub Activity (Small) */}
                <BentoGridItem
                    className="md:col-span-1 md:row-span-1"
                    header={
                        <SpotlightCard className="h-full w-full p-6 flex flex-col items-center justify-center bg-neutral-900 group text-center">
                            <Github className="h-12 w-12 text-white mb-4 group-hover:scale-110 transition-transform" />
                            <h3 className="text-lg font-bold text-white">Open Source</h3>
                            <p className="text-sm text-neutral-400 mt-2">Check out my contributions</p>
                            <Link href="https://github.com/Z-root-X" target="_blank" className="absolute inset-0 z-20" aria-label="Visit GitHub Profile" />
                        </SpotlightCard>
                    }
                />

                {/* 4. Top Tool (Small) */}
                {tool && (
                    <BentoGridItem
                        className="md:col-span-1 md:row-span-1"
                        header={
                            <SpotlightCard className="h-full w-full p-6 bg-neutral-900 group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-50">
                                    <Cpu className="h-24 w-24 text-white/5 -rotate-12" />
                                </div>
                                <div className="relative z-10">
                                    <span className="text-xs font-mono text-purple-400 mb-2 block">POWERED BY</span>
                                    <h3 className="text-xl font-bold text-white mb-2">{tool.name}</h3>
                                    <p className="text-xs text-neutral-400 line-clamp-2">{tool.description}</p>
                                </div>
                                <Link href="/tools" className="absolute inset-0 z-20" aria-label={`View details about ${tool.name}`} />
                            </SpotlightCard>
                        }
                    />
                )}

                {/* 5. Community/Testimonial (Wide) */}
                <BentoGridItem
                    className="md:col-span-2 md:row-span-1"
                    header={
                        <SpotlightCard className="h-full w-full p-8 bg-neutral-900 flex items-center gap-6">
                            <Quote className="h-12 w-12 text-white/20 shrink-0" />
                            <div>
                                <p className="text-lg md:text-xl text-neutral-200 italic font-light">
                                    "Zihad's courses changed the way I look at web development. The focus on 'why' instead of just 'how' is evident."
                                </p>
                                <div className="mt-4 flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                                    <div>
                                        <div className="text-sm font-bold text-white">Student</div>
                                        <div className="text-xs text-neutral-500">Full Stack Developer</div>
                                    </div>
                                </div>
                            </div>
                        </SpotlightCard>
                    }
                />
            </BentoGrid>
        </section>
    );
}
