import type { Metadata } from "next";
import Navbar from "../components/layout/navbar";
import "@styles/theme/main.global.css";
import "@styles/dist/main.global.css";
import "@styles/theme/theme.style.css"
import { ReactLenis } from "@utils/react-lenis";
import PathChecker from "@lib/page-path-checker";
import { ProductDataProvider } from "@providers/ProductDataProvider";
import 'boxicons/css/boxicons.min.css';
import { AuthProvider } from "@providers/AuthProvider"
import About from "@components/layout/about";
import { ThemeProvider } from "@providers/ThemeProvider";

export const metadata: Metadata = {
  title: "Home || Barlon",
  icons: {
    icon: "/favicon.ico",
  },
  description: "By Barlon Corporation.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
    <html lang="en">
      <ThemeProvider>
      <AuthProvider>
      <ProductDataProvider>

        <body className={`app-layout`}>
          <ReactLenis root options={{
            lerp: 0.1,
            touchMultiplier: 1.25,
          }}
          >
            <main className="main-layout">
              <PathChecker />
              <section className="layout-elements">
                <nav className="navigation-bar">
                  <Navbar />
                </nav>
                <section className="app-page-view">
                  {children}
                </section>
              </section>
            </main>
          </ReactLenis>
        </body>
      </ProductDataProvider>
      </AuthProvider>
      </ThemeProvider>
    </html>
  );
}
