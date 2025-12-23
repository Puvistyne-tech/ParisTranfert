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
    title: "Prestige Paris Transfers - Premium Transportation Services",
    description:
        "Premium transportation services in Paris. Reliable, comfortable, and professional. Experience luxury with our Mercedes fleet and exceptional service.",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "ParisTranfert",
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
    other: {
        "mobile-web-app-capable": "yes",
        "apple-mobile-web-app-title": "ParisTranfert",
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
        <html>
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
