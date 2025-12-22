"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { CMSService, Tool } from "@/lib/cms-service";
import { Button } from "@/components/ui/button";
import { ToolForm } from "@/components/admin/tool-form";
import { Loader2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ToolsPage() {
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [editingTool, setEditingTool] = useState<Tool | null>(null);

    useEffect(() => {
        loadTools();
    }, []);

    const loadTools = async () => {
        setLoading(true);
        try {
            const data = await CMSService.getTools();
            setTools(data);
        } catch (error) {
            console.error("Failed to load tools", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingTool(null);
        setIsFormOpen(true);
    };

    const handleEdit = (tool: Tool) => {
        setEditingTool(tool);
        setIsFormOpen(true);
    };

    const handleSubmit = async (data: Tool) => {
        if (editingTool && editingTool.id) {
            await CMSService.updateTool(editingTool.id, data);
        } else {
            await CMSService.addTool(data);
        }
        await loadTools();
    };

    const handleDelete = async (id: string) => {
        // Confirmation handled by AlertDialog
        try {
            await CMSService.deleteTool(id);
            setTools(prev => prev.filter(t => t.id !== id));
            setDeletingId(null);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">AI Tools</h2>
                    <p className="text-muted-foreground">Manage your curated list of AI resources.</p>
                </div>
                <Button onClick={handleCreate} className="bg-primary text-black hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" /> Add Tool
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="animate-spin text-primary h-8 w-8" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {tools.map((tool) => (
                        <div
                            key={tool.id}
                            className="group relative flex flex-col rounded-lg border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/10 hover:border-primary/20"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-black/50 overflow-hidden border border-white/10 flex items-center justify-center">
                                        {tool.imageUrl ? (
                                            <img src={tool.imageUrl} alt={tool.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="text-xs font-bold text-gray-500">{tool.name.substring(0, 2)}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white text-sm">{tool.name}</h3>
                                        <span className="text-[10px] uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded-sm">
                                            {tool.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEdit(tool)} className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white">
                                        <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    <button onClick={() => tool.id && setDeletingId(tool.id)} className="p-1.5 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400">
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>

                            <p className="text-xs text-gray-400 line-clamp-2 mb-3 flex-1">
                                {tool.description}
                            </p>

                            <a
                                href={tool.url}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-auto flex items-center justify-center gap-2 w-full rounded bg-white/5 py-2 text-xs font-medium text-gray-300 hover:bg-primary hover:text-black transition-colors"
                            >
                                <ExternalLink className="h-3 w-3" /> Visit Site
                            </a>
                        </div>
                    ))}

                    {tools.length === 0 && (
                        <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-xl">
                            <p className="text-gray-500 mb-4">No tools added yet.</p>
                            <Button variant="outline" onClick={handleCreate}>Create First Tool</Button>
                        </div>
                    )}
                </div>
            )}

            <ToolForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                onSubmit={handleSubmit}
                initialData={editingTool}
            />

            <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the tool from your list.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deletingId && handleDelete(deletingId)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Delete Tool
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
