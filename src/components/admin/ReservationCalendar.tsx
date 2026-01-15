"use client";

import { Scheduler, type CalendarEvent, type ViewType } from "calendarkit-pro";
import { useEffect, useMemo, useState } from "react";
import type { Reservation } from "@/components/models/reservations";

interface ReservationCalendarEvent extends CalendarEvent {
  reservation: Reservation;
}

interface ReservationCalendarProps {
  reservations: Reservation[];
  onSelectEvent?: (reservation: Reservation) => void;
}

function getReservationColor(status: Reservation["status"]) {
  switch (status) {
    case "confirmed":
      return "#10b981";
    case "completed":
      return "#6366f1";
    case "pending":
      return "#f59e0b";
    case "quote_requested":
      return "#fbbf24";
    case "quote_sent":
      return "#a78bfa";
    case "cancelled":
      return "#ef4444";
    default:
      return "#3b82f6";
  }
}

function buildReservationEvent(
  reservation: Reservation,
): ReservationCalendarEvent | null {
  const dateTimeStr = `${reservation.date}T${reservation.time}`;
  const startDate = new Date(dateTimeStr);

  if (Number.isNaN(startDate.getTime())) {
    return null;
  }

  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + 1);

  const title = `${reservation.time} • ${reservation.pickupLocation}${
    reservation.destinationLocation ? ` → ${reservation.destinationLocation}` : ""
  } • ${reservation.passengers} pax`;

  return {
    id: reservation.id,
    title,
    start: startDate,
    end: endDate,
    color: getReservationColor(reservation.status),
    reservation,
  };
}

