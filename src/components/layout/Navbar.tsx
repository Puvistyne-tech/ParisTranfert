"use client";

import {
  Globe,
  LogOut,
  Menu,
  Settings,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import type { AdminUser } from "@/lib/auth";
import { getCurrentUser, isAdmin, signOut } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "es", name: "Español", flag: "🇪🇸" },
];

export function Navbar() {
  const t = useTranslations("navigation");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [userIsAdmin, setUserIsAdmin] = useState(false);

  // Check if we're on a page with light background
  const isLightBackgroundPage =
    pathname.includes("/services") ||
    pathname.includes("/about") ||
    pathname.includes("/contact") ||
    pathname.includes("/vehicles");

  // Use dark text if scrolled OR on light background pages
  const shouldUseDarkText = isScrolled || isLightBackgroundPage;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          const adminCheck = await isAdmin();
          setUser(currentUser);
          setUserIsAdmin(adminCheck);
        } else {
          setUser(null);
          setUserIsAdmin(false);
        }
      } catch (error) {
        // Silently handle auth errors (no session is expected for non-logged-in users)
        setUser(null);
        setUserIsAdmin(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLanguageChange = (newLocale: string) => {
    // Skip if already on the same locale
    if (newLocale === locale) {
      setIsLanguageMenuOpen(false);
      return;
    }

    // Get the current pathname without the locale prefix
    // pathname from usePathname() includes the locale (e.g., /fr/services)
    const segments = pathname.split("/").filter(Boolean);

    // Remove the first segment if it's a locale
    if (segments.length > 0 && ["en", "fr", "es"].includes(segments[0])) {
      segments.shift();
    }

    // Reconstruct the path with the new locale
    const pathWithoutLocale =
      segments.length > 0 ? `/${segments.join("/")}` : "";
    const newPath = `/${newLocale}${pathWithoutLocale}`;

    // Persist locale preference for future visits (30 days)
    const maxAgeSeconds = 60 * 60 * 24 * 30;
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;

    router.push(newPath);
    setIsLanguageMenuOpen(false);
  };

  const handleNavigationClick = (href: string) => {
    // All navigation items are now page links
    router.push(href);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      setUserIsAdmin(false);
      setIsUserMenuOpen(false);
      router.push(`/${locale}`);
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleAdminClick = () => {
    setIsUserMenuOpen(false);
    router.push(`/${locale}/admin`);
  };

  const currentLanguage = languages.find((lang) => lang.code === locale);

  const navItems = [
    { key: "home", href: `/${locale}`, type: "page" },
    { key: "services", href: `/${locale}/services`, type: "page" },
    { key: "about", href: `/${locale}/about`, type: "page" },
    { key: "contact", href: `/${locale}/contact`, type: "page" },
  ];

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-300 overflow-visible",
          shouldUseDarkText
            ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg"
            : "bg-transparent dark:bg-transparent",
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20 overflow-visible">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center space-x-2 md:space-x-4 hover:opacity-80 transition-opacity duration-300 relative z-10"
            >
              <div
                className="relative h-12 w-12 md:h-20 md:w-20 lg:h-24 lg:w-24"
                style={{ marginBottom: "0" }}
              >
                <Image
                  src="/logo.png"
                  alt="Prestige Shuttle Group"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span
                className={cn(
                  "text-base md:text-lg lg:text-xl font-bold font-display whitespace-nowrap",
                  shouldUseDarkText
                    ? "text-gray-900 dark:text-gray-100"
                    : "text-white",
                )}
              >
                Paris Transfers
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleNavigationClick(item.href)}
                  className={cn(
                    "font-medium transition-colors duration-300 relative group",
                    shouldUseDarkText
                      ? "text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                      : "text-white hover:text-accent-400",
                  )}
                >
                  {t(item.key)}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-600 to-accent-500 transition-all duration-300 group-hover:w-full"></span>
                </button>
              ))}


              {/* Language Switcher */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-300",
                    shouldUseDarkText
                      ? "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      : "text-white hover:bg-white/10",
                  )}
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {currentLanguage?.flag}
                  </span>
                </button>

                {isLanguageMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => handleLanguageChange(lang.code)}
                        className={cn(
                          "w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-3",
                          locale === lang.code &&
                            "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400",
                        )}
                      >
                        <span>{lang.flag}</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {lang.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* User Menu - Only show if logged in */}
              {user && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-300",
                      shouldUseDarkText
                        ? "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        : "text-white hover:bg-white/10",
                    )}
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {user.email?.split("@")[0] || "User"}
                    </span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {user.email}
                        </p>
                        {userIsAdmin && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {user.user_metadata?.role || user.role || "Admin"}
                          </p>
                        )}
                      </div>
                      {userIsAdmin && (
                        <button
                          type="button"
                          onClick={handleAdminClick}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Admin Panel</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-2 text-sm text-red-600 dark:text-red-400"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              <Button
                variant="primary"
                size="md"
                className="btn-premium"
                onClick={() => router.push(`/${locale}/reservation`)}
              >
                {t("bookNow")}
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="md:hidden p-2 rounded-lg transition-colors duration-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X
                  className={cn(
                    "w-6 h-6",
                    shouldUseDarkText ? "text-gray-700" : "text-white",
                  )}
                />
              ) : (
                <Menu
                  className={cn(
                    "w-6 h-6",
                    shouldUseDarkText ? "text-gray-700" : "text-white",
                  )}
                />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700">
            <div className="px-4 py-6 space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    handleNavigationClick(item.href);
                    setIsMobileMenuOpen(false);
                  }}
                  className="block py-3 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors duration-300 border-b border-gray-100 dark:border-gray-700 w-full text-left"
                >
                  {t(item.key)}
                </button>
              ))}

              {/* Mobile Language Switcher */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleLanguageChange(lang.code)}
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                        locale === lang.code
                          ? "bg-primary-600 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700",
                      )}
                    >
                      {lang.flag} {lang.code.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile User Menu - Only show if logged in */}
              {user && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="space-y-2">
                    <div className="px-2 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {user.email}
                      </p>
                      {userIsAdmin && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {user.user_metadata?.role || user.role || "Admin"}
                        </p>
                      )}
                    </div>
                    {userIsAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          handleAdminClick();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Admin Panel</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 flex items-center space-x-2 text-sm text-red-600 dark:text-red-400 border-b border-gray-100 dark:border-gray-700"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}

              <Button
                variant="primary"
                size="md"
                className="w-full btn-premium mt-4"
                onClick={() => {
                  router.push(`/${locale}/reservation`);
                  setIsMobileMenuOpen(false);
                }}
              >
                {t("bookNow")}
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Click outside to close menus */}
      {(isLanguageMenuOpen || isUserMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsLanguageMenuOpen(false);
            setIsUserMenuOpen(false);
          }}
        />
      )}
    </>
  );
}
