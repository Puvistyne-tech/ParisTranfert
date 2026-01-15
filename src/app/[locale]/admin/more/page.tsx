"use client";

import {
  Car,
  DollarSign,
  FolderTree,
  Image as ImageIcon,
  LogOut,
  MapPin,
  MessageSquare,
  Sparkles,
  Star,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import type { AdminUser } from "@/lib/auth";
import { getCurrentUser, signOut } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface MoreNavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

export default function AdminMorePage() {
  const router = useRouter();
  const locale = useLocale();
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  // Get user display name
  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  const moreNavItems: MoreNavItem[] = [
    {
      name: "Home Images",
      href: `/${locale}/admin/home-images`,
      icon: ImageIcon,
    },
    {
      name: "Disneyland Images",
      href: `/${locale}/admin/disneyland-images`,
      icon: Sparkles,
    },
    {
      name: "Categories",
      href: `/${locale}/admin/categories`,
      icon: FolderTree,
    },
    { name: "Vehicle Types", href: `/${locale}/admin/vehicles`, icon: Car },
    { name: "Locations", href: `/${locale}/admin/locations`, icon: MapPin },
    { name: "Pricing", href: `/${locale}/admin/pricing`, icon: DollarSign },
    { name: "Features", href: `/${locale}/admin/features`, icon: Star },
    {
      name: "Testimonials",
      href: `/${locale}/admin/testimonials`,
      icon: MessageSquare,
    },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      router.push(`/${locale}`);
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* User Info Section */}
      <div className="mb-4 pb-4 border-b border-gray-100 dark:border-gray-700/50">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <User className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {userName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors flex-shrink-0"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="bg-white dark:bg-gray-800">
        {moreNavItems.map((item, index) => (
          <Link key={item.href} href={item.href}>
            <div
              className={cn(
                "px-4 py-3 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer",
                index === moreNavItems.length - 1 && "border-b-0"
              )}
            >
              <item.icon className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-900 dark:text-white">
                {item.name}
              </span>
              <div className="ml-auto">
                <svg
                  className="w-4 h-4 text-gray-400 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

