"use client";

import {
  ArrowUp,
  Facebook,
  Instagram,
  Mail,
  MessageCircle,
  Phone,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";

export function MobileFAB() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const locale = useLocale();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePhoneClick = () => {
    window.location.href = "tel:+33619975136";
    setIsExpanded(false);
  };

  const handleEmailClick = () => {
    window.location.href = "mailto:support@prestigeshuttlegroup.com";
    setIsExpanded(false);
  };

  const handleMessageClick = () => {
    router.push(`/${locale}/contact`);
    setIsExpanded(false);
  };

  const handleInstagramClick = () => {
    window.open(
      "https://www.instagram.com/prestige_shuttle_group?igsh=MXRucjBudGZyZ2UyNA==",
      "_blank",
      "noopener,noreferrer",
    );
    setIsExpanded(false);
  };

  const handleFacebookClick = () => {
    window.open(
      "https://www.facebook.com/share/1CjiuP6kZK/?mibextid=wwXIfr",
      "_blank",
      "noopener,noreferrer",
    );
    setIsExpanded(false);
  };

  return (
    <div className="md:hidden fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {/* Scroll to Top Button - Hide when expanded */}
      {showScrollTop && !isExpanded && (
        <button
          onClick={scrollToTop}
          className="w-14 h-14 bg-blue-600 dark:bg-blue-500 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-all duration-300 active:scale-95 border-2 border-white dark:border-white/30"
          aria-label="Scroll to top"
          style={{ boxShadow: "0 10px 25px rgba(0, 0, 0, 0.4)" }}
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}

      {/* Expandable Contact Button */}
      <div className="relative">
        {/* Expanded Menu Items */}
        <div
          className={`absolute bottom-16 right-0 mb-2 flex flex-col gap-3 transition-all duration-300 ${
            isExpanded
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          {/* Phone */}
          <button
            onClick={handlePhoneClick}
            className="w-12 h-12 bg-green-600 dark:bg-green-500 rounded-full shadow-xl flex items-center justify-center text-white hover:scale-110 transition-all duration-300 active:scale-95 border-2 border-white dark:border-white/30"
            aria-label="Call us"
            style={{
              transitionDelay: isExpanded ? "0ms" : "0ms",
              boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)",
            }}
          >
            <Phone className="w-5 h-5" />
          </button>

          {/* Email */}
          <button
            onClick={handleEmailClick}
            className="w-12 h-12 bg-blue-500 dark:bg-blue-400 rounded-full shadow-xl flex items-center justify-center text-white hover:scale-110 transition-all duration-300 active:scale-95 border-2 border-white dark:border-white/30"
            aria-label="Email us"
            style={{
              transitionDelay: isExpanded ? "50ms" : "0ms",
              boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)",
            }}
          >
            <Mail className="w-5 h-5" />
          </button>

          {/* Message/Contact */}
          <button
            onClick={handleMessageClick}
            className="w-12 h-12 bg-purple-600 dark:bg-purple-500 rounded-full shadow-xl flex items-center justify-center text-white hover:scale-110 transition-all duration-300 active:scale-95 border-2 border-white dark:border-white/30"
            aria-label="Send message"
            style={{
              transitionDelay: isExpanded ? "100ms" : "0ms",
              boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)",
            }}
          >
            <MessageCircle className="w-5 h-5" />
          </button>

          {/* Instagram */}
          <button
            onClick={handleInstagramClick}
            className="w-12 h-12 bg-pink-600 dark:bg-pink-500 rounded-full shadow-xl flex items-center justify-center text-white hover:scale-110 transition-all duration-300 active:scale-95 border-2 border-white dark:border-white/30"
            aria-label="Instagram"
            style={{
              transitionDelay: isExpanded ? "150ms" : "0ms",
              boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)",
            }}
          >
            <Instagram className="w-5 h-5" />
          </button>

          {/* Facebook */}
          <button
            onClick={handleFacebookClick}
            className="w-12 h-12 bg-blue-700 dark:bg-blue-600 rounded-full shadow-xl flex items-center justify-center text-white hover:scale-110 transition-all duration-300 active:scale-95 border-2 border-white dark:border-white/30"
            aria-label="Facebook"
            style={{
              transitionDelay: isExpanded ? "200ms" : "0ms",
              boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)",
            }}
          >
            <Facebook className="w-5 h-5" />
          </button>
        </div>

        {/* Main Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-14 h-14 bg-blue-600 dark:bg-blue-500 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-all duration-300 active:scale-95 border-2 border-white dark:border-white/30 ${
            isExpanded ? "rotate-45" : ""
          }`}
          aria-label={isExpanded ? "Close contact menu" : "Open contact menu"}
          style={{ boxShadow: "0 10px 25px rgba(0, 0, 0, 0.4)" }}
        >
          {isExpanded ? (
            <X className="w-6 h-6" />
          ) : (
            <Phone className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Backdrop to close menu when clicking outside */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 -z-10"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
}
