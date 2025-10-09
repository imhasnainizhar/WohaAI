import type { Metadata } from "next";
import "@styles/theme/main.global.css";
import "@styles/dist/main.global.css";
import "@styles/theme/theme.style.css";
import "boxicons/css/boxicons.min.css";
import { AuthProvider } from "@providers/AuthProvider";
import { ThemeProvider } from "@providers/ThemeProvider";
import { AppProvider } from "@providers/AppContext";

export const metadata: Metadata = {
  title: "WoahGPT",
  icons: {
    icon: "/favicon.ico",
  },
  description: "By Barlon Corporation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <AppProvider>
      <ThemeProvider>
        <AuthProvider>
          <body className="min-w-[380px] max-w-[2560px] no-underline font-montserrat-sans tracking-letter-spacing-primary shadow-[0_0_50px_0_var(--theme-color-boxShadow-dark)]">
            {children}
          </body>
        </AuthProvider>
      </ThemeProvider>
      </AppProvider>
    </html>
  );
}