export function ReservationCalendar({
  reservations,
  onSelectEvent,
}: ReservationCalendarProps) {
  const [view, setView] = useState<ViewType>("month");
  const [date, setDate] = useState(() => new Date());
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect dark mode from system preference or DOM
  useEffect(() => {
    const checkDarkMode = () => {
      // Check if admin container has dark class
      const adminContainer = document.getElementById("admin-container");
      if (adminContainer?.classList.contains("dark")) {
        setIsDarkMode(true);
        return;
      }
      
      // Fallback to system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDarkMode(prefersDark);
    };

    checkDarkMode();

    // Listen for changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => checkDarkMode();
    mediaQuery.addEventListener("change", handleChange);

    // Also listen for class changes on admin container
    const observer = new MutationObserver(checkDarkMode);
    const adminContainer = document.getElementById("admin-container");
    if (adminContainer) {
      observer.observe(adminContainer, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
      observer.disconnect();
    };
  }, []);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Filter views on mobile - only show day and agenda
  const handleViewChange = (newView: ViewType) => {
    if (isMobile && (newView === "month" || newView === "week")) {
      // On mobile, default to day view if trying to select month/week
      setView("day");
    } else {
      setView(newView);
    }
  };

  // Set default view to day on mobile
  useEffect(() => {
    if (isMobile && (view === "month" || view === "week")) {
      setView("day");
    }
  }, [isMobile, view]);

  // Hide calendars section and timezone selector via DOM manipulation
  useEffect(() => {
    const hideElements = () => {
      const wrapper = document.querySelector(".reservation-calendar-wrapper");
      if (!wrapper) return;

      // Hide calendars section - look for checkboxes in sidebar (more aggressive)
      const checkboxes = wrapper.querySelectorAll("input[type='checkbox']");
      checkboxes.forEach((checkbox) => {
        // Find parent container (could be div, section, or label)
        let parent = checkbox.parentElement;
        while (parent && parent !== wrapper) {
          const text = parent.textContent || "";
          // Hide if it contains calendar-related text but not view-related
          if (
            (text.includes("Calendar") || text.includes("calendar")) &&
            !text.includes("View") &&
            !text.includes("view")
          ) {
            (parent as HTMLElement).style.display = "none";
            break;
          }
          // Also hide if it's a label or div containing checkbox with calendar context
          if (
            (parent.tagName === "LABEL" || parent.tagName === "DIV") &&
            parent.querySelector("input[type='checkbox']")
          ) {
            const siblings = Array.from(parent.parentElement?.children || []);
            const hasCalendarText = siblings.some(
              (sib) =>
                sib.textContent?.includes("Calendar") ||
                sib.textContent?.includes("calendar"),
            );
            if (hasCalendarText && !text.includes("View")) {
              // Hide the entire section containing calendars
              const section = parent.closest("div, section, aside");
              if (section) {
                (section as HTMLElement).style.display = "none";
              }
              break;
            }
          }
          parent = parent.parentElement;
        }
      });

      // Hide timezone selector - more comprehensive search
      const selects = wrapper.querySelectorAll("select");
      selects.forEach((select) => {
        const options = Array.from(select.options);
        const hasTimezone =
          options.some(
            (opt) =>
              opt.value.includes("GMT") ||
              opt.text.includes("GMT") ||
              opt.value.includes("timezone") ||
              opt.text.includes("timezone") ||
              opt.text.includes("Time Zone"),
          ) ||
          select.getAttribute("aria-label")?.toLowerCase().includes("timezone") ||
          select.id?.toLowerCase().includes("timezone");

        if (hasTimezone) {
          // Hide the select and its parent container
          (select as HTMLElement).style.display = "none";
          let parent = select.parentElement;
          while (parent && parent !== wrapper) {
            const text = parent.textContent || "";
            if (
              text.includes("GMT") ||
              text.includes("timezone") ||
              text.includes("Time Zone") ||
              text.includes("Local Time")
            ) {
              (parent as HTMLElement).style.display = "none";
              break;
            }
            parent = parent.parentElement;
          }
        }
      });

      // Also hide any elements with timezone-related text
      const allElements = wrapper.querySelectorAll("*");
      allElements.forEach((el) => {
        const text = el.textContent || "";
        const htmlEl = el as HTMLElement;
        if (
          (text.includes("GMT") ||
            text.includes("timezone") ||
            text.includes("Time Zone") ||
            text.includes("Local Time")) &&
          !text.includes("View") &&
          htmlEl.tagName !== "OPTION"
        ) {
          // Check if it's a timezone-related section
          const isTimezoneSection =
            htmlEl.querySelector("select") ||
            htmlEl.getAttribute("aria-label")?.toLowerCase().includes("timezone");
          if (isTimezoneSection) {
            htmlEl.style.display = "none";
          }
        }
      });

      // Fix agenda view dark mode - aggressively target ALL white backgrounds
      if (isDarkMode) {
        // Find agenda view container
        const agendaElements = wrapper.querySelectorAll(
          '[class*="agenda"], [class*="Agenda"]',
        );
        
        agendaElements.forEach((el) => {
          const htmlEl = el as HTMLElement;
          
          // Fix ALL elements in agenda - be very aggressive
          const allElements = htmlEl.querySelectorAll("*");
          allElements.forEach((child) => {
            const childEl = child as HTMLElement;
            if (!childEl) return;
            
            const computedStyle = window.getComputedStyle(childEl);
            const bgColor = computedStyle.backgroundColor;
            const rgbMatch = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            
            // Check if background is white or very light (RGB values > 240)
            const isWhiteBg =
              rgbMatch &&
              parseInt(rgbMatch[1]) > 240 &&
              parseInt(rgbMatch[2]) > 240 &&
              parseInt(rgbMatch[3]) > 240;
            
            const hasWhiteClass =
              childEl.classList.toString().includes("bg-white") ||
              childEl.classList.toString().includes("bg-background") ||
              childEl.classList.toString().includes("bg-card");
            
            // Force dark background for white elements
            if (isWhiteBg || hasWhiteClass) {
              childEl.style.setProperty("background-color", "rgb(31 41 55)", "important");
              childEl.style.setProperty("color", "rgb(249 250 251)", "important");
            }
            
            // Also check inline styles
            const inlineBg = childEl.style.backgroundColor;
            if (
              inlineBg &&
              (inlineBg.includes("255") || inlineBg === "white" || inlineBg === "#fff" || inlineBg === "#ffffff")
            ) {
              childEl.style.setProperty("background-color", "rgb(31 41 55)", "important");
              childEl.style.setProperty("color", "rgb(249 250 251)", "important");
            }
            
            // Fix text color - make sure it's light
            const textColor = computedStyle.color;
            const textRgbMatch = textColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            if (textRgbMatch) {
              const r = parseInt(textRgbMatch[1]);
              const g = parseInt(textRgbMatch[2]);
              const b = parseInt(textRgbMatch[3]);
              // If text is dark (low RGB values), make it light
              if (r < 100 && g < 100 && b < 100) {
                childEl.style.setProperty("color", "rgb(249 250 251)", "important");
              }
            }
          });
          
          // Fix the container itself
          htmlEl.style.setProperty("background-color", "rgb(31 41 55)", "important");
          htmlEl.style.setProperty("color", "rgb(249 250 251)", "important");
        });
      }
    };

    // Run after a short delay to ensure calendar is rendered
    const timeout = setTimeout(hideElements, 100);
    // Also run on mutations
    const observer = new MutationObserver(hideElements);
    const wrapper = document.querySelector(".reservation-calendar-wrapper");
    if (wrapper) {
      observer.observe(wrapper, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, [isDarkMode]);

  const events = useMemo(() => {
    return reservations
      .map(buildReservationEvent)
      .filter((event): event is ReservationCalendarEvent => Boolean(event));
  }, [reservations]);

  // Admin theme colors matching gray-800 dark mode
  const adminTheme = useMemo(
    () => ({
      colors: {
        primary: isDarkMode ? "#3b82f6" : "#2563eb",
        secondary: isDarkMode ? "#4b5563" : "#6b7280",
        background: isDarkMode ? "#1f2937" : "#ffffff", // gray-800 in dark, white in light
        foreground: isDarkMode ? "#f9fafb" : "#111827",
        muted: isDarkMode ? "#374151" : "#f3f4f6",
        accent: isDarkMode ? "#4b5563" : "#e5e7eb",
        border: isDarkMode ? "#374151" : "#e5e7eb",
      },
    }),
    [isDarkMode],
  );

  return (
    <div className="h-[650px] w-full reservation-calendar-wrapper">
      <Scheduler
        events={events}
        view={view}
        onViewChange={handleViewChange}
        date={date}
        onDateChange={setDate}
        isDarkMode={isDarkMode}
        theme={adminTheme}
        readOnly
        hideViewSwitcher={isMobile}
        calendars={undefined}
        timezone={undefined}
        onEventClick={(event) =>
          onSelectEvent?.((event as ReservationCalendarEvent).reservation)
        }
      />
      <style jsx global>{`
        /* Hide month and week view buttons on mobile */
        @media (max-width: 767px) {
          .reservation-calendar-wrapper button[aria-label*="Month"],
          .reservation-calendar-wrapper button[aria-label*="month"],
          .reservation-calendar-wrapper button[aria-label*="Week"],
          .reservation-calendar-wrapper button[aria-label*="week"] {
            display: none !important;
          }
        }

        /* Hide calendars section and timezone - CSS fallback if props don't work */
        .reservation-calendar-wrapper aside div:has(input[type="checkbox"]:not([aria-label*="view"])) {
          display: none !important;
        }
        .reservation-calendar-wrapper aside section:has(input[type="checkbox"]:not([aria-label*="view"])) {
          display: none !important;
        }
        .reservation-calendar-wrapper select:has(option[value*="GMT"]),
        .reservation-calendar-wrapper select:has(option[value*="timezone"]) {
          display: none !important;
        }
        .reservation-calendar-wrapper div:has(select:has(option[value*="GMT"])),
        .reservation-calendar-wrapper div:has(select:has(option[value*="timezone"])) {
          display: none !important;
        }

        /* NUCLEAR OPTION: Force dark background on ALL agenda elements */
        .dark .reservation-calendar-wrapper [class*="agenda"],
        .dark .reservation-calendar-wrapper [class*="Agenda"] {
          background-color: rgb(31 41 55) !important;
        }

        /* Force dark background on all child elements in agenda */
        .dark .reservation-calendar-wrapper [class*="agenda"] *,
        .dark .reservation-calendar-wrapper [class*="Agenda"] * {
          background-color: rgb(31 41 55) !important;
          color: rgb(249 250 251) !important;
        }

        /* Specifically target event cards/items with white backgrounds */
        .dark .reservation-calendar-wrapper [class*="agenda"] > div,
        .dark .reservation-calendar-wrapper [class*="Agenda"] > div,
        .dark .reservation-calendar-wrapper [class*="agenda"] > div > div,
        .dark .reservation-calendar-wrapper [class*="Agenda"] > div > div,
        .dark .reservation-calendar-wrapper [class*="agenda"] li,
        .dark .reservation-calendar-wrapper [class*="Agenda"] li,
        .dark .reservation-calendar-wrapper [class*="agenda"] article,
        .dark .reservation-calendar-wrapper [class*="Agenda"] article,
        .dark .reservation-calendar-wrapper [class*="agenda"] section,
        .dark .reservation-calendar-wrapper [class*="Agenda"] section {
          background-color: rgb(31 41 55) !important;
          color: rgb(249 250 251) !important;
        }

        /* Override any white/light background classes */
        .dark .reservation-calendar-wrapper [class*="agenda"] [class*="bg-white"],
        .dark .reservation-calendar-wrapper [class*="Agenda"] [class*="bg-white"],
        .dark .reservation-calendar-wrapper [class*="agenda"] [class*="bg-background"],
        .dark .reservation-calendar-wrapper [class*="Agenda"] [class*="bg-background"],
        .dark .reservation-calendar-wrapper [class*="agenda"] [class*="bg-card"],
        .dark .reservation-calendar-wrapper [class*="Agenda"] [class*="bg-card"] {
          background-color: rgb(31 41 55) !important;
          color: rgb(249 250 251) !important;
        }
      `}</style>
    </div>
  );
}
