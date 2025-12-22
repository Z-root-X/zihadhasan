"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CMSService } from "@/lib/cms-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, CreditCard } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const settingsSchema = z.object({
    heroTitle: z.string().optional(),
    heroSubtitle: z.string().optional(),
    heroImage: z.string().optional().or(z.literal("")),
    siteTitle: z.string().optional(),
    siteDescription: z.string().optional(),
    seoKeywords: z.string().optional(),
    showBlog: z.boolean(),
    showProjects: z.boolean(),
    showTools: z.boolean(),
    showEvents: z.boolean(),
    paymentBkash: z.string().optional(),
    paymentNagad: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            showBlog: true,
            showProjects: true,
            showTools: true,
            showEvents: true,
            paymentBkash: "",
            paymentNagad: "",
            seoKeywords: ""
        }
    });

    useEffect(() => {
        async function loadSettings() {
            try {
                const data = await CMSService.getGlobalSettings();
                if (data) {
                    form.reset({
                        heroTitle: data.heroTitle || "",
                        heroSubtitle: data.heroSubtitle || "",
                        heroImage: data.heroImage || "",
                        siteTitle: data.siteTitle || "",
                        siteDescription: data.siteDescription || "",
                        seoKeywords: data.seoKeywords ? data.seoKeywords.join(", ") : "",
                        showBlog: data.features?.showBlog ?? true,
                        showProjects: data.features?.showProjects ?? true,
                        showTools: data.features?.showTools ?? true,
                        showEvents: data.features?.showEvents ?? true,
                        paymentBkash: data.paymentNumbers?.bkash || "",
                        paymentNagad: data.paymentNumbers?.nagad || "",
                    });
                }
            } catch (error) {
                console.error("Failed to load settings", error);
            } finally {
                setLoading(false);
            }
        }
        loadSettings();
    }, [form]);

    const onSubmit = async (values: SettingsFormValues) => {
        setSaving(true);
        try {
            await CMSService.updateGlobalSettings({
                heroTitle: values.heroTitle,
                heroSubtitle: values.heroSubtitle,
                heroImage: values.heroImage,
                siteTitle: values.siteTitle,
                siteDescription: values.siteDescription,
                seoKeywords: values.seoKeywords ? values.seoKeywords.split(",").map(k => k.trim()).filter(Boolean) : [],
                features: {
                    showBlog: values.showBlog,
                    showProjects: values.showProjects,
                    showTools: values.showTools,
                    showEvents: values.showEvents,
                },
                paymentNumbers: {
                    bkash: values.paymentBkash,
                    nagad: values.paymentNagad
                }
            });
            alert("Settings saved successfully!");
        } catch (error) {
            console.error("Failed to save settings", error);
            alert("Failed to save settings.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Global Settings</h2>
                    <p className="text-muted-foreground">Manage your portfolio's core configuration.</p>
                </div>
                <Button onClick={form.handleSubmit(onSubmit)} disabled={saving} className="bg-primary text-black hover:bg-primary/90">
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </div>

            <Separator className="bg-white/10" />

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-white/5 border-white/10 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle className="text-white">Hero Section</CardTitle>
                        <CardDescription>Customize the first impression of your site.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="heroTitle" className="text-white">Hero Title (HTML Supported)</Label>
                            <Input id="heroTitle" {...form.register("heroTitle")} className="bg-black/40 border-white/10 text-white" placeholder="Building the Future..." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="heroSubtitle" className="text-white">Hero Subtitle</Label>
                            <Textarea id="heroSubtitle" {...form.register("heroSubtitle")} className="bg-black/40 border-white/10 text-white min-h-[100px]" placeholder="I craft high-performance..." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="heroImage" className="text-white">Hero Image URL</Label>
                            <Input id="heroImage" {...form.register("heroImage")} className="bg-black/40 border-white/10 text-white" placeholder="https://..." />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle className="text-white">SEO & Metadata</CardTitle>
                        <CardDescription>Control how your site appears in search results.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="siteTitle" className="text-white">Site Title (Default)</Label>
                            <Input id="siteTitle" {...form.register("siteTitle")} className="bg-black/40 border-white/10 text-white" placeholder="Zihad Hasan | ..." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="seoKeywords" className="text-white">Keywords (Comma separated)</Label>
                            <Textarea id="seoKeywords" {...form.register("seoKeywords")} className="bg-black/40 border-white/10 text-white" placeholder="Software Engineer, AI, React..." />
                            <p className="text-xs text-muted-foreground">These help search engines understand your specific niche.</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="bg-white/5 border-white/10 backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-primary" />
                                Payment Configuration
                            </CardTitle>
                            <CardDescription>Set numbers for Event Registration payments.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="paymentBkash" className="text-pink-500 font-semibold">bKash Number</Label>
                                <Input id="paymentBkash" {...form.register("paymentBkash")} className="bg-black/40 border-white/10 text-white" placeholder="017..." />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="paymentNagad" className="text-orange-500 font-semibold">Nagad Number</Label>
                                <Input id="paymentNagad" {...form.register("paymentNagad")} className="bg-black/40 border-white/10 text-white" placeholder="017..." />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/5 border-white/10 backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="text-white">Features & Metadata</CardTitle>
                            <CardDescription>Toggle sections and manage SEO defaults.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium text-white mb-2">Visibility Control</h4>

                                <div className="flex items-center justify-between rounded-lg border border-white/5 bg-black/20 p-4">
                                    <Label htmlFor="showProjects" className="text-base text-gray-200">Projects Section</Label>
                                    <Controller
                                        control={form.control}
                                        name="showProjects"
                                        render={({ field }) => (
                                            <Switch
                                                id="showProjects"
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        )}
                                    />
                                </div>

                                <div className="flex items-center justify-between rounded-lg border border-white/5 bg-black/20 p-4">
                                    <Label htmlFor="showTools" className="text-base text-gray-200">AI Tools Section</Label>
                                    <Controller
                                        control={form.control}
                                        name="showTools"
                                        render={({ field }) => (
                                            <Switch
                                                id="showTools"
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        )}
                                    />
                                </div>

                                <div className="flex items-center justify-between rounded-lg border border-white/5 bg-black/20 p-4">
                                    <Label htmlFor="showBlog" className="text-base text-gray-200">Blog Section</Label>
                                    <Controller
                                        control={form.control}
                                        name="showBlog"
                                        render={({ field }) => (
                                            <Switch
                                                id="showBlog"
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        )}
                                    />
                                </div>

                                <div className="flex items-center justify-between rounded-lg border border-white/5 bg-black/20 p-4">
                                    <Label htmlFor="showEvents" className="text-base text-gray-200">Events Section</Label>
                                    <Controller
                                        control={form.control}
                                        name="showEvents"
                                        render={({ field }) => (
                                            <Switch
                                                id="showEvents"
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
