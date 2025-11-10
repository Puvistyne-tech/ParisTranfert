"use client";

import {
    Car,
    Clock,
    Facebook,
    Instagram,
    Lock,
    Mail,
    MapPin,
    Phone,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";

export function Footer() {
    const t = useTranslations("footer");
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const currentYear = new Date().getFullYear();
    
    // Hide admin login button on admin pages
    const isAdminPage = pathname?.includes('/admin');

    return (
        <footer className="bg-gray-900 dark:bg-gray-950 text-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div className="md:col-span-2">
                        <div className="flex items-center mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-500 rounded-lg flex items-center justify-center mr-3">
                                <Car className="text-white text-lg" />
                            </div>
                            <span className="text-2xl font-bold font-display gradient-text">
                                {t("companyName")}
                            </span>
                        </div>
                        <p className="text-gray-400 mb-6 leading-relaxed max-w-md">
                            {t("description")}
                        </p>
                        <div className="flex space-x-4">
                            <a
                                href="https://www.facebook.com/share/1CjiuP6kZK/?mibextid=wwXIfr"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center hover:scale-110 transition-all duration-300"
                                aria-label="Facebook"
                            >
                                <Facebook className="text-white w-5 h-5" />
                            </a>
                            <a
                                href="https://www.instagram.com/prestige_shuttle_group?igsh=MXRucjBudGZyZ2UyNA=="
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center hover:scale-110 transition-all duration-300"
                                aria-label="Instagram"
                            >
                                <Instagram className="text-white w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 text-accent-400">
                            {t("services")}
                        </h3>
                        <ul className="space-y-3 text-gray-400">
                            <li>
                                <Link
                                    href="/services"
                                    className="hover:text-accent-400 transition-colors duration-300"
                                >
                                    {t("airportTransfers")}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/services"
                                    className="hover:text-accent-400 transition-colors duration-300"
                                >
                                    {t("disneylandParis")}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/services"
                                    className="hover:text-accent-400 transition-colors duration-300"
                                >
                                    {t("privateTours")}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/services"
                                    className="hover:text-accent-400 transition-colors duration-300"
                                >
                                    {t("weddingTransfers")}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 text-accent-400">
                            {t("contactInfo")}
                        </h3>
                        <ul className="space-y-3 text-gray-400">
                            <li className="flex items-center">
                                <Phone className="text-accent-400 mr-2 w-4 h-4" />
                                <a
                                    href="tel:+33619975136"
                                    className="hover:text-accent-400 transition-colors duration-300"
                                >
                                    +33 6 19 97 51 36
                                </a>
                            </li>
                            <li className="flex items-center">
                                <Mail className="text-accent-400 mr-2 w-4 h-4" />
                                <a
                                    href="mailto:support@prestigeshuttlegroup.com"
                                    className="hover:text-accent-400 transition-colors duration-300"
                                >
                                    support@prestigeshuttlegroup.com
                                </a>
                            </li>
                            <li className="flex items-center">
                                <MapPin className="text-accent-400 mr-2 w-4 h-4" />
                                <span>Paris, France</span>
                            </li>
                            <li className="flex items-center">
                                <Clock className="text-accent-400 mr-2 w-4 h-4" />
                                <span>{t("service24")}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 mt-8 pt-8 relative">
                    <div className="text-center text-gray-400">
                    <p>{t("copyright", { year: currentYear })}</p>
                    </div>
                    {/* Admin Login Button - Bottom Left */}
                    {!isAdminPage && (
                        <button
                            type="button"
                            onClick={() => router.push(`/${locale}/admin/login`)}
                            className="absolute bottom-0 left-0 w-10 h-10 md:w-12 md:h-12 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl"
                            aria-label="Admin Login"
                            title="Admin Login"
                        >
                            <Lock className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                    )}
                </div>
            </div>
        </footer>
    );
}
