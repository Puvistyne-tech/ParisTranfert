"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";

export function ConditionalNavbar() {
  const pathname = usePathname();

  // Pages that should NOT have navbar
  const noNavbarPages = [
    "/reservation",
    "/confirmation",
    "/booking",
    "/admin", // Exclude all admin pages
    "/dashboard"
  ];

  // Check if current page should have navbar
  const shouldShowNavbar = !noNavbarPages.some(page => pathname.includes(page));

  if (!shouldShowNavbar) {
    return null;
  }

  return <Navbar />;
}
