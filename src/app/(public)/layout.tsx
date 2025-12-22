import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

export default function PublicLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex min-h-screen flex-col relative">
            <div className="noise-bg" />
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}
