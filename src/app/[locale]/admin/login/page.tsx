"use client";

import { AlertCircle, Eye, EyeOff, Info, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { getCurrentUser, isAdmin, signIn, signInWithGoogle } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [needsAdminRole, setNeedsAdminRole] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check if user is already authenticated and redirect if they are an admin
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          const adminCheck = await isAdmin();

          // If user is authenticated and is an admin, redirect to returnUrl or admin dashboard
          if (adminCheck) {
            const returnUrl = searchParams.get("returnUrl");
            if (returnUrl) {
              try {
                const decodedUrl = decodeURIComponent(returnUrl);
                // Validate that the URL is within the admin section for security
                if (decodedUrl.startsWith(`/${locale}/admin`)) {
                  router.push(decodedUrl);
                } else {
                  router.push(`/${locale}/admin`);
                }
              } catch {
                router.push(`/${locale}/admin`);
              }
            } else {
            router.push(`/${locale}/admin`);
            }
            return;
          }

          // User is authenticated but doesn't have admin role
          const role = user.user_metadata?.role || user.role;
          if (!role || role !== "admin") {
            setNeedsAdminRole(true);
            setError(
              "You are signed in, but you don't have admin access. Please contact an administrator to grant you admin privileges.",
            );
          }
        }
        // If no user, just show the login form (no error)
      } catch (err) {
        // Ignore errors here
      } finally {
        setCheckingAuth(false);
      }
    };

    checkUserStatus();
  }, [router, locale, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email, password);
      
      // Redirect to returnUrl if present, otherwise to admin dashboard
      const returnUrl = searchParams.get("returnUrl");
      if (returnUrl) {
        try {
          const decodedUrl = decodeURIComponent(returnUrl);
          // Validate that the URL is within the admin section for security
          if (decodedUrl.startsWith(`/${locale}/admin`)) {
            router.push(decodedUrl);
          } else {
            router.push(`/${locale}/admin`);
          }
        } catch {
          router.push(`/${locale}/admin`);
        }
      } else {
      router.push(`/${locale}/admin`);
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);

    try {
      // Get returnUrl and pass it to OAuth redirect
      const returnUrl = searchParams.get("returnUrl");
      let redirectTo = `${window.location.origin}/${locale}/admin`;
      
      if (returnUrl) {
        try {
          const decodedUrl = decodeURIComponent(returnUrl);
          // Validate that the URL is within the admin section for security
          if (decodedUrl.startsWith(`/${locale}/admin`)) {
            redirectTo = `${window.location.origin}${decodedUrl}`;
          }
        } catch {
          // Use default redirect if decoding fails
        }
      }
      
      // Store returnUrl in the redirect URL as a query parameter so we can retrieve it after OAuth
      const finalRedirect = returnUrl 
        ? `${redirectTo}?returnUrl=${encodeURIComponent(returnUrl)}`
        : redirectTo;
      
      await signInWithGoogle(finalRedirect);
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google");
      setGoogleLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative h-16 w-16">
                <Image
                  src="/logo.png"
                  alt="Paris Transfers"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Admin Login
            </h1>
            <p className="text-gray-600">Sign in to access the admin panel</p>
          </div>

          {error && (
            <div
              className={`mb-6 p-4 border rounded-lg flex items-start space-x-2 ${
                needsAdminRole
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              {needsAdminRole ? (
                <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <span className="text-sm block">{error}</span>
                {needsAdminRole && (
                  <div className="mt-2 text-xs text-blue-600">
                    <p className="font-semibold mb-1">To grant admin access:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Go to Supabase Dashboard → Authentication → Users</li>
                      <li>Find your user account</li>
                      <li>
                        Edit user metadata and add:{" "}
                        <code className="bg-blue-100 px-1 rounded">
                          role: &apos;admin&apos;
                        </code>
                      </li>
                      <li>
                        Or use SQL:{" "}
                        <code className="bg-blue-100 px-1 rounded">
                          UPDATE auth.users SET raw_user_meta_data =
                          raw_user_meta_data || &apos;{`{"role": "admin"}`}
                          &apos;::jsonb WHERE email =
                          &apos;your-email@example.com&apos;;
                        </code>
                      </li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@example.com"
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  disabled={loading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading || googleLoading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full mt-4"
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading}
            >
              {googleLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.69l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
