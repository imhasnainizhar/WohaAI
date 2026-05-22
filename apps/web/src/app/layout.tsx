import type { Metadata } from "next";
import "@styles/main/main.global.css";
import "@styles/dist/main.global.css";
import "@styles/main/theme.style.css";
import "boxicons/css/boxicons.min.css";
import { ThemeProvider } from "@providers/ThemeProvider";
import { AppProvider } from "@providers/AppProvider";
import { ReactLenis } from "@utils/react-lenis";

export const metadata: Metadata = {
  title: "WoahGPT",
  icons: {
    icon: "./logos/white_triangle.png",
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
