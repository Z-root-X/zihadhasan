"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="relative min-h-screen bg-black flex flex-col items-center justify-center p-4 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay pointer-events-none"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] opacity-20 animate-pulse"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 max-w-2xl w-full text-center space-y-12"
            >
                {/* 404 Graphic */}
                <div className="relative">
                    <motion.h1
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="text-[12rem] leading-none font-bold text-transparent bg-clip-text bg-gradient-to-b from-white/[0.05] to-transparent select-none"
                    >
                        404
                    </motion.h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="space-y-4">
                            <motion.span
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="block text-4xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent"
                            >
                                Page Not Found
                            </motion.span>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100px" }}
                                transition={{ delay: 0.7, duration: 0.8 }}
                                className="h-1 bg-primary mx-auto rounded-full"
                            />
                        </div>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="space-y-4 max-w-md mx-auto"
                >
                    <p className="text-lg text-white/60 font-light">
                        The page you are looking for has been moved, deleted, or possibly never existed.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="flex gap-4 justify-center items-center"
                >
                    <Button
                        variant="outline"
                        onClick={() => window.history.back()}
                        className="h-12 px-6 border-white/10 hover:bg-white/5 text-white hover:text-white rounded-full transition-all duration-300 hover:scale-105"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                    </Button>

                    <Button
                        asChild
                        className="h-12 px-8 bg-primary text-black hover:bg-primary/90 rounded-full font-medium transition-all duration-300 hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
                    >
                        <Link href="/">
                            <Home className="mr-2 h-4 w-4" /> Return Home
                        </Link>
                    </Button>
                </motion.div>
            </motion.div>
        </div>
    );
}
