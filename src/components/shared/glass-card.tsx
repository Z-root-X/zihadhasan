import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

export function GlassCard({ children, className, hoverEffect = true, ...props }: GlassCardProps) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-md transition-all duration-300",
                hoverEffect && "hover:border-primary/30 hover:shadow-[0_0_30px_-10px_rgba(59,130,246,0.2)] hover:-translate-y-1",
                className
            )}
            {...props}
        >
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100" />
            {children}
        </div>
    );
}
