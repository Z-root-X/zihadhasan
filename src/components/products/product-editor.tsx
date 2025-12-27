
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Upload, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { Product, CMSService } from "@/lib/cms-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ImageUploader } from "@/components/admin/image-uploader";

const productSchema = z.object({
    title: z.string().min(2, "Title is too short"),
    description: z.string().min(10, "Description is too short"),
    price: z.coerce.number().min(0, "Price must be positive"),
    type: z.enum(["digital", "physical"]),
    imageUrl: z.string().url("Cover image is required"),
    assets: z.array(z.string()).optional(), // For digital - simplified to array of strings for now
    downloadUrl: z.string().optional(), // For Direct download link (e.g. Google Drive) if not using assets array
    published: z.boolean().default(false),
});

interface ProductEditorProps {
    product?: Product | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export function ProductEditor({ product, onSuccess, onCancel }: ProductEditorProps) {
    const [saving, setSaving] = useState(false);

    // Use strict type for form values based on schema
    type ProductFormValues = z.infer<typeof productSchema>;

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema) as any,
        defaultValues: {
            title: product?.title || "",
            description: product?.description || "",
            price: product?.price || 0,
            type: (product?.type as "digital" | "physical") || "digital",
            imageUrl: product?.imageUrl || "",
            downloadUrl: product?.downloadUrl || "",
            published: product?.published || false,
            assets: product?.assets || [],
        },
    });

    const onSubmit = async (values: ProductFormValues) => {
        setSaving(true);
        try {
            // @ts-ignore
            const productData: Omit<Product, "id" | "createdAt"> = {
                ...values,
                assets: values.assets || [], // explicit
            };

            if (product?.id) {
                await CMSService.updateProduct(product.id, productData);
                toast.success("Product updated successfully");
            } else {
                await CMSService.addProduct(productData);
                toast.success("Product created successfully");
            }
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error("Failed to save product");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="rounded-xl border border-white/10 bg-black/50 p-6 backdrop-blur-md">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                    {product ? "Edit Product" : "Add New Product"}
                </h2>
                <Button variant="ghost" size="icon" onClick={onCancel}>
                    <X className="h-5 w-5" />
                </Button>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Left Column: Basic Info */}
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-300">Product Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Modern UI Kit" className="bg-white/5 border-white/10 text-white" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-300">Price (BDT)</FormLabel>
                                        <FormControl>
                                            <Input type="number" className="bg-white/5 border-white/10 text-white" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-300">Product Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="digital">Digital (Download)</SelectItem>
                                                <SelectItem value="physical">Physical (Shipping)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Conditional for Digital */}
                            {form.watch("type") === "digital" && (
                                <FormField
                                    control={form.control}
                                    name="downloadUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-300">Download/Access URL</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. https://drive.google.com/..." className="bg-white/5 border-white/10 text-white" {...field} />
                                            </FormControl>
                                            <p className="text-xs text-gray-400">Sent to user upon purchase approval.</p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        {/* Right Column: Media */}
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="imageUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-300">Cover Image</FormLabel>
                                        <FormControl>
                                            <ImageUploader
                                                label="Cover Image"
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="published"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base text-gray-200">Published</FormLabel>
                                            <p className="text-xs text-gray-400">
                                                Visible in the public store?
                                            </p>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-300">Description</FormLabel>
                                <FormControl>
                                    <Textarea rows={5} placeholder="Describe your product..." className="bg-white/5 border-white/10 text-white" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                        <Button type="button" variant="ghost" onClick={onCancel} className="text-gray-400 hover:text-white">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Product
                        </Button>
                    </div>

                </form>
            </Form>
        </div>
    );
}
