"use client";

import { CMSService, Course } from "@/lib/cms-service";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface CourseTeaserProps {
    courses: Course[];
}

export function CourseTeaser({ courses }: CourseTeaserProps) {
    if (courses.length === 0) {
        return (
            <section className="py-24 px-4 bg-black relative overflow-hidden border-t border-white/5">
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <h2 className="text-3xl font-bold text-white mb-4">Premium Courses</h2>
                    <div className="p-12 rounded-2xl bg-neutral-900/50 border border-white/10 backdrop-blur-sm">
                        <BookOpen className="h-12 w-12 text-blue-400 mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-bold text-white mb-2">Curriculum in Development</h3>
                        <p className="text-neutral-400 max-w-lg mx-auto">
                            We are crafting in-depth masterclasses. Stay tuned for the launch of our first course series.
                        </p>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="py-24 px-4 bg-black relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Premium Courses</h2>
                        <p className="text-neutral-400 max-w-lg">
                            In-depth guides and masterclasses to take your development skills to the absolute limit.
                        </p>
                    </div>
                    <div>
                        <Button variant="outline" className="rounded-full border-white/10 hover:bg-white/5" asChild>
                            <Link href="/my-learning">
                                Browse All <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {courses.map((course) => (
                        <SpotlightCard key={course.id} className="group flex flex-col h-full bg-neutral-900 border-neutral-800">
                            <div className="relative h-48 w-full overflow-hidden rounded-t-xl bg-neutral-800">
                                {course.headerImage ? (
                                    <Image
                                        src={course.headerImage}
                                        alt={course.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-neutral-600">
                                        <BookOpen className="h-12 w-12" />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4">
                                    <Badge className="bg-black/50 backdrop-blur border-white/10 text-white hover:bg-black/70">
                                        {course.price === 0 ? "Free" : `$${course.price}`}
                                    </Badge>
                                </div>
                            </div>

                            <div className="p-6 flex flex-col flex-grow">
                                <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-blue-400 transition-colors">
                                    {course.title}
                                </h3>
                                <p className="text-neutral-400 text-sm mb-6 line-clamp-3 flex-grow">
                                    {course.description}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <div className="flex items-center text-xs text-neutral-500">
                                        <Clock className="h-3 w-3 mr-1" />
                                        <span>{course.lessons?.length || 0} Lessons</span>
                                    </div>
                                    <span className="text-xs font-medium text-blue-400 group-hover:translate-x-1 transition-transform flex items-center">
                                        Start Learning <ArrowRight className="ml-1 h-3 w-3" />
                                    </span>
                                </div>
                            </div>
                            <Link href="/my-learning" className="absolute inset-0 z-20" aria-label={`View details for ${course.title}`} />
                        </SpotlightCard>
                    ))}
                </div>
            </div>
        </section>
    );
}
