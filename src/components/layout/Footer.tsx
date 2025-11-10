"use client";

import {
  Car,
  Clock,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");
  const _locale = useLocale();

  const currentYear = new Date().getFullYear();

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
                href="#"
                className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center hover:scale-110 transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook className="text-white w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center hover:scale-110 transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="text-white w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center hover:scale-110 transition-all duration-300"
                aria-label="Twitter"
              >
                <Twitter className="text-white w-5 h-5" />
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
                <a
                  href="#services"
                  className="hover:text-accent-400 transition-colors duration-300"
                >
                  {t("airportTransfers")}
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  className="hover:text-accent-400 transition-colors duration-300"
                >
                  {t("disneylandParis")}
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  className="hover:text-accent-400 transition-colors duration-300"
                >
                  {t("privateTours")}
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  className="hover:text-accent-400 transition-colors duration-300"
                >
                  {t("weddingTransfers")}
                </a>
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
                <span>+33 1 XX XX XX XX</span>
              </li>
              <li className="flex items-center">
                <Mail className="text-accent-400 mr-2 w-4 h-4" />
                <span>info@paristransfers.com</span>
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
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>
            {t("copyright", { year: currentYear })}
          </p>
        </div>
      </div>
    </footer>
  );
}
