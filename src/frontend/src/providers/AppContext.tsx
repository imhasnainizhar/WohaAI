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
  mainMenuVisible: boolean
  setMainMenuVisible: (value: boolean) => void
  toggleMainMenu: () => void

  // Settings state
  settingsVisible: boolean;
  setSettingsVisible: (value: boolean) => void;
  toggleSettings: () => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Sidebar expansion state
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(false);

  // Search box active state
  const [searchActive, setSearchActive] = useState<boolean>(false);

  // Morebar active state
  const [mainMenuVisible, setMainMenuVisible] = useState<boolean>(false);

  // Settings state
  const [settingsVisible, setSettingsVisible] = useState<boolean>(false);

  const toggleSidebar = () => setSidebarExpanded((prev) => !prev);
  const toggleSearch = () => setSearchActive((prev) => !prev);
  const toggleMainMenu = () => setMainMenuVisible((prev) => !prev);
  const toggleSettings = () => setSettingsVisible((prev) => !prev);

  return (
    <AppContext.Provider
      value={{
        sidebarExpanded,
        setSidebarExpanded,
        toggleSidebar,
        searchActive,
        setSearchActive,
        toggleSearch,
        mainMenuVisible,
        setMainMenuVisible,
        toggleMainMenu,
        settingsVisible,
        setSettingsVisible,
        toggleSettings,
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
