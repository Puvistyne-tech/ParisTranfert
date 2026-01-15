"use client";

import {
  Calendar,
  LayoutDashboard,
  MoreHorizontal,
  Package,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

interface TabItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

export function BottomTabBar() {
  const pathname = usePathname();
  const locale = useLocale();

  const tabs: TabItem[] = [
    { name: "Dashboard", href: `/${locale}/admin`, icon: LayoutDashboard },
    {
      name: "Reservations",
      href: `/${locale}/admin/reservations`,
      icon: Calendar,
    },
    { name: "Clients", href: `/${locale}/admin/users`, icon: Users },
    { name: "Services", href: `/${locale}/admin/services`, icon: Package },
    { name: "More", href: `/${locale}/admin/more`, icon: MoreHorizontal },
  ];

  const normalizePath = (path: string) => {
    if (!path) return "";
    return path.split("?")[0].replace(/\/$/, "");
  };

  const normalizedPathname = normalizePath(pathname || "");

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab, index) => {
          const normalizedHref = normalizePath(tab.href);
          const isActive =
            normalizedPathname === normalizedHref ||
            (normalizedHref !== `/${locale}/admin` &&
              normalizedPathname.startsWith(normalizedHref + "/")) ||
            (tab.name === "More" &&
              (normalizedPathname === `/${locale}/admin/home-images` ||
                normalizedPathname === `/${locale}/admin/disneyland-images` ||
                normalizedPathname === `/${locale}/admin/categories` ||
                normalizedPathname === `/${locale}/admin/vehicles` ||
                normalizedPathname === `/${locale}/admin/locations` ||
                normalizedPathname === `/${locale}/admin/pricing` ||
                normalizedPathname === `/${locale}/admin/features` ||
                normalizedPathname === `/${locale}/admin/testimonials` ||
                normalizedPathname.startsWith(`/${locale}/admin/home-images/`) ||
                normalizedPathname.startsWith(`/${locale}/admin/disneyland-images/`) ||
                normalizedPathname.startsWith(`/${locale}/admin/categories/`) ||
                normalizedPathname.startsWith(`/${locale}/admin/vehicles/`) ||
                normalizedPathname.startsWith(`/${locale}/admin/locations/`) ||
                normalizedPathname.startsWith(`/${locale}/admin/pricing/`) ||
                normalizedPathname.startsWith(`/${locale}/admin/features/`) ||
                normalizedPathname.startsWith(`/${locale}/admin/testimonials/`)));

          return (
            <Link
              key={`${tab.name}-${index}`}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 min-w-0 px-2 py-2 rounded-lg transition-colors",
                isActive
                  ? "text-primary-600 dark:text-primary-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              )}
            >
              <tab.icon
                className={cn(
                  "w-5 h-5 mb-1",
                  isActive && "text-primary-600 dark:text-primary-400"
                )}
              />
              <span
                className={cn(
                  "text-xs font-medium truncate w-full text-center",
                  isActive && "text-primary-600 dark:text-primary-400"
                )}
              >
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

