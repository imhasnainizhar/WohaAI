"use client";

import { useMinWidth } from "@/hooks/useMinWidth";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

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

  // Signin comp state
  signin: boolean;
  setSignin: (value: boolean) => void;
  toggleSignin: () => void;

  // Can go back state
  canGoBack: boolean;

  // Device layout
  isSmallDevice: boolean;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Sidebar expansion state
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(false);

  // Signin comp state
  const [signin, setSignin] = useState<boolean>(false)

  // Search box active state
  const [searchActive, setSearchActive] = useState<boolean>(false);

  // Morebar active state
  const [mainMenuVisible, setMainMenuVisible] = useState<boolean>(false);

  // Settings state
  const [settingsVisible, setSettingsVisible] = useState<boolean>(false);

  // Device layout state
  const [isSmallDevice, setIsSmallDevice] = useState<boolean>(false);

  const toggleSidebar = () => setSidebarExpanded((prev) => !prev);
  const toggleSearch = () => setSearchActive((prev) => !prev);
  const toggleMainMenu = () => setMainMenuVisible((prev) => !prev);
  const toggleSettings = () => setSettingsVisible((prev) => !prev);
  const toggleSignin = () => setSignin((prev) => !prev);


  const [canGoBack, setCanGoBack] = useState(false)

  useEffect(() => {
    const ref = document.referrer
    const origin = window.location.origin

    if (ref && ref.startsWith(origin)) {
      setCanGoBack(true)
    }
  }, [])

  const isSmallSevice = !useMinWidth(1024)

  useEffect(() => {
    setIsSmallDevice(isSmallSevice)
  }, [isSmallSevice])


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
        signin,
        setSignin,
        toggleSignin,
        canGoBack,
        isSmallDevice
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
