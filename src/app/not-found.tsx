"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full text-center space-y-8"
            >
                {/* 404 Graphic or Text */}
                <div className="relative">
                    <h1 className="text-9xl font-bold text-white/[0.03] select-none">404</h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                            Page Not Found
                        </span>
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-white/60">
                        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                    </p>
                </div>

                <div className="flex gap-4 justify-center">
                    <Button variant="outline" onClick={() => window.history.back()} className="border-white/10 hover:bg-white/5 text-white">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                    </Button>

                    <Button asChild className="bg-primary text-black hover:bg-primary/90">
                        <Link href="/">
                            <Home className="mr-2 h-4 w-4" /> Return Home
                        </Link>
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
