"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Loader2 } from "lucide-react";
import type { AdminUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { DarkModeProvider } from "@/components/providers/DarkModeProvider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);

  // Skip auth check for login page
  const isLoginPage = pathname?.includes('/admin/login');

  // Handle OAuth callback - extract tokens from URL hash and clean URL
  useEffect(() => {
    const handleOAuthCallback = async () => {
      // Check if there's a hash in the URL (OAuth tokens)
      if (typeof window !== 'undefined' && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        // If we have OAuth tokens in the hash, let Supabase handle them
        if (hashParams.has('access_token') || hashParams.has('error')) {
          try {
            // Supabase automatically processes the hash when getSession() is called
            // Wait a moment for it to process
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Get the session (this will process the hash tokens)
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
              console.error('Error getting session from OAuth callback:', error);
            }
            
            // Clean up the URL by removing the hash (after Supabase has processed it)
            const cleanUrl = window.location.pathname + window.location.search;
            window.history.replaceState({}, '', cleanUrl);
            
            // Refresh to update auth state throughout the app
            router.refresh();
          } catch (err) {
            console.error('Error handling OAuth callback:', err);
          }
        }
      }
    };

    handleOAuthCallback();
  }, [router]);

  useEffect(() => {
    // If on login page, skip auth check
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        const adminCheck = await isAdmin();

        if (!currentUser || !adminCheck) {
          router.push(`/${locale}/admin/login`);
          return;
        }

        setUser(currentUser);
        setIsAdminUser(adminCheck);
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push(`/${locale}/admin/login`);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, locale, pathname, isLoginPage]);

  // If on login page, render children without auth check
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 dark:text-primary-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdminUser) {
    return null;
  }

  return (
    <DarkModeProvider>
      <div id="admin-container" className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        {/* Sidebar */}
        <AdminSidebar user={user} />
        
        {/* Main content area - with proper spacing for mobile menu */}
        <div className="flex-1 lg:ml-64 min-h-screen pt-16 lg:pt-0">
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </div>
      </div>
    </DarkModeProvider>
  );
}

