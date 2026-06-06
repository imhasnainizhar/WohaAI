import type { Metadata } from "next";
import "../styles/main.global.css";
import "../styles/theme.style.css";
import "../styles/dist/main.global.css";
import "boxicons/css/boxicons.min.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AppProvider } from "@/providers/AppProvider";
import { LenisProvider } from "@/providers/LenisProvider";

export const metadata: Metadata = {
  title: "WoahGPT",
  icons: {
    icon: "./logos/white_triangle.png",
  },
  description: "By WohaAI Corporation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-w-95 max-w-640 h-screen
      no-underline font-sans tracking-letter-spacing-primary bg-bg-primary
      ">
        <AppProvider>
          <ThemeProvider>
            <LenisProvider>
              <div className="h-full w-full">{children}</div>
            </LenisProvider>
          </ThemeProvider>
        </AppProvider>
      </body>
    </html>
  );
}
