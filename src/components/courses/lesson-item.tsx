"use client";

import { motion } from "framer-motion";
import { CheckCircle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Lesson } from "@/lib/cms-service";

interface LessonItemProps {
    lesson: Lesson;
    index: number;
    isSelected: boolean;
    isUnlocked: boolean;
    isCompleted: boolean;
    onClick: () => void;
}

export function LessonItem({ lesson, index, isSelected, isUnlocked, isCompleted, onClick }: LessonItemProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "group flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer relative overflow-hidden",
                isSelected
                    ? "bg-primary/20 border-primary/50"
                    : (isUnlocked
                        ? "bg-transparent border-transparent hover:bg-white/5"
                        : "bg-transparent border-transparent opacity-50 cursor-not-allowed")
            )}
        >
            {/* Status Icon with Motion Pop */}
            <div className={cn(
                "shrink-0 h-6 w-6 rounded-full flex items-center justify-center border transition-colors duration-300",
                isCompleted
                    ? "bg-green-500 text-white border-green-500"
                    : (isUnlocked
                        ? "border-gray-500 text-gray-400 group-hover:border-primary group-hover:text-primary"
                        : "border-gray-700 text-gray-700 bg-gray-900/50")
            )}>
                {isCompleted ? (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                        <CheckCircle className="h-4 w-4" />
                    </motion.div>
                ) : !isUnlocked ? (
                    <Lock className="h-3 w-3" />
                ) : (
                    <div className="h-2 w-2 rounded-full bg-current" />
                )}
            </div>

            <div className="flex-1 min-w-0">
                <h3 className={cn(
                    "text-sm font-medium truncate transition-colors",
                    isSelected ? "text-primary" : (isUnlocked ? "text-gray-200 group-hover:text-white" : "text-gray-500")
                )}>
                    {index + 1}. {lesson.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                    {lesson.duration && <span>{lesson.duration}</span>}
                    {lesson.isFreePreview && (
                        <span className="text-green-400 bg-green-500/10 px-1.5 rounded text-[10px]">
                            Free
                        </span>
                    )}
                </div>
            </div>

            {/* Subtle active indicator */}
            {isSelected && (
                <motion.div
                    layoutId="activeLessonIndicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-primary"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                />
            )}
        </div>
    );
}
