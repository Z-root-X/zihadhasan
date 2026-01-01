"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Code, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/ui/magnetic-button";
import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "@/lib/cloudinary-utils";
import { GlobalSettings } from "@/lib/cms-service";

interface HeroProps {
    settings: GlobalSettings | null;
    projectCount: number;
    toolCount: number;
}

import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';

gsap.registerPlugin(TextPlugin);

export function Hero({ settings, projectCount, toolCount }: HeroProps) {
    const headlineRef = useRef(null);
    const containerRef = useRef(null);

    // 3D Tilt Logic
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 500, damping: 50 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 50 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);

    // GSAP Animations
    useEffect(() => {
        const ctx = gsap.context(() => {
            // Text Masking Reveal
            if (headlineRef.current) {
                // Split text manually or use TextPlugin for simple reveals
                // For this "Masking" effect:
                gsap.from(headlineRef.current, {
                    yPercent: 100, // Slide up from bottom
                    duration: 1.2,
                    ease: "power4.out",
                    skewY: 7,
                    stagger: 0.05
                });
            }
        }, containerRef);

        return () => ctx.revert();
    }, [settings?.heroTitle]);

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isMobile) return;
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
        <section ref={containerRef} className="relative flex min-h-[95vh] flex-col items-center justify-center overflow-hidden px-4 md:px-8 pt-20 perspective-1000">
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

            {/* Aurora Background (Indigo/Black) */}
            <div className="absolute top-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[120px] mix-blend-screen animate-pulse pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-900/20 blur-[120px] mix-blend-screen animate-pulse pointer-events-none" style={{ animationDelay: "2s" }} />

            <div className="container mx-auto grid gap-12 lg:grid-cols-12 lg:items-center relative z-10 py-12">
                {/* Text Content - Massive & Impactful */}
                <div
                    className="flex flex-col items-center text-center lg:col-span-7 lg:items-start lg:text-left pt-10 lg:pt-0"
                >
                    <div className="overflow-hidden relative z-20">
                        <h1
                            ref={headlineRef}
                            className="mb-8 text-7xl font-black tracking-tighter text-white sm:text-8xl md:text-9xl xl:text-[10rem] leading-[0.85] mix-blend-plus-lighter"
                        >
                            {typeof heroTitle === 'string' ? (
                                <span dangerouslySetInnerHTML={{ __html: heroTitle.replace(/\n/g, "<br/>") }} />
                            ) : heroTitle}
                        </h1>
                    </div>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mb-12 max-w-xl text-lg md:text-xl text-neutral-400 font-light tracking-wide leading-relaxed"
                    >
                        {heroSubtitle}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="flex flex-wrap items-center justify-center lg:justify-start gap-6 relative z-30"
                    >
                        <MagneticButton>
                            <Button size="lg" className="group relative h-14 overflow-hidden rounded-full bg-white px-10 text-lg text-black transition-all hover:bg-white/90 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]" asChild>
                                <Link href="/projects">
                                    <span className="relative z-10 flex items-center font-bold tracking-tight">
                                        View Work <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    </span>
                                </Link>
                            </Button>
                        </MagneticButton>

                        <MagneticButton>
                            <Button size="lg" variant="ghost" className="h-14 rounded-full px-10 text-lg text-white hover:bg-white/5 hover:text-primary transition-all border border-white/10 backdrop-blur-sm" asChild>
                                <Link href="/contact">
                                    Contact Me
                                </Link>
                            </Button>
                        </MagneticButton>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="mt-16 flex flex-wrap items-center justify-center lg:justify-start gap-12 border-t border-white/5 pt-8"
                    >
                        {[
                            { label: "Projects", value: `${projectCount}+` },
                            { label: "Students", value: "500+" },
                            { label: "AI Tools", value: `${toolCount}+` }
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col items-center lg:items-start">
                                <span className="text-2xl font-bold text-white tracking-tight">{stat.value}</span>
                                <span className="text-[10px] text-neutral-500 uppercase tracking-[0.2em]">{stat.label}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* 3D Visual Content - High Detail Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotateY: 30 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    transition={{ duration: 1.2, ease: "circOut" }}
                    className="lg:col-span-5 relative perspective-2000 hidden lg:block"
                >
                    <motion.div
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        style={{
                            rotateX,
                            rotateY,
                            transformStyle: "preserve-3d",
                        }}
                        className="relative aspect-[3/4] w-full cursor-none group"
                    >
                        {/* Interactive Shine */}
                        <div className="absolute inset-0 z-30 rounded-[2.5rem] bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        
                        <div 
                            className="relative h-full w-full overflow-hidden rounded-[2.5rem] bg-neutral-900 border border-white/10 shadow-2xl transition-all duration-700 group-hover:shadow-primary/20 group-hover:border-white/20"
                            style={{ transform: "translateZ(20px)" }}
                        >
                            <Image
                                src={getImageUrl(heroImage)}
                                alt="Zihad Hasan"
                                fill
                                className="object-cover object-center grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out scale-110 group-hover:scale-100"
                                priority
                            />
                            {/* Overlay Vignette */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                        </div>

                        {/* Floating Tech Elements */}
                        <motion.div
                            style={{ transform: "translateZ(50px)" }}
                            className="absolute -bottom-6 -left-6 z-40 flex items-center gap-4 rounded-2xl border border-white/10 bg-black/80 p-5 backdrop-blur-xl shadow-2xl"
                        >
                             <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Code className="h-5 w-5 text-primary" />
                             </div>
                             <div>
                                <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Location</div>
                                <div className="text-xs text-white font-mono">DHAKA, BD</div>
                             </div>
                        </motion.div>

                        <motion.div
                            style={{ transform: "translateZ(80px)" }}
                            className="absolute -top-6 -right-6 z-40 p-4 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-md shadow-2xl"
                        >
                            <Sparkles className="h-6 w-6 text-yellow-500" />
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
