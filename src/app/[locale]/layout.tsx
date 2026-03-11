import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";
import { routing } from "@/i18n/routing";

const baseUrl = "https://prestigeshuttlegroup.com";

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;

    return {
        alternates: {
            canonical: `${baseUrl}/${locale}`,
            languages: {
                en: `${baseUrl}/en`,
                fr: `${baseUrl}/fr`,
                es: `${baseUrl}/es`,
                "x-default": `${baseUrl}/en`,
            },
        },
    };
}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    setRequestLocale(locale);

    const messages = await getMessages();

    return (
        <NextIntlClientProvider messages={messages}>
            <QueryProvider>
                <LayoutWrapper>
                    {children}
                    <ServiceWorkerRegistration enablePushNotifications={true} />
                </LayoutWrapper>
            </QueryProvider>
        </NextIntlClientProvider>
    );
}
