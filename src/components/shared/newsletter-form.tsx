"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CMSService } from "@/lib/cms-service";

const subscribeSchema = z.object({
    name: z.string().optional(),
    email: z.string().email("Please enter a valid email."),
});

type SubscribeValues = z.infer<typeof subscribeSchema>;

export function NewsletterForm() {
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
    const { register, handleSubmit, reset, formState: { errors } } = useForm<SubscribeValues>({
        resolver: zodResolver(subscribeSchema)
    });

    const onSubmit = async (data: SubscribeValues) => {
        setStatus("submitting");
        try {
            await CMSService.subscribeToNewsletter(data.email, data.name);
            setStatus("success");
            reset();
            setTimeout(() => setStatus("idle"), 3000);
        } catch (error) {
            console.error(error);
            setStatus("error");
        }
    };

    return (
        <div className="w-full max-w-sm">
            <h3 className="font-semibold text-white mb-2">Join the inner circle</h3>
            <p className="text-sm text-gray-400 mb-4">
                Get notified about new projects, articles, and speaking engagements.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
                <div className="grid gap-2">
                    <Input
                        {...register("name")}
                        placeholder="Name (Optional)"
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50"
                    />
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            {...register("email")}
                            placeholder="Enter your email"
                            className="bg-white/5 border-white/10 text-white pl-9 placeholder:text-gray-500 focus:border-primary/50"
                        />
                        <Button
                            type="submit"
                            disabled={status === "submitting" || status === "success"}
                            className="absolute right-1 top-1 h-7 px-3 bg-primary text-black hover:bg-primary/90"
                        >
                            {status === "submitting" ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowRight className="h-3 w-3" />}
                        </Button>
                    </div>
                </div>
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}

                {status === "success" && <p className="text-xs text-green-400">Successfully subscribed!</p>}
                {status === "error" && <p className="text-xs text-red-400">Something went wrong. Try again.</p>}
            </form>
        </div>
    );
}
