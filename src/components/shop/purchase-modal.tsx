"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Product, GlobalSettings } from "@/lib/cms-service";
import { useAuth } from "@/components/auth/auth-provider";
import { CMSService } from "@/lib/cms-service";

const formSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(11, "Valid phone number required"),
    trxId: z.string().min(5, "Transaction ID is required"),
});

interface PurchaseModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: Product;
}

export function PurchaseModal({ open, onOpenChange, product }: PurchaseModalProps) {
    const { user, profile } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [settings, setSettings] = useState<GlobalSettings | null>(null);

    useEffect(() => {
        if (open) {
            CMSService.getGlobalSettings().then(setSettings);
        }
    }, [open]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: profile?.name || user?.displayName || "",
            email: user?.email || "",
            phone: profile?.phone || "",
            trxId: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setSubmitting(true);
        try {
            const result = await CMSService.registerForProduct(product.id!, {
                userId: user?.uid, // Optional (guest checkout valid?) - Schema assumes logged in for now usually
                email: values.email,
                name: values.name,
                phone: values.phone,
                trxId: values.trxId,
                paymentMethod: "Manual/Bkash",
                // screenshotUrl: ... // Todo: Add file upload if needed later
            });

            if (result.success) {
                setSuccess(true);
                toast.success("Order placed successfully!");
            } else {
                toast.error(String(result.error) || "Failed to place order");
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    const copyNumber = (num: string) => {
        navigator.clipboard.writeText(num);
        toast.info("Number copied!");
    };

    const handleClose = () => {
        setSuccess(false);
        form.reset();
        onOpenChange(false);
    };

    const bkashNumber = settings?.paymentNumbers?.bkash || "017XXXXXXXX";
    const nagadNumber = settings?.paymentNumbers?.nagad || "018XXXXXXXX";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-black/90 border-white/10 text-white sm:max-w-[500px] backdrop-blur-xl">
                {!success ? (
                    <>
                        <DialogHeader>
                            <DialogTitle>Buy {product.title}</DialogTitle>
                            <DialogDescription className="text-gray-400">
                                Send <strong>{product.price} BDT</strong> to one of the numbers below.
                            </DialogDescription>
                        </DialogHeader>

                        {/* Payment Info */}
                        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
                            {settings?.paymentNumbers?.bkash && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-white">bKash (Send Money)</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-white/80">{bkashNumber}</span>
                                        <Button size="icon" variant="ghost" className="h-6 w-6 hover:bg-white/10" onClick={() => copyNumber(bkashNumber)}>
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {settings?.paymentNumbers?.nagad && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-white">Nagad (Send Money)</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-white/80">{nagadNumber}</span>
                                        <Button size="icon" variant="ghost" className="h-6 w-6 hover:bg-white/10" onClick={() => copyNumber(nagadNumber)}>
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {!settings?.paymentNumbers?.bkash && !settings?.paymentNumbers?.nagad && (
                                <div className="text-center text-sm text-yellow-500">
                                    No payment numbers configured. Please contact admin.
                                </div>
                            )}
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-white">Name</FormLabel>
                                                <FormControl>
                                                    <Input className="bg-white/5 border-white/10 text-white" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-white">Phone</FormLabel>
                                                <FormControl>
                                                    <Input className="bg-white/5 border-white/10 text-white" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-white">Email</FormLabel>
                                            <FormControl>
                                                <Input className="bg-white/5 border-white/10 text-white" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="trxId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-primary font-bold">Transaction ID (TrxID)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="8X2..."
                                                    className="bg-white/5 border-primary/30 focus-visible:ring-primary text-white"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription className="text-gray-500">
                                                Enter the Transaction ID from your payment SMS.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className="w-full bg-primary text-black hover:bg-primary/90" disabled={submitting || success}>
                                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {submitting ? "Placing Order..." : "Confirm Purchase"}
                                </Button>
                            </form>
                        </Form>
                    </>
                ) : (
                    <div className="py-10 flex flex-col items-center text-center">
                        <div className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
                            <CheckCircle2 className="h-10 w-10 text-green-500" />
                        </div>
                        <DialogTitle className="text-2xl mb-2">Order Received!</DialogTitle>
                        <DialogDescription className="text-gray-400 mb-8 max-w-xs">
                            We will verify your payment shortly. You will receive an email once your download is ready.
                        </DialogDescription>
                        <Button onClick={handleClose} className="w-full bg-white/10 hover:bg-white/20 text-white">
                            Close
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
