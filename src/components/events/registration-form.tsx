"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Schema
const formSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email." }),
    phone: z.string().min(10, { message: "Please enter a valid phone number." }),
    trxId: z.string().min(5, { message: "Transaction ID is required." }),
    message: z.string().optional(),
});

export function RegistrationForm({ eventId, eventTitle, price }: { eventId: string, eventTitle: string, price: string }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            trxId: "",
            message: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        // TODO: Integrate Firebase Function / API Route here
        console.log("Submitting:", { ...values, eventId });

        // Simulate delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        setIsSubmitting(false);
        setIsSuccess(true);
    }

    const copyNumber = (number: string) => {
        navigator.clipboard.writeText(number);
        // Could add toast here
    };

    if (isSuccess) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
            >
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Registration Pending!</h2>
                <p className="text-muted-foreground mb-6">
                    We have received your request for <strong>{eventTitle}</strong>. <br />
                    You will receive a confirmation email once your payment is verified.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={() => window.location.href = '/my-learning'} className="bg-primary text-black hover:bg-primary/90">
                        View My Ticket
                    </Button>
                    <Button onClick={() => setIsSuccess(false)} variant="outline" className="border-white/10 text-white hover:bg-white/10">
                        Register Another
                    </Button>
                </div>
            </motion.div>
        );
    }

    return (
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
            <CardHeader>
                <CardTitle>Register for {eventTitle}</CardTitle>
                <CardDescription>Secure your spot by completing the payment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Payment Info Box */}
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-medium text-muted-foreground">Registration Fee</span>
                        <span className="text-xl font-bold text-primary">{price}</span>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-white">bKash (Send Money)</span>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-white/80">017XXXXXXXX</span>
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyNumber("017XXXXXXXX")}>
                                    <Copy className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-white">Nagad (Send Money)</span>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-white/80">018XXXXXXXX</span>
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyNumber("018XXXXXXXX")}>
                                    <Copy className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" className="bg-white/5 border-white/10" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email Address</FormLabel>
                                        <FormControl>
                                            <Input placeholder="john@example.com" className="bg-white/5 border-white/10" {...field} />
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
                                        <FormLabel>Phone Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="017..." className="bg-white/5 border-white/10" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="trxId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-primary font-bold">Transaction ID (TrxID)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="8X2..." className="bg-white/5 border-primary/30 focus-visible:ring-primary" {...field} />
                                    </FormControl>
                                    <FormDescription>Enter the Transaction ID from your payment SMS.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</> : "Submit Registration"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
