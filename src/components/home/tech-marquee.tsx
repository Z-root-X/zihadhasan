"use client";

import { motion } from "framer-motion";

const TECHNOLOGIES = [
    { name: "Next.js", icon: "https://cdn.worldvectorlogo.com/logos/next-js.svg" },
    { name: "React", icon: "https://cdn.worldvectorlogo.com/logos/react-2.svg" },
    { name: "TypeScript", icon: "https://cdn.worldvectorlogo.com/logos/typescript.svg" },
    { name: "Tailwind CSS", icon: "https://cdn.worldvectorlogo.com/logos/tailwindcss.svg" },
    { name: "Firebase", icon: "https://cdn.worldvectorlogo.com/logos/firebase-1.svg" },
    { name: "Framer Motion", icon: "https://cdn.worldvectorlogo.com/logos/framer-motion.svg" },
    { name: "Node.js", icon: "https://cdn.worldvectorlogo.com/logos/nodejs-icon.svg" },
    { name: "OpenAI", icon: "https://cdn.worldvectorlogo.com/logos/openai-2.svg" },
];

export function TechMarquee() {
    return (
        <section className="py-10 overflow-hidden relative">
            {/* CSS Mask for perfect fade without blocking clicks */}
            <div className="absolute inset-0 z-10 pointer-events-none [mask-image:linear-gradient(to_right,black,transparent_10%,transparent_90%,black)] bg-gradient-to-r from-black via-transparent to-black" />

            <div className="flex relative">
                <motion.div
                    className="flex gap-20 pr-20"
                    animate={{
                        x: [0, -2000],
                    }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 50,
                            ease: "linear",
                        },
                    }}
                >
                    {[...TECHNOLOGIES, ...TECHNOLOGIES, ...TECHNOLOGIES, ...TECHNOLOGIES].map((tech, i) => (
                        <div key={i} className="flex items-center gap-4 group cursor-default opacity-50 hover:opacity-100 transition-opacity duration-300">
                            <div className="relative w-8 h-8 flex items-center justify-center grayscale group-hover:grayscale-0 transition-all duration-500">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={tech.icon} alt={tech.name} className="max-w-full max-h-full invert" />
                            </div>
                            <span className="text-sm font-medium font-mono tracking-wider text-neutral-400 group-hover:text-white transition-colors">
                                {tech.name}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
