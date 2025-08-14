"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type AppContextType = {
  // Sidebar state
  sidebarExpanded: boolean;
  setSidebarExpanded: (value: boolean) => void;
  toggleSidebar: () => void;

  // Search box state
  searchActive: boolean;
  setSearchActive: (value: boolean) => void;
  toggleSearch: () => void;

  // Morebar
  moreBarVisible: boolean
  setMoreBarVisible: (value: boolean) => void
  toggleMoreBar: () => void
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Sidebar expansion state
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(false);

  // Search box active state
  const [searchActive, setSearchActive] = useState<boolean>(false);

  // Morebar active state
  const [moreBarVisible, setMoreBarVisible] = useState<boolean>(false);

  const toggleSidebar = () => setSidebarExpanded((prev) => !prev);
  const toggleSearch = () => setSearchActive((prev) => !prev);
  const toggleMoreBar = () => setMoreBarVisible((prev) => !prev);

  return (
    <AppContext.Provider
      value={{
        sidebarExpanded,
        setSidebarExpanded,
        toggleSidebar,
        searchActive,
        setSearchActive,
        toggleSearch,
        moreBarVisible,
        setMoreBarVisible,
        toggleMoreBar,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use context
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
