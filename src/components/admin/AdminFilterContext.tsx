"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface AdminFilterContextType {
  filterContent: ReactNode | null;
  setFilterContent: (content: ReactNode | null) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (open: boolean) => void;
}

const AdminFilterContext = createContext<AdminFilterContextType | undefined>(
  undefined,
);

export function AdminFilterProvider({ children }: { children: ReactNode }) {
  const [filterContent, setFilterContent] = useState<ReactNode | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <AdminFilterContext.Provider
      value={{
        filterContent,
        setFilterContent,
        isFilterOpen,
        setIsFilterOpen,
      }}
    >
      {children}
    </AdminFilterContext.Provider>
  );
}

export function useAdminFilter() {
  const context = useContext(AdminFilterContext);
  if (!context) {
    throw new Error("useAdminFilter must be used within AdminFilterProvider");
  }
  return context;
}

