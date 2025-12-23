"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, ArrowLeft, Image as ImageIcon, Bold, Italic, List, ListOrdered, Quote, Code, Link as LinkIcon, Undo, Redo } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BlogPost, CMSService } from '@/lib/cms-service';
import slugify from 'slugify';
import { Timestamp } from 'firebase/firestore';
import { ImageUploader } from '@/components/admin/image-uploader';
import { toast } from 'sonner';

interface BlogEditorProps {
    initialData?: BlogPost;
}

export function BlogEditor({ initialData }: BlogEditorProps) {
    const router = useRouter();
    const [title, setTitle] = useState(initialData?.title || "");
    const [slug, setSlug] = useState(initialData?.slug || "");
    const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
    const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
    const [tags, setTags] = useState(initialData?.tags.join(", ") || "");
    const [isPublished, setIsPublished] = useState(initialData?.published || false);
    const [submitting, setSubmitting] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
            Link.configure({
                openOnClick: false,
            }),
        ],
        content: initialData?.content || '<p>Start writing your amazing story...</p>',
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none min-h-[400px]',
            },
        },
    });

    // Auto-generate slug from title if creating new post
    useEffect(() => {
        if (!initialData && title) {
            setSlug(slugify(title, { lower: true, strict: true }));
        }
    }, [title, initialData]);

    const handleSave = async () => {
        if (!editor) return;
        setSubmitting(true);

        const postData = {
            slug,
            title,
            excerpt,
            content: editor.getHTML(),
            coverImage,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            published: isPublished,
            publishedAt: isPublished ? (initialData?.publishedAt || Timestamp.now()) : undefined,
            author: {
                name: "Zihad Hasan", // Hardcoded for now, could be dynamic from Auth
                avatar: "https://github.com/shadcn.png"
            }
        };

        try {
            if (initialData && initialData.id) {
                await CMSService.updatePost(initialData.id, postData);
            } else {
                // check if slug exists? Firestore rules or service check ideal.
                // For now, simple create.
                await CMSService.createPost(postData);
            }
            router.push('/dashboard/blog');
            router.refresh();
        } catch (error) {
            console.error("Failed to save post", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (!editor) {
        return null;
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-20">
            {/* Header / Actions */}
            <div className="flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur-md z-10 py-4 border-b border-white/10">
                <Button variant="ghost" onClick={() => router.back()} className="text-gray-400">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Switch checked={isPublished} onCheckedChange={setIsPublished} id="publish-mode" />
                        <Label htmlFor="publish-mode" className={`text-sm ${isPublished ? "text-green-400" : "text-yellow-400"}`}>
                            {isPublished ? "Published" : "Draft"}
                        </Label>
                    </div>
                    <Button onClick={handleSave} disabled={submitting} className="bg-primary text-black hover:bg-primary/90">
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" /> {initialData ? "Update" : "Save"}
                    </Button>
                </div>
            </div>

            <div className="grid gap-6">
                {/* Meta Inputs */}
                <div className="grid gap-4 p-6 bg-white/5 border border-white/10 rounded-xl">
                    <div className="grid gap-2">
                        <Label className="text-white">Post Title</Label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter a catchy title"
                            className="text-lg font-bold bg-transparent border-white/10 text-white"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label className="text-white">Slug</Label>
                            <Input
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                className="bg-white/5 border-white/10 text-gray-300 font-mono text-sm"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-white">Tags (comma separated)</Label>
                            <Input
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="Next.js, React, Design"
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label className="text-white">Excerpt (SEO Description)</Label>
                        <Input
                            value={excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                            placeholder="Short summary for search engines and previews."
                            className="bg-white/5 border-white/10 text-white"
                        />
                    </div>

                    <div className="grid gap-2">
                        <ImageUploader
                            label="Cover Image"
                            value={coverImage}
                            onChange={setCoverImage}
                        />
                    </div>
                </div>

                {/* Editor Toolbar */}
                <div className="sticky top-[73px] z-10 flex flex-wrap gap-1 p-2 bg-white/5 border border-white/10 rounded-t-xl backdrop-blur-md">
                    <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={<Bold className="h-4 w-4" />} />
                    <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={<Italic className="h-4 w-4" />} />
                    <div className="w-px h-6 bg-white/10 mx-1" />
                    <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={<List className="h-4 w-4" />} />
                    <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} icon={<ListOrdered className="h-4 w-4" />} />
                    <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} icon={<Quote className="h-4 w-4" />} />
                    <ToolbarBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} icon={<Code className="h-4 w-4" />} />
                    <div className="w-px h-6 bg-white/10 mx-1" />
                    <ToolbarBtn onClick={() => {
                        const url = window.prompt('URL')
                        if (url) editor.chain().focus().setLink({ href: url }).run()
                    }} isActive={editor.isActive('link')} icon={<LinkIcon className="h-4 w-4" />} />
                    <ToolbarBtn onClick={() => {
                        const url = window.prompt('Image URL')
                        if (url) editor.chain().focus().setImage({ src: url }).run()
                    }} isActive={false} icon={<ImageIcon className="h-4 w-4" />} />
                    <div className="ml-auto flex gap-1">
                        <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} isActive={false} icon={<Undo className="h-4 w-4" />} />
                        <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} isActive={false} icon={<Redo className="h-4 w-4" />} />
                    </div>
                </div>

                {/* Editor Content */}
                <div className="min-h-[500px] p-6 bg-black border border-t-0 border-white/10 rounded-b-xl text-white">
                    <EditorContent editor={editor} />
                </div>
            </div>
        </div>
    );
}

function ToolbarBtn({ onClick, isActive, icon }: { onClick: () => void, isActive: boolean, icon: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            className={`p-2 rounded hover:bg-white/10 transition-colors ${isActive ? 'bg-primary/20 text-primary' : 'text-gray-400'}`}
        >
            {icon}
        </button>
    );
}
