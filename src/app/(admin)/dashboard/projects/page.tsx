"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ExternalLink, Github, Loader2 } from "lucide-react";
import { CMSService, Project } from "@/lib/cms-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProjectForm } from "@/components/admin/project-form";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // Need to ensure alert-dialog exists, if not, stub or install. Assuming simple dialog logic for now or will fail if missing. 
// Plan: I'll check after this. If missing, I'll install. `alert-dialog` is a shadcn component.

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Initial Load
    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        setLoading(true);
        try {
            const data = await CMSService.getProjects();
            setProjects(data);
        } catch (error) {
            console.error("Failed to load projects", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingProject(null);
        setIsFormOpen(true);
    };

    const handleEdit = (project: Project) => {
        setEditingProject(project);
        setIsFormOpen(true);
    };

    const handleSubmit = async (data: Project) => {
        if (editingProject && editingProject.id) {
            // Update logic needs to be in CMSService. Wait, I saw `addProject` but did I see `updateProject`?
            // Let's check the Service file. 
            // I recall: addProject, getProjects, deleteProject. 
            // MISSING: updateProject.
            // I need to add that to CMSService!
            // For now I will assume it exists or I will add it immediately.
            await CMSService.updateProject(editingProject.id, data);
        } else {
            await CMSService.addProject(data);
        }
        await loadProjects();
    };

    // Quick Fix for missing updateProject: I will implement it in the next step.

    const handleDelete = async (id: string) => {
        // Confirmation handled by AlertDialog
        try {
            await CMSService.deleteProject(id);
            // Optimistic update
            setProjects(prev => prev.filter(p => p.id !== id));
            setDeletingId(null);
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Projects</h2>
                    <p className="text-muted-foreground">Manage your portfolio showcase.</p>
                </div>
                <Button onClick={handleCreate} className="bg-primary text-black hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" /> Add Project
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="animate-spin text-primary h-8 w-8" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className="group relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
                        >
                            {/* Image Aspect Ratio */}
                            <div className="relative aspect-video w-full overflow-hidden bg-black/50">
                                <img
                                    src={project.imageUrl || "/placeholder.png"}
                                    alt={project.title}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center gap-2">
                                    <Button size="sm" variant="secondary" onClick={() => handleEdit(project)}>
                                        <Pencil className="h-4 w-4 mr-2" /> Edit
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => project.id && setDeletingId(project.id)}>
                                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                                    </Button>
                                </div>
                            </div>

                            <div className="flex flex-1 flex-col p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-white text-lg line-clamp-1">{project.title}</h3>
                                </div>
                                <p className="text-sm text-gray-400 line-clamp-2 mb-4 flex-1">
                                    {project.description}
                                </p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {project.tags.slice(0, 3).map((tag, i) => (
                                        <span key={i} className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20">
                                            {tag}
                                        </span>
                                    ))}
                                    {project.tags.length > 3 && (
                                        <span className="text-[10px] bg-white/5 text-gray-400 px-2 py-1 rounded-full border border-white/10">
                                            +{project.tags.length - 3}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-white/5">
                                    {project.liveLink && (
                                        <a href={project.liveLink} target="_blank" rel="noreferrer" className="text-xs flex items-center text-gray-400 hover:text-primary transition-colors">
                                            <ExternalLink className="h-3 w-3 mr-1" /> Live Demo
                                        </a>
                                    )}
                                    {project.githubLink && (
                                        <a href={project.githubLink} target="_blank" rel="noreferrer" className="text-xs flex items-center text-gray-400 hover:text-white transition-colors ml-auto">
                                            <Github className="h-3 w-3 mr-1" /> Code
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {projects.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-xl bg-white/5">
                            <div className="bg-white/10 p-4 rounded-full mb-4">
                                <Plus className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-medium text-white">No Projects Yet</h3>
                            <p className="text-gray-400 max-w-sm mt-2 mb-6">Start building your portfolio by adding your first project.</p>
                            <Button onClick={handleCreate} variant="outline" className="border-primary text-primary hover:bg-primary/10">
                                Create Project
                            </Button>
                        </div>
                    )}
                </div>
            )}

            <ProjectForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                onSubmit={handleSubmit}
                initialData={editingProject}
            />

            <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the project from your portfolio.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deletingId && handleDelete(deletingId)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Delete Project
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
