"use client";

import { usePathname } from "next/navigation";
import { PublicDarkModeProvider } from "@/components/providers/DarkModeProvider";
import { ConditionalNavbar } from "./ConditionalNavbar";
import { Footer } from "./Footer";
import { MobileFAB } from "./MobileFAB";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.includes("/admin");

  if (isAdminPage) {
    // Admin pages get their own layout (no navbar, footer, or login button)
    return <>{children}</>;
  }

  // Regular pages get the normal layout with public dark mode
  return (
    <PublicDarkModeProvider>
      <div id="public-container" className="min-h-screen flex flex-col">
        <ConditionalNavbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <MobileFAB />
      </div>
    </PublicDarkModeProvider>
  );
}
