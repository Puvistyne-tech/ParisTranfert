"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Link from "next/link";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  Package,
  FolderTree,
  Car,
  MapPin,
  DollarSign,
  Star,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth";
import type { AdminUser } from "@/lib/auth";
import { useState } from "react";
import { useDarkMode } from "@/components/providers/DarkModeProvider";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

export function AdminSidebar({ user }: { user: AdminUser }) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isDark, toggleDarkMode } = useDarkMode();
  
  // Get user display name
  const userName = user.user_metadata?.full_name || 
                   user.user_metadata?.name || 
                   user.email?.split("@")[0] || 
                   "User";

  const navItems: NavItem[] = [
    { name: "Dashboard", href: `/${locale}/admin`, icon: LayoutDashboard },
    { name: "Reservations", href: `/${locale}/admin/reservations`, icon: Calendar },
    { name: "Users & Clients", href: `/${locale}/admin/users`, icon: Users },
    { name: "Services", href: `/${locale}/admin/services`, icon: Package },
    { name: "Categories", href: `/${locale}/admin/categories`, icon: FolderTree },
    { name: "Vehicle Types", href: `/${locale}/admin/vehicles`, icon: Car },
    { name: "Locations", href: `/${locale}/admin/locations`, icon: MapPin },
    { name: "Pricing", href: `/${locale}/admin/pricing`, icon: DollarSign },
    { name: "Features", href: `/${locale}/admin/features`, icon: Star },
    { name: "Testimonials", href: `/${locale}/admin/testimonials`, icon: MessageSquare },
  ];

  const filteredNavItems = navItems;

  const handleLogout = async () => {
    try {
      await signOut();
      router.push(`/${locale}`);
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between shadow-sm">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Admin Panel</h1>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          ) : (
            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] lg:top-0 lg:h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          "lg:fixed lg:translate-x-0"
        )}
      >
        <div className="h-full flex flex-col overflow-y-auto">
          {/* User Info at Top */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {userName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                  {user.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Admin
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h2>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle dark mode"
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {filteredNavItems.map((item) => {
              // Normalize paths for comparison (remove trailing slashes and query params)
              const normalizePath = (path: string) => {
                if (!path) return "";
                return path.split("?")[0].replace(/\/$/, "");
              };
              
              const normalizedPathname = normalizePath(pathname || "");
              const normalizedHref = normalizePath(item.href);
              
              // Check if current path matches exactly or is a sub-path
              const isActive = normalizedPathname === normalizedHref || 
                               (normalizedHref !== `/${locale}/admin` && normalizedPathname.startsWith(normalizedHref + "/")) ||
                               (normalizedHref === `/${locale}/admin` && normalizedPathname === normalizedHref);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 relative",
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-semibold border-l-4 border-blue-400 dark:border-blue-500"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400"
                  )}
                >
                  <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-blue-600 dark:text-blue-400" : "")} />
                  <span className="font-medium">{item.name}</span>
                  {isActive && (
                    <div className="absolute right-2 w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 dark:bg-black/70 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}

