import { Suspense } from "react";
import { Hero } from "@/components/home/hero";
import { TechMarquee } from "@/components/home/tech-marquee";
import { BentoShowcase } from "@/components/home/bento-showcase";
import { CourseTeaser } from "@/components/home/course-teaser";
import { PhilosophySection } from "@/components/home/philosophy-section";
import { NewsletterForm } from "@/components/shared/newsletter-form";
// Modular Imports for Tree Shaking
import { CoreService } from "@/lib/services/core-service";
import { ProjectService } from "@/lib/services/project-service";
import { CourseService } from "@/lib/services/course-service";
import { BlogService } from "@/lib/services/blog-service";

import { Section } from "./components/section"; // Helper component

// Cache-First Strategy: Revalidate every 24 hours (86400s) to save Spark Plan Quota
export const revalidate = 86400;

// --- Suspense Wrappers ---

async function HeroSection() {
  const [settings, projects, tools] = await Promise.all([
    CoreService.getGlobalSettings().catch(() => null),
    ProjectService.getProjects().catch(() => []),
    ProjectService.getTools().catch(() => [])
  ]);

  return (
    <Hero
      settings={settings}
      projectCount={projects.length}
      toolCount={tools.length}
    />
  );
}

async function BentoSection() {
  const [projects, tools, blogPosts] = await Promise.all([
    ProjectService.getProjects().catch(() => []),
    ProjectService.getTools().catch(() => []),
    BlogService.getPosts(true).catch(() => [])
  ]);

  const featuredProject = projects.length > 0 ? projects[0] : null;
  const featuredTool = tools.length > 0 ? tools[0] : null;
  const featuredBlog = blogPosts.length > 0 ? blogPosts[0] : null;

  return (
    <Section>
      <BentoShowcase
        project={featuredProject}
        blog={featuredBlog}
        tool={featuredTool}
      />
    </Section>
  );
}

async function CourseSection() {
  const courses = await CourseService.getPublishedCourses().catch(() => []);

  return (
    <Section>
      <CourseTeaser courses={courses.slice(0, 3)} />
    </Section>
  );
}

// --- Skeletons ---
function HeroSkeleton() {
  return <div className="h-screen w-full bg-neutral-950 animate-pulse" />;
}

function SectionSkeleton() {
  return <div className="h-[500px] w-full bg-neutral-900/20 animate-pulse my-20" />;
}

export default function Home() {
  return (
    <main className="bg-black min-h-screen text-white overflow-hidden selection:bg-primary/30 selection:text-white relative">
      {/* Global Noise Texture for that "Film/Figma" Feel */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")` }} />

      {/* A. Hero Section - Suspense enables instant page load while data fetches */}
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection />
      </Suspense>

      {/* B. Tech Marquee - Cleaner, Floating */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 border-b border-white/5">
        <TechMarquee />
      </div>

      {/* C. Bento Showcase - Massive Spacing */}
      <Suspense fallback={<SectionSkeleton />}>
        <div className="py-24">
           <BentoSection />
        </div>
      </Suspense>

      {/* D. Course Teaser */}
      <Suspense fallback={<SectionSkeleton />}>
        <CourseSection />
      </Suspense>

      {/* E. Philosophy / About - Clean Component */}
      <PhilosophySection />

      {/* F. Newsletter */}
      <Section className="py-40 px-4 container mx-auto relative z-10">
        <div className="relative rounded-[2.5rem] overflow-hidden bg-neutral-900/30 border border-white/10 p-8 md:p-24 text-center backdrop-blur-md group hover:border-white/20 transition-all duration-500">
          {/* Subtle Grid Background for this card too */}
           <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          {/* Background Glow - Reduced intensity */}
          <div className="absolute top-0 right-1/2 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-700" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tighter">Join the Inner Circle</h2>
              <p className="text-neutral-400 text-lg font-light leading-relaxed">
                Get weekly insights on full-stack development, AI engineering, and building software products from scratch.
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <NewsletterForm />
            </div>

            <div className="pt-8 text-neutral-600 text-[10px] uppercase tracking-[0.2em] font-medium">
              No spam. Unsubscribe at any time.
            </div>
          </div>
        </div>
      </Section>
    </main>
  );
}
