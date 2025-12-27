
"use client";

import { useEffect, useState } from "react";
import { Plus, Search, ShoppingBag, Download, Package, MoreVertical, Pencil, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Product, CMSService } from "@/lib/cms-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GlassCard } from "@/components/shared/glass-card";
import { ProductEditor } from "@/components/products/product-editor";

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        setLoading(true);
        try {
            // Note: Admin should see ALL products, even unpublished. 
            // Current getProducts() filters for !isDeleted.
            const data = await CMSService.getProducts();
            setProducts(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedProduct(null);
        setIsEditing(true);
    };

    const handleEdit = (product: Product) => {
        setSelectedProduct(product);
        setIsEditing(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            await CMSService.deleteProduct(id);
            toast.success("Product deleted");
            loadProducts();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete product");
        }
    };

    const handleSuccess = () => {
        setIsEditing(false);
        loadProducts();
    };

    const filtered = products.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

    if (isEditing) {
        return (
            <div className="space-y-6 p-8 pt-6">
                <ProductEditor
                    product={selectedProduct}
                    onSuccess={handleSuccess}
                    onCancel={() => setIsEditing(false)}
                />
            </div>
        );
    }

    return (
        <div className="space-y-8 p-8 pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Products</h2>
                    <p className="text-muted-foreground">Manage your digital and physical shop items.</p>
                </div>
                <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> Add Product
                </Button>
            </div>

            {/* Search & Filter */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search products..."
                        className="pl-9 bg-white/5 border-white/10 text-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Products Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((product) => (
                    <GlassCard key={product.id} className="group relative overflow-hidden transition-all hover:border-primary/50">
                        <div className="aspect-video w-full overflow-hidden bg-black/20 relative">
                            {product.imageUrl ? (
                                <img
                                    src={product.imageUrl}
                                    alt={product.title}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-gray-600">
                                    <Package className="h-8 w-8" />
                                </div>
                            )}

                            {/* Badges */}
                            <div className="absolute top-2 right-2 flex gap-2">
                                <Badge variant={product.published ? "default" : "secondary"} className={product.published ? "bg-green-500/80" : "bg-gray-500/80"}>
                                    {product.published ? "Live" : "Draft"}
                                </Badge>
                            </div>
                            <div className="absolute top-2 left-2">
                                <Badge variant="outline" className="bg-black/50 backdrop-blur border-white/10 text-white">
                                    {product.type === 'digital' ? <Download className="h-3 w-3 mr-1" /> : <Package className="h-3 w-3 mr-1" />}
                                    {product.type}
                                </Badge>
                            </div>
                        </div>

                        <div className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <h3 className="font-semibold text-lg text-white line-clamp-1">{product.title}</h3>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-black/90 border-white/10 text-gray-200">
                                        <DropdownMenuItem onClick={() => handleEdit(product)} className="cursor-pointer hover:bg-white/10">
                                            <Pencil className="mr-2 h-4 w-4" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDelete(product.id!)} className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10">
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <p className="text-sm text-gray-400 line-clamp-2 min-h-[40px]">
                                {product.description}
                            </p>

                            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                                <div className="text-lg font-bold text-white">৳ {product.price}</div>
                                <div className="text-xs text-gray-500">
                                    {/* Placeholder for sales stats if available */}
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                ))}

                {/* Add New Card (Empty State) */}
                {filtered.length === 0 && !loading && (
                    <button
                        onClick={handleCreate}
                        className="flex h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/5 transition-colors hover:border-primary/50 hover:bg-white/10"
                    >
                        <ShoppingBag className="h-10 w-10 text-gray-500 mb-2" />
                        <span className="text-lg font-medium text-gray-300">Add First Product</span>
                    </button>
                )}
            </div>
        </div>
    );
}
