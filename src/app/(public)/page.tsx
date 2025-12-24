import { Hero } from "@/components/home/hero";
import { TechMarquee } from "@/components/home/tech-marquee";
import { BentoShowcase } from "@/components/home/bento-showcase";
import { CourseTeaser } from "@/components/home/course-teaser";
import { NewsletterForm } from "@/components/shared/newsletter-form";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";
import Link from "next/link";
import { CMSService } from "@/lib/cms-service";
import { BlogService } from "@/lib/blog-service";
import { Section } from "./components/section"; // Helper component

// Cache-First Strategy: Revalidate every hour
export const revalidate = 3600;

export default async function Home() {
  // Parallel Data Fetching
  const [settings, projects, tools, courses, blogPosts] = await Promise.all([
    CMSService.getGlobalSettings(),
    CMSService.getProjects(),
    CMSService.getTools(),
    CMSService.getPublishedCourses(),
    BlogService.getPublishedPosts(),
  ]);

  const featuredProject = projects.length > 0 ? projects[0] : null;
  const featuredTool = tools.length > 0 ? tools[0] : null;
  const featuredBlog = blogPosts.length > 0 ? blogPosts[0] : null;

  return (
    <main className="bg-black min-h-screen text-white overflow-hidden">
      {/* A. Hero Section */}
      <Hero
        settings={settings}
        projectCount={projects.length}
        toolCount={tools.length}
      />

      {/* B. Tech Marquee */}
      <Section className="relative z-10">
        <TechMarquee />
      </Section>

      {/* C. Bento Showcase */}
      <Section>
        <BentoShowcase
          project={featuredProject}
          blog={featuredBlog}
          tool={featuredTool}
        />
      </Section>

      {/* D. Course Teaser */}
      <Section>
        <CourseTeaser courses={courses.slice(0, 3)} />
      </Section>

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
