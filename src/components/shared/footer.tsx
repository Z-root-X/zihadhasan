"use client";

import Link from "next/link";
import { Github, Twitter, Linkedin, Mail, Youtube, Facebook, Instagram } from "lucide-react";
import { useEffect, useState } from "react";
import { CMSService, SocialLink as SocialLinkType } from "@/lib/cms-service";
import { NewsletterForm } from "@/components/shared/newsletter-form";

export function Footer() {
    const [socials, setSocials] = useState<SocialLinkType[]>([]);

    useEffect(() => {
        CMSService.getGlobalSettings().then(data => {
            if (data?.socials) setSocials(data.socials);
        });
    }, []);

    const getIcon = (platform: string) => {
        switch (platform) {
            case "github": return <Github className="h-5 w-5" />;
            case "twitter": return <Twitter className="h-5 w-5" />;
            case "linkedin": return <Linkedin className="h-5 w-5" />;
            case "email": return <Mail className="h-5 w-5" />;
            case "youtube": return <Youtube className="h-5 w-5" />;
            case "facebook": return <Facebook className="h-5 w-5" />;
            case "instagram": return <Instagram className="h-5 w-5" />;
            default: return <Github className="h-5 w-5" />;
        }
    };

    return (
        <footer className="w-full border-t border-white/5 bg-black py-16">
            <div className="container mx-auto px-4 grid gap-12 lg:grid-cols-2">

                {/* Brand & Socials */}
                <div className="flex flex-col gap-6">
                    <div>
                        <span className="text-2xl font-bold tracking-tighter text-white mb-2 block">
                            Zihad Hasan
                        </span>
                        <p className="text-sm text-gray-400 max-w-sm">
                            Building digital experiences at the intersection of design, engineering, and artificial intelligence.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {socials.length > 0 ? (
                            socials.map((social, i) => (
                                <SocialLink
                                    key={i}
                                    href={social.url}
                                    icon={getIcon(social.platform)}
                                    label={social.platform}
                                />
                            ))
                        ) : (
                            <>
                                <SocialLink href="#" icon={<Github className="h-5 w-5" />} label="GitHub" />
                                <SocialLink href="#" icon={<Linkedin className="h-5 w-5" />} label="LinkedIn" />
                            </>
                        )}
                    </div>

                    <p className="text-sm text-muted-foreground mt-auto pt-8">
                        © {new Date().getFullYear()} Zihad Hasan. Built with Next.js & AI.
                    </p>
                </div>

                {/* Newsletter */}
                <div className="flex flex-col lg:items-end">
                    <NewsletterForm />
                </div>
            </div>
        </footer>
    );
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link
            href={href}
            target="_blank"
            className="text-muted-foreground transition-colors hover:text-primary"
            aria-label={label}
        >
            {icon}
        </Link>
    )
}
