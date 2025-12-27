"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Loader2, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import imageCompression from 'browser-image-compression';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ImageUploaderProps {
    value: string;
    onChange: (url: string) => void;
    className?: string;
    label?: string;
}

export function ImageUploader({ value, onChange, className, label = "Upload Image" }: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [inputType, setInputType] = useState<"drop" | "url">("drop");
    const [urlInput, setUrlInput] = useState("");

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
            toast.error("Cloudinary is not configured. Check ENV variables.");
            console.error("Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME or NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET");
            return;
        }

        setUploading(true);

        // Compress Image
        let fileToUpload = file;
        try {
            const options = {
                maxSizeMB: 0.8,
                maxWidthOrHeight: 1920,
                // usage: true // optional, for detailed logging
                useWebWorker: true
            };
            const compressedFile = await imageCompression(file, options);
            fileToUpload = compressedFile;
            // console.log(`Compressed from ${file.size / 1024 / 1024}MB to ${compressedFile.size / 1024 / 1024}MB`);
        } catch (error) {
            console.warn("Image compression failed, uploading original.", error);
        }

        const formData = new FormData();
        formData.append("file", fileToUpload);
        formData.append("upload_preset", uploadPreset);

        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (data.secure_url) {
                // Add optimization flags
                const optimizedUrl = data.secure_url.replace("/upload/", "/upload/f_auto,q_auto/");
                onChange(optimizedUrl);
                toast.success("Image uploaded successfully!");
            } else {
                throw new Error("Upload failed");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload image.");
        } finally {
            setUploading(false);
        }
    }, [onChange]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif']
        },
        maxFiles: 1,
        disabled: uploading
    });

    const handleUrlSubmit = () => {
        if (!urlInput) return;
        onChange(urlInput);
        setUrlInput("");
        setInputType("drop");
        toast.success("Image URL set!");
    };

    return (
        <div className={cn("space-y-3", className)}>
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white/80">{label}</span>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setInputType("drop")}
                        className={cn("h-7 text-xs", inputType === "drop" ? "bg-white/10 text-white" : "text-white/50")}
                    >
                        Upload
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setInputType("url")}
                        className={cn("h-7 text-xs", inputType === "url" ? "bg-white/10 text-white" : "text-white/50")}
                    >
                        URL
                    </Button>
                </div>
            </div>

            {value ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-white/10 bg-black/40 group">
                    <img src={value} alt="Preview" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => onChange("")}
                            className="h-8"
                        >
                            <X className="mr-2 h-4 w-4" /> Remove
                        </Button>
                    </div>
                </div>
            ) : (
                <>
                    {inputType === "drop" ? (
                        <div
                            {...getRootProps()}
                            className={cn(
                                "flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/10 cursor-pointer min-h-[160px]",
                                isDragActive && "border-primary bg-primary/5",
                                uploading && "opacity-50 pointer-events-none"
                            )}
                        >
                            <input {...getInputProps()} />
                            {uploading ? (
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <span className="text-xs text-white/50">Uploading to Cloud...</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-center">
                                    <div className="p-3 rounded-full bg-white/5">
                                        <Upload className="h-5 w-5 text-white/50" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-white/80">
                                            Click or drag to upload
                                        </p>
                                        <p className="text-xs text-white/40">
                                            Supports JPG, PNG, WEBP
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <Input
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                placeholder="https://images.unsplash.com/..."
                                className="bg-black/20 border-white/10 text-white"
                            />
                            <Button type="button" onClick={handleUrlSubmit} className="bg-white/10 hover:bg-white/20">
                                Set
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
