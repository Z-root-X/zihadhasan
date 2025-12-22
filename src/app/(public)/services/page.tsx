"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/shared/glass-card";
import { Code, Bot, Rocket, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CMSService } from "@/lib/cms-service";

const SERVICES = [
    {
        icon: <Code className="h-8 w-8 text-blue-400" />,
        title: "Full Stack Development",
        description: "Building scalable, high-performance web apps using Next.js, React, and Node.js. Optimized for speed and SEO.",
    },
    {
        icon: <Bot className="h-8 w-8 text-cyan-400" />,
        title: "AI Integration",
        description: "Integrating powerful AI models (OpenAI, Gemini) into your applications to automate tasks and enhance user experience.",
    },
    {
        icon: <Rocket className="h-8 w-8 text-purple-400" />,
        title: "MVP Launch",
        description: "Rapidly turning your startup idea into a functional Minimum Viable Product ready for investors and users.",
    },
    {
        icon: <Search className="h-8 w-8 text-green-400" />,
        title: "Technical SEO & Performance",
        description: "Auditing and optimizing your existing site to rank higher on Google and load in sub-seconds.",
    },
];

export default function ServicesPage() {
    const [title, setTitle] = useState("Services");
    const [subtitle, setSubtitle] = useState("Specialized technical services to elevate your business.");

    useEffect(() => {
        CMSService.getGlobalSettings().then(data => {
            if (data?.pages?.services) {
                if (data.pages.services.title) setTitle(data.pages.services.title);
                if (data.pages.services.subtitle) setSubtitle(data.pages.services.subtitle);
            }
        });
    }, []);

    return (
        <div className="min-h-screen pt-24 pb-20 container mx-auto px-4">
            <div className="mb-16 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-4"
                >
                    {title}
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-muted-foreground max-w-2xl mx-auto"
                >
                    {subtitle}
                </motion.p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 max-w-5xl mx-auto">
                {SERVICES.map((service, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <GlassCard className="h-full flex flex-col items-start p-8">
                            <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
                                {service.icon}
                            </div>
                            <h3 className="mb-2 text-xl font-bold text-white">{service.title}</h3>
                            <p className="mb-6 text-muted-foreground">{service.description}</p>
                            <Button variant="link" className="mt-auto p-0 h-auto text-primary hover:text-primary/80" asChild>
                                <Link href="/events">
                                    Book Consultation (Via Event)
                                </Link>
                            </Button>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
