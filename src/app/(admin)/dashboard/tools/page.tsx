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

    const [selectedIds, setSelectedIds] = useState<string[]>([]);

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
            setSelectedIds(prev => prev.filter(selId => selId !== id)); // Remove from selection
        } catch (error) {
            console.error(error);
        }
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        if (selectedIds.length === tools.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(tools.map(t => t.id).filter(Boolean) as string[]);
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} tools?`)) return; // Simple confirm for bulk
        try {
            await CMSService.bulkDeleteTools(selectedIds);
            setTools(prev => prev.filter(t => !selectedIds.includes(t.id!)));
            setSelectedIds([]);
        } catch (error) {
            console.error("Bulk delete failed", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">AI Tools</h2>
                    <p className="text-muted-foreground">Manage your curated list of AI resources.</p>
                </div>
                <div className="flex items-center gap-2">
                    {selectedIds.length > 0 && (
                        <Button variant="destructive" onClick={handleBulkDelete}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete ({selectedIds.length})
                        </Button>
                    )}
                    <Button onClick={toggleAll} variant="outline" className="border-white/10 text-white hover:bg-white/10">
                        {selectedIds.length === tools.length ? "Deselect All" : "Select All"}
                    </Button>
                    <Button onClick={handleCreate} className="bg-primary text-black hover:bg-primary/90">
                        <Plus className="mr-2 h-4 w-4" /> Add Tool
                    </Button>
                </div>
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
                            className={`group relative flex flex-col rounded-lg border p-4 transition-all hover:bg-white/10 ${selectedIds.includes(tool.id!)
                                    ? "border-primary bg-primary/5"
                                    : "border-white/10 bg-white/5 hover:border-primary/20"
                                }`}
                        >
                            <div className="absolute top-3 right-3 z-10">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(tool.id!)}
                                    onChange={() => toggleSelection(tool.id!)}
                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer accent-primary"
                                />
                            </div>

                            <div className="flex items-start justify-between mb-3 pr-6">
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
                            </div>

                            <p className="text-xs text-gray-400 line-clamp-2 mb-3 flex-1">
                                {tool.description}
                            </p>

                            <div className="mt-auto flex gap-2">
                                <a
                                    href={tool.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 flex items-center justify-center gap-2 rounded bg-white/5 py-2 text-xs font-medium text-gray-300 hover:bg-primary hover:text-black transition-colors"
                                >
                                    <ExternalLink className="h-3 w-3" /> Visit
                                </a>
                                <button onClick={() => handleEdit(tool)} className="p-2 hover:bg-white/10 rounded text-gray-400 hover:text-white border border-white/5">
                                    <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button onClick={() => tool.id && setDeletingId(tool.id)} className="p-2 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400 border border-white/5">
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
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
