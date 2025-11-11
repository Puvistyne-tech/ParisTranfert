import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export interface AdminUser extends User {
  role?: "admin";
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(redirectTo?: string) {
  // Get the redirect URL - use provided one or default to /admin
  const redirectUrl =
    redirectTo ||
    (typeof window !== "undefined"
      ? `${window.location.origin}/admin`
      : "/admin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUrl,
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

/**
 * Get the current session
 */
export async function getSession() {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) {
      return null;
    }
    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

/**
 * Get the current user
 */
export async function getCurrentUser(): Promise<AdminUser | null> {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    // If there's an error (like no session), return null instead of throwing
    if (error || !user) {
      return null;
    }

    // Get user role from metadata
    const role = user.user_metadata?.role as "admin" | undefined;

    return {
      ...user,
      role,
    } as AdminUser;
  } catch (error) {
    // Handle any unexpected errors gracefully
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const session = await getSession();
    return !!session;
  } catch (error) {
    return false;
  }
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const role = user.user_metadata?.role || user.role;
  return role === "admin";
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(): Promise<AdminUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}

/**
 * Require admin role - throws if not admin
 */
export async function requireAdmin(): Promise<AdminUser> {
  const user = await requireAuth();
  const isAdminUser = await isAdmin();
  if (!isAdminUser) {
    throw new Error("Admin access required");
  }
  return user;
}
