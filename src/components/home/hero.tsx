"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Code, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/ui/magnetic-button";
import Link from "next/link";
import Image from "next/image";

import { CMSService } from "@/lib/cms-service";
import { useEffect, useState } from "react";

export function Hero() {
    const [settings, setSettings] = useState<any>(null);
    const [stats, setStats] = useState({ projects: 0, tools: 0, students: 500 }); // Default students base

    useEffect(() => {
        Promise.all([
            CMSService.getGlobalSettings(),
            CMSService.getProjects(),
            CMSService.getTools()
        ]).then(([settingsData, projectsData, toolsData]) => {
            setSettings(settingsData);
            setStats({
                projects: projectsData.length,
                tools: toolsData.length,
                students: 500 + Math.floor(Math.random() * 100) // Mock dynamic student count > 500
            });
        });
    }, []);

    // 3D Tilt Logic
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 500, damping: 50 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 50 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    // Fetched in top-level useEffect now
    // useEffect(() => {
    //     CMSService.getGlobalSettings().then(setSettings);
    // }, []);

    const heroTitle = settings?.heroTitle || (
        <>
            Building the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 animate-gradient-x">
                Future
            </span>{" "}
            with <br />
            AI & Code.
        </>
    );

    const heroSubtitle = settings?.heroSubtitle || "I craft high-performance web applications and AI-powered solutions that define the next generation of digital experiences.";
    const heroImage = settings?.heroImage || "https://i.postimg.cc/nzhzNpDP/372A6446.jpg";

    return (
        <section className="relative flex min-h-[95vh] flex-col items-center justify-center overflow-hidden px-4 md:px-8 pt-20 perspective-1000">
            {/* Cinematic Perspective Grid */}
            <div className="absolute inset-0 -z-10 bg-black">
                <div
                    className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"
                    style={{ transform: "perspective(500px) rotateX(60deg) translateY(-200px) scale(2.5)", opacity: 0.2 }}
                />
            </div>

            {/* Spotlight Follower (Subtle) */}
            <motion.div
                className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 z-0 mix-blend-soft-light"
                animate={{ opacity: 1 }}
                style={{
                    background: `radial-gradient(1000px circle at ${mouseX.get() * 1000 + 500}px ${mouseY.get() * 1000 + 500}px, rgba(139, 92, 246, 0.1), transparent 40%)`
                }}
            />

            {/* Aurora Background Blobs */}
            <div className="absolute top-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[120px] mix-blend-screen animate-pulse pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-[120px] mix-blend-screen animate-pulse pointer-events-none" style={{ animationDelay: "2s" }} />

            <div className="container mx-auto grid gap-16 lg:grid-cols-12 lg:items-center relative z-10">
                {/* Text Content - Immersive Typography */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0, y: 50 },
                        visible: {
                            opacity: 1,
                            y: 0,
                            transition: { staggerChildren: 0.15, duration: 1, ease: [0.22, 1, 0.36, 1] }
                        }
                    }}
                    className="flex flex-col items-center text-center lg:col-span-7 lg:items-start lg:text-left pt-10 lg:pt-0"
                >
                    <motion.div variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }}>
                        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-primary uppercase tracking-widest backdrop-blur-md">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            Available for Work
                        </div>
                    </motion.div>

                    <motion.h1
                        variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }}
                        className="mb-8 text-6xl font-black tracking-tighter text-white sm:text-8xl xl:text-9xl leading-[0.9] mix-blend-overlay opacity-90"
                    >
                        {typeof heroTitle === 'string' ? (
                            <span dangerouslySetInnerHTML={{ __html: heroTitle.replace(/\n/g, "<br/>") }} />
                        ) : heroTitle}
                    </motion.h1>

                    <motion.p
                        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                        className="mb-12 max-w-xl text-xl text-neutral-400 font-light tracking-wide leading-relaxed"
                    >
                        {heroSubtitle}
                    </motion.p>

                    <motion.div
                        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                        className="flex flex-wrap items-center justify-center lg:justify-start gap-6"
                    >
                        <MagneticButton>
                            <Button size="lg" className="group relative h-14 overflow-hidden rounded-full bg-white px-10 text-lg text-black transition-all hover:bg-white/90" asChild>
                                <Link href="/projects">
                                    <span className="relative z-10 flex items-center font-bold tracking-tight">
                                        View Work <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    </span>
                                </Link>
                            </Button>
                        </MagneticButton>

                        <MagneticButton>
                            <Button size="lg" variant="ghost" className="h-14 rounded-full px-10 text-lg text-white hover:bg-white/5 hover:text-primary transition-all" asChild>
                                <Link href="/contact">
                                    Contact Me
                                </Link>
                            </Button>
                        </MagneticButton>
                    </motion.div>

                    {/* Floating Stats Bar */}
                    <motion.div
                        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                        className="mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-8 border-t border-white/10 pt-8"
                    >
                        {[
                            { label: "Projects Built", value: `${stats.projects}+` },
                            { label: "Students", value: `${stats.students}+` },
                            { label: "AI Tools", value: `${stats.tools}+` }
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col">
                                <span className="text-2xl font-bold text-white">{stat.value}</span>
                                <span className="text-sm text-neutral-500 uppercase tracking-wider">{stat.label}</span>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* 3D Visual Content - Noir Style with Cinematic Fade */}
                <motion.div
                    initial={{ opacity: 0, filter: "blur(20px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    transition={{ duration: 1.5, delay: 0.5, ease: "circOut" }}
                    style={{ perspective: 2000 }}
                    className="relative lg:col-span-5 mx-auto w-full max-w-md lg:max-w-full"
                >
                    <motion.div
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        style={{
                            rotateX,
                            rotateY,
                            transformStyle: "preserve-3d",
                        }}
                        className="relative aspect-[3/4] w-full cursor-pointer group"
                    >
                        {/* Card Reflection/Texture */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none rounded-[2rem] mix-blend-overlay" />

                        {/* Main Image Container with FADE TO BLACK MASK */}
                        <div
                            className="relative h-full w-full overflow-hidden rounded-[2rem] bg-neutral-900 shadow-2xl transition-all duration-500 group-hover:shadow-[0_0_100px_-20px_rgba(255,255,255,0.1)]"
                            style={{
                                transform: "translateZ(20px)",
                                maskImage: "linear-gradient(to bottom, black 80%, transparent 100%)",
                                WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)"
                            }}
                        >
                            {/* Noir Filter: Active by default, fades out on hover to reveal true colors */}
                            <div className="absolute inset-0 bg-neutral-950/20 z-10 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-0" />

                            <Image
                                src={heroImage}
                                alt="Zihad Hasan"
                                fill
                                className="object-cover object-center grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out scale-100 group-hover:scale-110"
                                priority
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                        </div>

                        {/* Floating Tech Badge - Moved Z-Index higher and adjusted positioning */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1 }}
                            style={{ transform: "translateZ(60px)" }}
                            className="absolute -bottom-6 -left-6 z-50 hidden md:flex items-center gap-4 rounded-xl border border-white/10 bg-black/80 p-4 backdrop-blur-md shadow-2xl"
                        >
                            <div className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            <div className="font-mono text-xs font-bold text-white tracking-wider">
                                <div>LOC: DHA_BD</div>
                                <div>SYS: ONLINE</div>
                            </div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
