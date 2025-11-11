"use client";

import { Lock } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";

export function AdminLoginButton() {
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();

  // Hide on admin pages and login page
  const isAdminPage = pathname?.includes("/admin");

  if (isAdminPage) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => router.push(`/${locale}/admin/login`)}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl"
      aria-label="Admin Login"
      title="Admin Login"
    >
      <Lock className="w-6 h-6" />
    </button>
  );
}
