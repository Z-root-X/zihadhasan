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
        <section className="py-20 overflow-hidden bg-black border-y border-white/5 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-10 pointer-events-none" />

            <div className="flex relative">
                <motion.div
                    className="flex gap-16 pr-16"
                    animate={{
                        x: [0, -1920],
                    }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 30,
                            ease: "linear",
                        },
                    }}
                >
                    {[...TECHNOLOGIES, ...TECHNOLOGIES, ...TECHNOLOGIES, ...TECHNOLOGIES].map((tech, i) => (
                        <div key={i} className="flex items-center gap-4 group cursor-default">
                            <div className="relative w-12 h-12 flex items-center justify-center grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500">
                                <img src={tech.icon} alt={tech.name} className="max-w-full max-h-full invert" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-600 to-neutral-800 group-hover:from-white group-hover:to-white/60 transition-all duration-500">
                                {tech.name}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
