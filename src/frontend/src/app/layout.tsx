import type { Metadata } from "next";
import "@styles/theme/main.global.css";
import "@styles/dist/main.global.css";
import "@styles/theme/theme.style.css";
import "boxicons/css/boxicons.min.css";
import { AuthProvider } from "@providers/auth";
import { ThemeProvider } from "@providers/theme";
import { AppProvider } from "@providers/app";
import { ReactLenis } from "@utils/react-lenis";

export const metadata: Metadata = {
  title: "WoahGPT",
  icons: {
    icon: "/favicon.ico",
  },
  description: "By WoahAI Corporation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-w-[380px] max-w-[2560px] h-screen
      no-underline font-sans tracking-letter-spacing-primary bg-bg-primary
      ">
        <AppProvider>
          <ThemeProvider>
            <ReactLenis
              root
              options={{
                lerp: 0.1,
                touchMultiplier: 1.25,
              }}
            >
              <div className="h-full w-full">{children}</div>
            </ReactLenis>
          </ThemeProvider>
        </AppProvider>
      </body>
    </html>
  );
}
