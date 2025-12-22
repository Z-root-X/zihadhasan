"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface Project {
    id: number;
    title: string;
    description: string;
    tags: string[];
    imageUrl: string;
    liveLink: string;
    githubLink: string;
}

export function ProjectTiltCard({ project }: { project: Project }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseXFromCenter = e.clientX - rect.left - width / 2;
        const mouseYFromCenter = e.clientY - rect.top - height / 2;
        x.set(mouseXFromCenter / width);
        y.set(mouseYFromCenter / height);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="group relative h-96 w-full rounded-2xl bg-white/5 border border-white/10"
        >
            <div
                style={{ transform: "translateZ(75px)" }}
                className="absolute inset-4 overflow-hidden rounded-xl bg-black/50 shadow-2xl"
            >
                {/* Project Image */}
                <div className="relative h-full w-full">
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
                    <Image
                        src={project.imageUrl}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                </div>
            </div>

            <div
                style={{ transform: "translateZ(50px)" }}
                className="absolute bottom-8 left-8 right-8 z-20"
            >
                <div className="mb-3 flex flex-wrap gap-2">
                    {project.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="bg-white/10 text-white backdrop-blur-md border-white/10">
                            {tag}
                        </Badge>
                    ))}
                </div>
                <h3 className="mb-2 text-2xl font-bold text-white shadow-black/50 drop-shadow-lg">{project.title}</h3>
                <p className="mb-4 text-sm text-gray-300 line-clamp-2 shadow-black/50 drop-shadow-md">{project.description}</p>

                <div className="flex items-center gap-4">
                    <Link
                        href={project.liveLink}
                        target="_blank"
                        className="flex items-center gap-2 text-sm font-medium text-white hover:text-primary transition-colors"
                    >
                        Live Demo <ArrowUpRight className="h-4 w-4" />
                    </Link>
                    <Link
                        href={project.githubLink}
                        target="_blank"
                        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-white transition-colors"
                    >
                        <Github className="h-4 w-4" /> Code
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
