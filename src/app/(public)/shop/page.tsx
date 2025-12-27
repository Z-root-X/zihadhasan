"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Download, Lock } from "lucide-react";
import { Product, CMSService } from "@/lib/cms-service";
import { Button } from "@/components/ui/button";
import { PurchaseModal } from "@/components/shop/purchase-modal";
import { Loader2 } from "lucide-react";

export default function ShopPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await CMSService.getPublishedProducts();
                setProducts(data);
            } catch (error) {
                console.error("Failed to fetch products", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleBuy = (product: Product) => {
        setSelectedProduct(product);
        setShowModal(true);
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-black px-4 py-24 md:px-8">
            <div className="container mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-16 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 text-4xl font-black text-white md:text-6xl"
                    >
                        Digital <span className="text-primary">Store</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="mx-auto max-w-2xl text-gray-400"
                    >
                        Premium assets, source codes, and tools to accelerate your development workflow.
                        Instant access after manual verification.
                    </motion.p>
                </div>

                {/* Product Grid (Bento Style) */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-[400px]">
                    {products.map((product, i) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md transition-all hover:bg-white/10 ${i === 0 ? "md:col-span-2" : ""
                                }`}
                        >
                            {/* Image Background */}
                            <div className="absolute inset-0 z-0">
                                {product.imageUrl ? (
                                    <img
                                        src={product.imageUrl}
                                        alt={product.title}
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="h-full w-full bg-gradient-to-br from-gray-900 to-black" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                            </div>

                            {/* Content */}
                            <div className="absolute inset-0 z-10 flex flex-col justify-end p-8">
                                <div className="mb-4">
                                    <div className="mb-2 inline-flex items-center rounded-full border border-white/10 bg-black/50 px-3 py-1 text-xs font-medium text-primary backdrop-blur-md">
                                        {product.type === 'digital' ? <Download className="mr-1 h-3 w-3" /> : <ShoppingBag className="mr-1 h-3 w-3" />}
                                        {product.type.toUpperCase()}
                                    </div>
                                    <h3 className="text-2xl font-bold text-white md:text-3xl">{product.title}</h3>
                                    <p className="mt-2 line-clamp-2 text-sm text-gray-300">{product.description}</p>
                                </div>

                                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-400">Price</span>
                                        <span className="text-xl font-bold text-white">{product.price} BDT</span>
                                    </div>
                                    <Button
                                        onClick={() => handleBuy(product)}
                                        className="rounded-full bg-white px-6 text-black hover:bg-gray-200"
                                    >
                                        Buy Now
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {products.length === 0 && (
                    <div className="text-center text-gray-500 py-20">
                        No products available yet. Check back soon!
                    </div>
                )}
            </div>

            {selectedProduct && (
                <PurchaseModal
                    open={showModal}
                    onOpenChange={setShowModal}
                    product={selectedProduct}
                />
            )}
        </main>
    );
}
