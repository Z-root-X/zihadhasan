"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { CMSService, Course, GlobalSettings } from "@/lib/cms-service";
import { useAuth } from "@/components/auth/auth-provider";
import { ImageUploader } from "@/components/admin/image-uploader";


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
    const [screenshotUrl, setScreenshotUrl] = useState("");

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
                screenshotUrl,
                paymentMethod,
                additionalInfo
            });

            if (result.success) {
                toast.success("Enrollment successful! Please wait for admin approval.", { description: "You can check status in My Account." });
                onSuccess();
                onOpenChange(false);
            } else {
                toast.error("Enrollment Failed", { description: String(result.error) });
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred during enrollment.");
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
                    {course.pricingType === "free" ? (
                        <div className="text-center space-y-4">
                            <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-xl">
                                <h3 className="text-xl font-bold text-green-400 mb-2">Free Access</h3>
                                <p className="text-gray-300 text-sm">
                                    This course is available for free. Click below to start learning immediately.
                                </p>
                            </div>
                            <Button
                                onClick={(e) => handleSubmit(e)}
                                className="w-full font-bold bg-green-600 hover:bg-green-700 text-white"
                                disabled={loading}
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Start Learning Now
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Payment Instructions */}
                            <div className="bg-white/5 p-4 rounded-lg border border-white/10 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-300">Course Fee:</span>
                                    <div className="text-right">
                                        <span className="text-xl font-bold text-primary">৳{course.price}</span>
                                        {course.pricingType === 'paid' && <div className="text-xs text-gray-500">One-time payment</div>}
                                    </div>
                                </div>
                                <div className="h-px bg-white/10" />
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase text-gray-500">Select Payment Method</Label>
                                    <div className="space-y-3">
                                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                            <SelectTrigger className="w-full bg-black/20 border-white/10 h-10">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="bkash">Bkash (Personal)</SelectItem>
                                                <SelectItem value="nagad">Nagad (Personal)</SelectItem>
                                                {settings?.bankAccounts?.map((bank, idx) => (
                                                    <SelectItem key={idx} value={`bank_${idx}`}>
                                                        {bank.bankName} - {bank.accountName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        {/* Dynamic Payment Details Display */}
                                        <div className="bg-black/40 border border-white/10 rounded-md p-3 space-y-2">
                                            {paymentMethod.startsWith('bank_') ? (
                                                (() => {
                                                    const bankIndex = parseInt(paymentMethod.split('_')[1]);
                                                    const bank = settings?.bankAccounts?.[bankIndex];
                                                    if (!bank) return null;
                                                    return (
                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-400">Bank:</span>
                                                                <span className="text-white">{bank.bankName}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-gray-400">Account No:</span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-mono text-white">{bank.accountNumber}</span>
                                                                    <button onClick={() => handleCopy(bank.accountNumber)} className="text-gray-400 hover:text-white">
                                                                        {copied === bank.accountNumber ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-400">Account Name:</span>
                                                                <span className="text-white">{bank.accountName}</span>
                                                            </div>
                                                            {bank.branch && (
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-400">Branch:</span>
                                                                    <span className="text-gray-500">{bank.branch}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })()
                                            ) : (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-400 capitalize">{paymentMethod} Number:</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-white text-lg">
                                                            {paymentMethod === 'bkash' ? settings?.paymentNumbers?.bkash : settings?.paymentNumbers?.nagad || "N/A"}
                                                        </span>
                                                        <button
                                                            onClick={() => {
                                                                const num = paymentMethod === 'bkash' ? settings?.paymentNumbers?.bkash : settings?.paymentNumbers?.nagad;
                                                                if (num) handleCopy(num);
                                                            }}
                                                            className="text-gray-400 hover:text-white"
                                                        >
                                                            {copied === (paymentMethod === 'bkash' ? settings?.paymentNumbers?.bkash : settings?.paymentNumbers?.nagad) ?
                                                                <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />
                                                            }
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        * Please complete the payment first, then fill out the form below.
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
                                    <Label>Payment Screenshot (Optional but Recommended)</Label>
                                    <ImageUploader
                                        value={screenshotUrl}
                                        onChange={setScreenshotUrl}
                                        label="Upload Screenshot"
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
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
