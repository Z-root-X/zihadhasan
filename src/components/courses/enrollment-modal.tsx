"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Copy, Check } from "lucide-react";
import { CMSService, Course, GlobalSettings } from "@/lib/cms-service";
import { useAuth } from "@/components/auth/auth-provider";


interface EnrollmentModalProps {
    course: Course;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function EnrollmentModal({ course, open, onOpenChange, onSuccess }: EnrollmentModalProps) {
    const { user, profile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState<GlobalSettings | null>(null);
    const [copied, setCopied] = useState<string | null>(null);

    // Form State
    const [phone, setPhone] = useState("");
    const [trxId, setTrxId] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("bkash");
    const [additionalInfo, setAdditionalInfo] = useState("");

    useEffect(() => {
        if (open) {
            CMSService.getGlobalSettings().then(setSettings);
            if (profile?.phone) setPhone(profile.phone);
        }
    }, [open, profile]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(text);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);

        try {
            const result = await CMSService.registerForCourse(course.id!, {
                userId: user.uid,
                email: user.email!,
                name: user.displayName || "Unknown",
                phone,
                trxId,
                paymentMethod,
                additionalInfo
            });

            if (result.success) {
                onSuccess();
                onOpenChange(false);
            } else {
                alert("Enrollment Failed: " + result.error);
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const paymentNumber = paymentMethod === 'bkash'
        ? settings?.paymentNumbers?.bkash
        : settings?.paymentNumbers?.nagad;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md bg-neutral-900 border-white/10 text-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Enroll in {course.title}</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        To access this course, please complete the payment securely.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Payment Instructions */}
                    <div className="bg-white/5 p-4 rounded-lg border border-white/10 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-300">Course Fee:</span>
                            <span className="text-xl font-bold text-primary">৳{course.price}</span>
                        </div>
                        <div className="h-px bg-white/10" />
                        <div className="space-y-2">
                            <Label className="text-xs uppercase text-gray-500">Send Payment To</Label>
                            <div className="flex gap-2">
                                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                    <SelectTrigger className="w-[100px] bg-black/20 border-white/10 h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bkash">Bkash</SelectItem>
                                        <SelectItem value="nagad">Nagad</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className="flex-1 flex items-center justify-between px-3 h-9 bg-black/40 border border-white/10 rounded-md">
                                    <span className="font-mono text-sm">
                                        {paymentNumber || "01XXXXXXXXX"}
                                    </span>
                                    <button
                                        onClick={() => paymentNumber && handleCopy(paymentNumber)}
                                        className="text-gray-400 hover:text-white transition-colors"
                                    >
                                        {copied === paymentNumber ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                                    </button>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500">
                                * Send money using "{paymentMethod === 'bkash' ? 'Send Money' : 'Send Money'}" option.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Your Phone Number</Label>
                            <Input
                                required
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                placeholder="e.g. 01712345678"
                                className="bg-black/20 border-white/10"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Transaction ID (TrxID)</Label>
                            <Input
                                required
                                value={trxId}
                                onChange={e => setTrxId(e.target.value)}
                                placeholder="e.g. 8JKS92KL"
                                className="bg-black/20 border-white/10 font-mono uppercase"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Additional Info (Optional)</Label>
                            <Textarea
                                value={additionalInfo}
                                onChange={e => setAdditionalInfo(e.target.value)}
                                placeholder="Any notes for the admin..."
                                className="bg-black/20 border-white/10 min-h-[80px]"
                            />
                        </div>

                        <Button type="submit" className="w-full font-bold" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit for Approval
                        </Button>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
