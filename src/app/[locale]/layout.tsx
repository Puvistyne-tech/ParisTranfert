import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";
import { routing } from "@/i18n/routing";
import { SpeedInsights } from '@vercel/speed-insights/next';


export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <QueryProvider>
        <LayoutWrapper>
          {children}
          <SpeedInsights />
          <ServiceWorkerRegistration enablePushNotifications={true} />
        </LayoutWrapper>
      </QueryProvider>
    </NextIntlClientProvider>
  );
}
