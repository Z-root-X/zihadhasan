"use client";

import { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CMSService } from "@/lib/cms-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, CreditCard, Plus, Trash2, Building } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ImageUploader } from "@/components/admin/image-uploader";

// Bangladeshi Phone Regex: Starts with 01, followed by 3-9, and 8 digits (Total 11)
const bdPhoneRegex = /^01[3-9]\d{8}$/;

const settingsSchema = z.object({
    heroTitle: z.string().optional(),
    heroSubtitle: z.string().optional(),
    heroImage: z.string().optional().or(z.literal("")),
    siteTitle: z.string().optional(),
    siteDescription: z.string().optional(),
    seoKeywords: z.string().optional(),
    siteLogo: z.string().optional().or(z.literal("")),
    siteFavicon: z.string().optional().or(z.literal("")),
    showBlog: z.boolean(),
    showProjects: z.boolean(),
    showTools: z.boolean(),
    showEvents: z.boolean(),
    showShop: z.boolean(),
    showCourses: z.boolean(),
    socialGithub: z.string().optional().or(z.literal("")),
    socialLinkedin: z.string().optional().or(z.literal("")),
    socialTwitter: z.string().optional().or(z.literal("")),
    socialYoutube: z.string().optional().or(z.literal("")),
    socialFacebook: z.string().optional().or(z.literal("")),
    socialInstagram: z.string().optional().or(z.literal("")),
    socialEmail: z.string().email("Invalid email").optional().or(z.literal("")),
    paymentBkash: z.string().regex(bdPhoneRegex, "Invalid BD Number (e.g. 017...)").optional().or(z.literal("")),
    paymentNagad: z.string().regex(bdPhoneRegex, "Invalid BD Number (e.g. 017...)").optional().or(z.literal("")),
    bankAccounts: z.array(z.object({
        bankName: z.string().min(1, "Bank Name is required"),
        accountName: z.string().min(1, "Account Name is required"),
        accountNumber: z.string().min(1, "Account Number is required"),
        branch: z.string().optional(),
        routingNo: z.string().optional(),
    })).optional()
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
            showShop: true,
            showCourses: true,
            paymentBkash: "",
            paymentNagad: "",
            bankAccounts: [],
            seoKeywords: "",
            heroImage: "",
            siteLogo: "",
            siteFavicon: "",
            socialGithub: "",
            socialLinkedin: "",
            socialTwitter: "",
            socialYoutube: "",
            socialFacebook: "",
            socialInstagram: "",
            socialEmail: ""
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "bankAccounts"
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
                        siteLogo: data.siteLogo || "",
                        siteFavicon: data.siteFavicon || "",
                        showBlog: data.features?.showBlog ?? true,
                        showProjects: data.features?.showProjects ?? true,
                        showTools: data.features?.showTools ?? true,
                        showEvents: data.features?.showEvents ?? true,
                        showShop: data.features?.showShop ?? true,
                        showCourses: data.features?.showCourses ?? true,
                        paymentBkash: data.paymentNumbers?.bkash || "",
                        paymentNagad: data.paymentNumbers?.nagad || "",
                        bankAccounts: data.bankAccounts || [],
                        socialGithub: data.socials?.find(s => s.platform === "github")?.url || "",
                        socialLinkedin: data.socials?.find(s => s.platform === "linkedin")?.url || "",
                        socialTwitter: data.socials?.find(s => s.platform === "twitter")?.url || "",
                        socialYoutube: data.socials?.find(s => s.platform === "youtube")?.url || "",
                        socialFacebook: data.socials?.find(s => s.platform === "facebook")?.url || "",
                        socialInstagram: data.socials?.find(s => s.platform === "instagram")?.url || "",
                        socialEmail: data.socials?.find(s => s.platform === "email")?.url || "",
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
                siteLogo: values.siteLogo,
                siteFavicon: values.siteFavicon,
                features: {
                    showBlog: values.showBlog,
                    showProjects: values.showProjects,
                    showTools: values.showTools,
                    showEvents: values.showEvents,
                    showShop: values.showShop,
                    showCourses: values.showCourses,
                },
                paymentNumbers: {
                    bkash: values.paymentBkash,
                    nagad: values.paymentNagad
                },
                bankAccounts: values.bankAccounts?.map(b => ({
                    ...b,
                    branch: b.branch || "",
                    routingNo: b.routingNo || ""
                })),
                socials: [
                    values.socialGithub && { platform: "github", url: values.socialGithub },
                    values.socialLinkedin && { platform: "linkedin", url: values.socialLinkedin },
                    values.socialTwitter && { platform: "twitter", url: values.socialTwitter },
                    values.socialYoutube && { platform: "youtube", url: values.socialYoutube },
                    values.socialFacebook && { platform: "facebook", url: values.socialFacebook },
                    values.socialInstagram && { platform: "instagram", url: values.socialInstagram },
                    values.socialEmail && { platform: "email", url: values.socialEmail },
                ].filter(Boolean) as any[]
            });
            toast.success("Settings saved successfully!");
        } catch (error) {
            console.error("Failed to save settings", error);
            toast.error("Failed to save settings.");
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

            <fieldset disabled={saving} className="group-disabled:opacity-50">
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
                            <div className="space-y-3">
                                <Label className="text-white">Hero Background Image</Label>
                                <Controller
                                    control={form.control}
                                    name="heroImage"
                                    render={({ field }) => (
                                        <ImageUploader
                                            value={field.value || ""}
                                            onChange={field.onChange}
                                            label="Upload Hero Image"
                                        />
                                    )}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Recommended size: 1920x1080 (Dark/Noir style preferred).
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/5 border-white/10 backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="text-white">Features & Metadata</CardTitle>
                            <CardDescription>Control visibility and branding.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Branding Assets */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-white">Site Logo</Label>
                                    <Controller
                                        control={form.control}
                                        name="siteLogo"
                                        render={({ field }) => (
                                            <ImageUploader
                                                value={field.value || ""}
                                                onChange={field.onChange}
                                                label="Logo"
                                                className="aspect-square"
                                            />
                                        )}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white">Favicon</Label>
                                    <Controller
                                        control={form.control}
                                        name="siteFavicon"
                                        render={({ field }) => (
                                            <ImageUploader
                                                value={field.value || ""}
                                                onChange={field.onChange}
                                                label="Icon"
                                                className="aspect-square"
                                            />
                                        )}
                                    />
                                </div>
                            </div>

                            <Separator className="bg-white/10" />

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

                                <div className="flex items-center justify-between rounded-lg border border-white/5 bg-black/20 p-4">
                                    <Label htmlFor="showShop" className="text-base text-gray-200">Store / Shop</Label>
                                    <Controller
                                        control={form.control}
                                        name="showShop"
                                        render={({ field }) => (
                                            <Switch
                                                id="showShop"
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        )}
                                    />
                                </div>

                                <div className="flex items-center justify-between rounded-lg border border-white/5 bg-black/20 p-4">
                                    <Label htmlFor="showCourses" className="text-base text-gray-200">Courses (LMS)</Label>
                                    <Controller
                                        control={form.control}
                                        name="showCourses"
                                        render={({ field }) => (
                                            <Switch
                                                id="showCourses"
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        )}
                                    />
                                </div>
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

                    <Card className="bg-white/5 border-white/10 backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="text-white">Connect & Socials</CardTitle>
                            <CardDescription>Where can people find you?</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-white">GitHub URL</Label>
                                    <Input {...form.register("socialGithub")} className="bg-black/40 border-white/10 text-white" placeholder="https://github.com/..." />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white">LinkedIn URL</Label>
                                    <Input {...form.register("socialLinkedin")} className="bg-black/40 border-white/10 text-white" placeholder="https://linkedin.com/in/..." />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white">Twitter / X URL</Label>
                                    <Input {...form.register("socialTwitter")} className="bg-black/40 border-white/10 text-white" placeholder="https://x.com/..." />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white">YouTube URL</Label>
                                    <Input {...form.register("socialYoutube")} className="bg-black/40 border-white/10 text-white" placeholder="https://youtube.com/@..." />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white">Facebook URL</Label>
                                    <Input {...form.register("socialFacebook")} className="bg-black/40 border-white/10 text-white" placeholder="https://facebook.com/..." />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white">Instagram URL</Label>
                                    <Input {...form.register("socialInstagram")} className="bg-black/40 border-white/10 text-white" placeholder="https://instagram.com/..." />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-white">Contact Email</Label>
                                <Input {...form.register("socialEmail")} className="bg-black/40 border-white/10 text-white" placeholder="hello@example.com" />
                                <p className="text-xs text-muted-foreground">Used for the 'Email' icon in social links.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/5 border-white/10 backdrop-blur-md md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-primary" />
                                Payment Configuration
                            </CardTitle>
                            <CardDescription>Setup Mobile Banking and Bank Account details for students to pay.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="paymentBkash" className="text-pink-500 font-semibold">bKash Number</Label>
                                    <Input id="paymentBkash" {...form.register("paymentBkash")} className="bg-black/40 border-white/10 text-white" placeholder="017..." />
                                    {form.formState.errors.paymentBkash && (
                                        <p className="text-xs text-red-400">{form.formState.errors.paymentBkash.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="paymentNagad" className="text-orange-500 font-semibold">Nagad Number</Label>
                                    <Input id="paymentNagad" {...form.register("paymentNagad")} className="bg-black/40 border-white/10 text-white" placeholder="017..." />
                                    {form.formState.errors.paymentNagad && (
                                        <p className="text-xs text-red-400">{form.formState.errors.paymentNagad.message}</p>
                                    )}
                                </div>
                            </div>

                            <Separator className="bg-white/10" />

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label className="text-base text-white flex items-center gap-2">
                                            <Building className="h-4 w-4" /> Bank Accounts
                                        </Label>
                                        <p className="text-xs text-muted-foreground">Students see these when enrolling in Paid courses.</p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="border-white/10 hover:bg-white/10 text-primary hover:text-primary"
                                        onClick={() => append({ bankName: "", accountName: "", accountNumber: "", branch: "", routingNo: "" })}
                                    >
                                        <Plus className="h-4 w-4 mr-2" /> Add Account
                                    </Button>
                                </div>

                                <div className="grid gap-4">
                                    {fields.length === 0 && (
                                        <div className="text-center p-8 border border-dashed border-white/10 rounded-lg text-muted-foreground text-sm">
                                            No bank accounts added yet.
                                        </div>
                                    )}
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="grid gap-4 p-4 rounded-lg border border-white/10 bg-black/20 relative group">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => remove(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>

                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs text-muted-foreground">Bank Name</Label>
                                                    <Input {...form.register(`bankAccounts.${index}.bankName`)} className="bg-black/40 border-white/10 text-white h-8 text-sm" placeholder="e.g. Dutch Bangla Bank" />
                                                    {form.formState.errors.bankAccounts?.[index]?.bankName && (
                                                        <p className="text-xs text-red-400">{form.formState.errors.bankAccounts[index]?.bankName?.message}</p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs text-muted-foreground">Account Name</Label>
                                                    <Input {...form.register(`bankAccounts.${index}.accountName`)} className="bg-black/40 border-white/10 text-white h-8 text-sm" placeholder="e.g. Zihad Hasan" />
                                                    {form.formState.errors.bankAccounts?.[index]?.accountName && (
                                                        <p className="text-xs text-red-400">{form.formState.errors.bankAccounts[index]?.accountName?.message}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="grid md:grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs text-muted-foreground">Account Number</Label>
                                                    <Input {...form.register(`bankAccounts.${index}.accountNumber`)} className="bg-black/40 border-white/10 text-white h-8 text-sm" placeholder="e.g. 192..." />
                                                    {form.formState.errors.bankAccounts?.[index]?.accountNumber && (
                                                        <p className="text-xs text-red-400">{form.formState.errors.bankAccounts[index]?.accountNumber?.message}</p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs text-muted-foreground">Branch (Optional)</Label>
                                                    <Input {...form.register(`bankAccounts.${index}.branch`)} className="bg-black/40 border-white/10 text-white h-8 text-sm" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs text-muted-foreground">Routing No (Optional)</Label>
                                                    <Input {...form.register(`bankAccounts.${index}.routingNo`)} className="bg-black/40 border-white/10 text-white h-8 text-sm" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </fieldset>
        </div>
    );
}
