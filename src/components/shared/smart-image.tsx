"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Hammer } from "lucide-react"; // Fallback icon

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src?: string;
    alt: string;
    aspectRatio?: "16/9" | "4/3" | "1/1" | "auto";
    className?: string;
    fill?: boolean;
}

export function SmartImage({
    src,
    alt,
    aspectRatio = "16/9",
    className,
    fill = false,
    ...props
}: SmartImageProps) {
    const [error, setError] = useState(false);

    // If no src or error, show "Smart Error Placeholder"
    if (!src || error) {
        return (
            <div
                className={cn(
                    "flex flex-col items-center justify-center bg-white/5 border border-white/10 text-muted-foreground overflow-hidden relative",
                    aspectRatio === "16/9" && "aspect-video",
                    aspectRatio === "4/3" && "aspect-[4/3]",
                    aspectRatio === "1/1" && "aspect-square",
                    fill && "h-full w-full",
                    className
                )}
            >
                {/* Glitch Effect background */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900 via-transparent to-transparent" />

                <div className="z-10 flex flex-col items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center animate-pulse">
                        <Hammer className="h-5 w-5 text-white/50" />
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">ZH No Signal</span>
                </div>
            </div>
        );
    }

    // Standard Next/Image wrapper
    if (fill) {
        return (
            <div className={cn("relative overflow-hidden", className)}>
                <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                    onError={() => setError(true)}
                    unoptimized // Allow external URLs easily without config
                />
            </div>
        );
    }

    return (
        <div
            className={cn(
                "relative overflow-hidden",
                aspectRatio === "16/9" && "aspect-video",
                aspectRatio === "4/3" && "aspect-[4/3]",
                aspectRatio === "1/1" && "aspect-square",
                className
            )}
        >
            <Image
                src={src}
                alt={alt}
                fill
                className="object-cover transition-transform duration-500 hover:scale-105"
                onError={() => setError(true)}
                unoptimized
            />
        </div>
    );
}
