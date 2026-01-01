import { Suspense } from "react";
import { Hero } from "@/components/home/hero";
import { TechMarquee } from "@/components/home/tech-marquee";
import { BentoShowcase } from "@/components/home/bento-showcase";
import { CourseTeaser } from "@/components/home/course-teaser";
import { NewsletterForm } from "@/components/shared/newsletter-form";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";
import Link from "next/link";
// Modular Imports for Tree Shaking
import { CoreService } from "@/lib/services/core-service";
import { ProjectService } from "@/lib/services/project-service";
import { CourseService } from "@/lib/services/course-service";
import { BlogService } from "@/lib/services/blog-service";

import { Section } from "./components/section"; // Helper component

// Cache-First Strategy: Revalidate every 24 hours (86400s) to save Spark Plan Quota
export const revalidate = 86400;

// --- Suspense Wrappers ---

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
    <main className="bg-black min-h-screen text-white overflow-hidden">
      {/* A. Hero Section - Suspense enables instant page load while data fetches */}
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection />
      </Suspense>

      {/* B. Tech Marquee - Static */}
      <Section className="relative z-10">
        <TechMarquee />
      </Section>

      {/* C. Bento Showcase */}
      <Suspense fallback={<SectionSkeleton />}>
        <BentoSection />
      </Suspense>

      {/* D. Course Teaser */}
      <Suspense fallback={<SectionSkeleton />}>
        <CourseSection />
      </Suspense>

      {/* E. Philosophy / About */}
      <Section className="py-24 px-4 bg-black relative">
        <div className="absolute inset-0 bg-neutral-900/20 skew-y-3 transform origin-bottom-left" />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h2 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 mb-8 leading-tight">
            Building the future of the web, <br /> one pixel and one line of code at a time.
          </h2>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-12 hover:bg-white/10 transition-colors">
            <p className="text-xl md:text-2xl text-neutral-300 font-light mb-8">
              "I believe in software that feels biological—fluid, responsive, and alive. My mission is to bridge the gap between complex AI systems and intuitive human experiences."
            </p>
            <div className="flex justify-center gap-6">
              {[
                { icon: Github, href: "https://github.com/Z-root-X" },
                { icon: Twitter, href: "https://twitter.com" },
                { icon: Linkedin, href: "https://linkedin.com" },
                { icon: Mail, href: "mailto:contact@zihadhasan.com" },
              ].map((social, i) => (
                <Link
                  key={i}
                  href={social.href}
                  target="_blank"
                  className="p-3 rounded-full bg-white/5 hover:bg-white/20 hover:scale-110 transition-all border border-white/5"
                >
                  <social.icon className="h-5 w-5 text-white" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* F. Newsletter */}
      <Section className="py-24 px-4 container mx-auto">
        <div className="relative rounded-3xl overflow-hidden bg-neutral-900 border border-white/10 p-8 md:p-16 text-center">
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">Join the Inner Circle</h2>
              <p className="text-neutral-400">
                Get weekly insights on full-stack development, AI engineering, and building software products from scratch.
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <NewsletterForm />
            </div>

            <div className="pt-8 text-neutral-600 text-sm">
              No spam. Unsubscribe at any time.
            </div>
          </div>
        </div>
      </Section>
    </main>
  );
}
