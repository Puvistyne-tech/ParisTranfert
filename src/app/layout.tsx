import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    metadataBase: new URL("https://prestigeshuttlegroup.com"),
    title: {
        default: "Luxury Private Chauffeur & 24/7 Airport Transfer Service in Paris",
        template: "%s | Prestige Shuttle Group",
    },
    description:
        "Luxury private chauffeur service in Paris offering premium CDG airport transfers, professional airport taxi service, and 24/7 private chauffeur travel across France.",
    keywords: [
        "luxury chauffeur Paris",
        "airport transfer Paris",
        "CDG airport transfer",
        "private chauffeur service",
        "24/7 airport taxi Paris",
        "Prestige Shuttle Group",
        "Mercedes chauffeur Paris",
        "Orly airport transfer",
        "Disneyland Paris transfer",
    ],
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "Prestige Shuttle Group",
    },
    icons: {
        apple: [
            {
                url: "/web-app-manifest-192x192.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                url: "/web-app-manifest-512x512.png",
                sizes: "512x512",
                type: "image/png",
            },
        ],
    },
    openGraph: {
        type: "website",
        siteName: "Prestige Shuttle Group",
        title: "Luxury Private Chauffeur & 24/7 Airport Transfer Service in Paris",
        description:
            "Luxury private chauffeur service in Paris offering premium CDG airport transfers, professional airport taxi service, and 24/7 private chauffeur travel across France.",
        url: "https://prestigeshuttlegroup.com",
        images: [
            {
                url: "/web-app-manifest-512x512.png",
                width: 512,
                height: 512,
                alt: "Prestige Shuttle Group",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Luxury Private Chauffeur & 24/7 Airport Transfer Service in Paris",
        description:
            "Luxury private chauffeur service in Paris offering premium CDG airport transfers, professional airport taxi service, and 24/7 private chauffeur travel across France.",
        images: ["/web-app-manifest-512x512.png"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    other: {
        "mobile-web-app-capable": "yes",
        "apple-mobile-web-app-title": "Prestige Shuttle Group",
        "apple-mobile-web-app-capable": "yes",
        "apple-mobile-web-app-status-bar-style": "default",
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)", color: "#111827" },
    ],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                {children}
                <SpeedInsights />
                <Analytics />
            </body>
        </html>
    );
}
