import type { Metadata } from "next";
import { Inter_Tight, Outfit, Anek_Bangla } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { cn } from "@/lib/utils";
import { GoogleTagManager } from "@/components/providers/google-tag-manager";
import { generatePersonSchema } from "@/lib/schema-generator";
import { AuthProvider } from "@/components/auth/auth-provider";
import { AuthModal } from "@/components/auth/auth-modal";
import { MobileDock } from "@/components/shared/mobile-dock";
import { Toaster } from "sonner";

const interTight = Inter_Tight({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const anekBangla = Anek_Bangla({
  variable: "--font-bengali",
  subsets: ["bengali"],
  display: "swap",
});

import { CMSService } from "@/lib/cms-service";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await CMSService.getGlobalSettings();

  const title = settings?.siteTitle || "Zihad Hasan | Futuristic AI & Code";
  const description = settings?.siteDescription || "Zihad Hasan is a visionary Software Engineer building the future with AI and Next.js. Explore his portfolio of next-gen tools, events, and insights.";

  // Default keywords + dynamic ones
  const defaultKeywords = [
    "Zihad Hasan", "Software Engineer", "AI Expert", "Next.js", "React", "Bangladesh",
    "Next.js Developer", "React Specialist", "Web Developer Bangladesh", "Full Stack Developer", "JavaScript", "Artificial Intelligence"
  ];

  const dynamicKeywords = settings?.seoKeywords || [];
  const keywords = Array.from(new Set([...defaultKeywords, ...dynamicKeywords]));

  return {
    title: {
      default: title,
      template: "%s | Zihad Hasan"
    },
    description: description,
    keywords: keywords,
    authors: [{ name: "Zihad Hasan" }],
    creator: "Zihad Hasan",
    openGraph: {
      type: "website",
      locale: "en_US",
      url: "https://zihadhasan.web.app",
      siteName: "Zihad Hasan",
      title: title,
      description: description,
      images: [
        {
          url: "https://zihadhasan.web.app/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "Zihad Hasan Portfolio",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      creator: "@zihadhasan",
    },
    icons: {
      icon: "/favicon.ico",
    },
    verification: {
      google: "jPkgFKbB6U3TsCNK8ijsHyM6hJWLNWwFA3F-sU0zy0I",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          interTight.variable,
          outfit.variable,
          anekBangla.variable,
          "antialiased bg-background text-foreground relative overflow-x-hidden selection:bg-primary/20 selection:text-primary font-sans"
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SmoothScroll>
            <AuthProvider>
              <AuthModal />
              <GoogleTagManager containerId="GTM-WBP6HZV2" /> {/* Real GTM ID */}
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify(generatePersonSchema()),
                }}
              />
              {children}
              <MobileDock />
              <Toaster position="top-center" richColors theme="system" />
            </AuthProvider>
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
