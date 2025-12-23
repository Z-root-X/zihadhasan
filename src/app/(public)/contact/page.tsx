"use client";

import { GlassCard } from "@/components/shared/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Github, Linkedin, Mail, Twitter, Send, MapPin, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { CMSService, GlobalSettings } from "@/lib/cms-service";
import { toast } from "sonner";

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [config, setConfig] = useState<GlobalSettings['pages']>({});
    const [socials, setSocials] = useState<any[]>([]);

    useEffect(() => {
        CMSService.getGlobalSettings().then(data => {
            if (data) {
                if (data.pages) setConfig(data.pages);
                if (data.socials) setSocials(data.socials);
            }
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const subject = formData.get("subject") as string;
        const message = formData.get("message") as string;

        // Simulate network delay for UX
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            // Save to Firestore
            await CMSService.addMessage({
                name,
                email,
                subject,
                message
            });
        } catch (error) {
            console.error("Failed to save message", error);
            // Continue to mailto fallback
        }

        const targetEmail = config?.contact?.email || "contact@zihadhasan.dev";
        // Construct robust mailto link
        const mailtoLink = `mailto:${targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;

        // Open email client
        window.location.href = mailtoLink;

        setIsSubmitting(false);
        toast.success("Message sent! I'll get back to you soon.", { description: "Your specific email client has been opened." });
        form.reset();
    };

    const title = config?.contact?.title || "Let's Collaborate";
    const subtitle = config?.contact?.subtitle || "Have a project in mind or just want to discuss the future of tech? Drop me a line.";
    const location = config?.contact?.location || "Dhaka, Bangladesh";

    return (
        <div className="min-h-screen pt-24 pb-20 container mx-auto px-4 flex items-center justify-center">
            <div className="grid md:grid-cols-2 gap-12 w-full max-w-5xl items-center">

                {/* Text & Socials */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-8"
                >
                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                            <span dangerouslySetInnerHTML={{ __html: title.replace("Collaborate", "<span class='text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400'>Collaborate</span>") }} />
                        </h1>
                        <p className="text-xl text-muted-foreground">{subtitle}</p>
                    </div>

                    <div className="flex gap-4">
                        {socials.length > 0 ? socials.map((item, i) => (
                            <Link key={i} href={item.url} target="_blank">
                                <Button size="icon" variant="outline" className="h-12 w-12 rounded-full border-white/20 hover:bg-white/10 hover:text-primary transition-colors">
                                    <SocialIcon platform={item.platform} />
                                </Button>
                            </Link>
                        )) : (
                            <Link href="#" target="_blank"><Button size="icon" variant="outline"><Mail className="h-4 w-4" /></Button></Link>
                        )}
                    </div>

                    <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-white/10 backdrop-blur-md">
                        <h3 className="text-lg font-bold text-white mb-2">My Studio</h3>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <p>{location}</p>
                        </div>
                        <p className="text-primary mt-2">Available for freelance & contracts</p>
                    </div>
                </motion.div>

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <GlassCard className="p-8 border-white/10 shadow-2xl shadow-blue-500/10">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Name</Label>
                                    <Input name="name" placeholder="John Doe" className="bg-black/40 border-white/10" required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input name="email" type="email" placeholder="john@example.com" className="bg-black/40 border-white/10" required />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Subject</Label>
                                <Input name="subject" placeholder="Project Inquiry" className="bg-black/40 border-white/10" required />
                            </div>

                            <div className="space-y-2">
                                <Label>Message</Label>
                                <Textarea name="message" placeholder="Tell me about your project..." className="bg-black/40 border-white/10 min-h-[150px]" required />
                            </div>

                            <Button type="submit" disabled={isSubmitting} className="w-full">
                                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : <><Send className="mr-2 h-4 w-4" /> Send Message</>}
                            </Button>
                        </form>
                    </GlassCard>
                </motion.div>
            </div>
        </div>
    );
}

function SocialIcon({ platform }: { platform: string }) {
    switch (platform) {
        case "github": return <Github className="h-5 w-5" />;
        case "twitter": return <Twitter className="h-5 w-5" />;
        case "linkedin": return <Linkedin className="h-5 w-5" />;
        case "email": return <Mail className="h-5 w-5" />;
        default: return <Mail className="h-5 w-5" />;
    }
}
