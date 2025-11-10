"use client";

import { createContext, useContext, useEffect, useState } from "react";

type DarkModeContextType = {
  isDark: boolean;
  toggleDarkMode: () => void;
};

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

// Admin Dark Mode Provider - scoped to admin pages only
export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check localStorage for saved preference
    const saved = localStorage.getItem("admin-dark-mode");
    if (saved !== null) {
      const shouldBeDark = saved === "true";
      setIsDark(shouldBeDark);
      // Apply to admin container only
      const adminContainer = document.getElementById("admin-container");
      if (adminContainer) {
        if (shouldBeDark) {
          adminContainer.classList.add("dark");
        } else {
          adminContainer.classList.remove("dark");
        }
      }
      // Ensure public container doesn't have dark class
      const publicContainer = document.getElementById("public-container");
      if (publicContainer) {
        publicContainer.classList.remove("dark");
      }
    } else {
      // Default to system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDark(prefersDark);
      const adminContainer = document.getElementById("admin-container");
      if (adminContainer) {
        if (prefersDark) {
          adminContainer.classList.add("dark");
        } else {
          adminContainer.classList.remove("dark");
        }
      }
      // Ensure public container doesn't have dark class
      const publicContainer = document.getElementById("public-container");
      if (publicContainer) {
        publicContainer.classList.remove("dark");
      }
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Apply dark mode class to admin container only
    const adminContainer = document.getElementById("admin-container");
    if (adminContainer) {
      if (isDark) {
        adminContainer.classList.add("dark");
        localStorage.setItem("admin-dark-mode", "true");
      } else {
        adminContainer.classList.remove("dark");
        localStorage.setItem("admin-dark-mode", "false");
      }
    }
    // Ensure public container doesn't have dark class
    const publicContainer = document.getElementById("public-container");
    if (publicContainer) {
      publicContainer.classList.remove("dark");
    }
  }, [isDark, mounted]);

  const toggleDarkMode = () => {
    setIsDark((prev) => {
      const newValue = !prev;
      // Apply immediately for instant feedback
      const adminContainer = document.getElementById("admin-container");
      if (adminContainer) {
        if (newValue) {
          adminContainer.classList.add("dark");
          localStorage.setItem("admin-dark-mode", "true");
        } else {
          adminContainer.classList.remove("dark");
          localStorage.setItem("admin-dark-mode", "false");
        }
      }
      // Ensure public container doesn't have dark class
      const publicContainer = document.getElementById("public-container");
      if (publicContainer) {
        publicContainer.classList.remove("dark");
      }
      return newValue;
    });
  };

  return (
    <DarkModeContext.Provider value={{ isDark, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error("useDarkMode must be used within a DarkModeProvider");
  }
  return context;
}

// Public Dark Mode Provider - for home and reservation pages
export function PublicDarkModeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check localStorage for saved preference
    const saved = localStorage.getItem("public-dark-mode");
    if (saved !== null) {
      const shouldBeDark = saved === "true";
      setIsDark(shouldBeDark);
      // Apply to public container only
      const publicContainer = document.getElementById("public-container");
      if (publicContainer) {
        if (shouldBeDark) {
          publicContainer.classList.add("dark");
        } else {
          publicContainer.classList.remove("dark");
        }
      }
      // Ensure admin container doesn't have dark class
      const adminContainer = document.getElementById("admin-container");
      if (adminContainer) {
        adminContainer.classList.remove("dark");
      }
    } else {
      // Default to system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDark(prefersDark);
      const publicContainer = document.getElementById("public-container");
      if (publicContainer) {
        if (prefersDark) {
          publicContainer.classList.add("dark");
        } else {
          publicContainer.classList.remove("dark");
        }
      }
      // Ensure admin container doesn't have dark class
      const adminContainer = document.getElementById("admin-container");
      if (adminContainer) {
        adminContainer.classList.remove("dark");
      }
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Apply dark mode class to public container only
    const publicContainer = document.getElementById("public-container");
    if (publicContainer) {
      if (isDark) {
        publicContainer.classList.add("dark");
        localStorage.setItem("public-dark-mode", "true");
      } else {
        publicContainer.classList.remove("dark");
        localStorage.setItem("public-dark-mode", "false");
      }
    }
    // Ensure admin container doesn't have dark class
    const adminContainer = document.getElementById("admin-container");
    if (adminContainer) {
      adminContainer.classList.remove("dark");
    }
  }, [isDark, mounted]);

  const toggleDarkMode = () => {
    setIsDark((prev) => {
      const newValue = !prev;
      // Apply immediately for instant feedback
      const publicContainer = document.getElementById("public-container");
      if (publicContainer) {
        if (newValue) {
          publicContainer.classList.add("dark");
          localStorage.setItem("public-dark-mode", "true");
        } else {
          publicContainer.classList.remove("dark");
          localStorage.setItem("public-dark-mode", "false");
        }
      }
      // Ensure admin container doesn't have dark class
      const adminContainer = document.getElementById("admin-container");
      if (adminContainer) {
        adminContainer.classList.remove("dark");
      }
      return newValue;
    });
  };

  return (
    <PublicDarkModeContext.Provider value={{ isDark, toggleDarkMode }}>
      {children}
    </PublicDarkModeContext.Provider>
  );
}

const PublicDarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export function usePublicDarkMode() {
  const context = useContext(PublicDarkModeContext);
  if (context === undefined) {
    throw new Error("usePublicDarkMode must be used within a PublicDarkModeProvider");
  }
  return context;
}

