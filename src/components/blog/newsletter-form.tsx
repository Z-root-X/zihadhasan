"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail } from "lucide-react";
import { CMSService } from "@/lib/cms-service";
import { toast } from "sonner";

export function NewsletterForm() {
    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setSubmitting(true);
        try {
            await CMSService.subscribeToNewsletter(email);
            toast.success("Subscribed successfully!", {
                description: "Thank you for joining our community."
            });
            setEmail("");
        } catch (error) {
            console.error("Newsletter error", error);
            toast.error("Failed to subscribe. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1/2 bg-primary/5 blur-3xl -z-10" />

            <h3 className="text-xl font-bold text-white mb-2">Enjoyed this article?</h3>
            <p className="text-gray-400 mb-6 max-w-sm mx-auto">
                Subscribe to the newsletter to get the latest posts, tech insights, and project updates delivered to your inbox.
            </p>

            <form onSubmit={handleSubscribe} className="max-w-sm mx-auto flex gap-2">
                <div className="relative flex-1">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9 bg-white/5 border-white/10 text-white focus:border-primary/50"
                        required
                    />
                </div>
                <Button type="submit" disabled={submitting} className="bg-primary text-black hover:bg-primary/90">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
                </Button>
            </form>
        </div>
    );
}
