"use client";

import TransitionalLink from "@utils/TransitionalLink";
import { useEffect, useState, useCallback } from "react";
import "@styles/components/layouts/footer.style.css";
import "boxicons/css/boxicons.min.css";
import { useTheme } from "@providers/ThemeProvider";
import Image from "next/image";

export default function Footer() {
  const { darkTheme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const linkItems = [
    { label: "Terms of Service", href: "/terms-of-service" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Shipping & Refund", href: "/" },
    { label: "FAQs", href: "/" },
  ];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 570);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getLinkStyle = useCallback(
    (index: number): React.CSSProperties => {
      const baseColor = darkTheme
        ? "var(--theme-dark-white-primary)"
        : "var(--theme-light-black-primary)";
      const hoverColor = darkTheme
        ? "var(--theme-dark-white-secondary)"
        : "var(--theme-light-black-secondary)";
      const activeColor = "var(--theme-gray-primary)";

      const color =
        activeIndex === index
          ? activeColor
          : hoveredIndex === index
          ? hoverColor
          : baseColor;

      return {
        color,
        textDecoration: "none",
        transition: "color 0.2s ease",
      };
    },
    [hoveredIndex, activeIndex, darkTheme]
  );

  return (
    <footer
      className={`footer-component ${
        darkTheme
          ? "dark-bg-primary dark-text-secondary"
          : "light-bg-primary light-text-secondary"
      }`}
    >
      <div className="footer-body">
        <div className="footer-content">
          {/* Logo */}
          <div className="footer-logo">
            <Image
              src={
                darkTheme
                  ? "/logos/White_triangle.png"
                  : "/logos/Black_Triangle.png"
              }
              alt="Company Logo"
              width={60}
              height={darkTheme ? 50 : 50}
            />
          </div>

          {/* Contact Info */}
          <div className="footer-content-box">
            <address className="footer-contact-box">
              {[
                {
                  icon: "bx-envelope-open",
                  href: "mailto:info@example.com",
                  text: "info@example.com",
                },
                {
                  icon: "bx-phone",
                  href: "tel:+12345678901",
                  text: "+1 (234) 567-8901",
                },
              ].map((item, index) => (
                <div
                  className="footer-link-element footer-contact-links"
                  key={index}
                >
                  <div>
                    <i
                      className={`bx ${item.icon}`}
                      style={{
                        color: darkTheme ? "#fff" : "#000",
                        fontSize: "18px",
                        paddingRight: "10px",
                      }}
                    ></i>
                  </div>
                  <a href={item.href}>{item.text}</a>
                </div>
              ))}
            </address>
          </div>

          {/* Useful Links */}
          <div className="footer-content-box">
            <div className="footer-link-box">
              {linkItems.map((item, index) => {
                const isMobileShipping =
                  isMobile && item.label === "Shipping & Refund";

                return (
                  <TransitionalLink
                    key={index}
                    className={`footer-link-element footer-page-links ${darkTheme ? "dark-text-secondary" : "light-text-secondary"}` }
                    href={item.href}
                    style={getLinkStyle(index)}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => {
                      setHoveredIndex(null);
                      setActiveIndex(null);
                    }}
                    onMouseDown={() => setActiveIndex(index)}
                    onMouseUp={() => setActiveIndex(null)}
                    aria-label={item.label}
                  >
                    {index !== 0 && !isMobileShipping && (
                      <span className="footer-separator">|</span>
                    )}
                    {item.label}
                  </TransitionalLink>
                );
              })}
            </div>
          </div>

          {/* Copyright */}
          <div className="copyright-banner">
            <p>Copyright &copy; 2025 Barlon Inc. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
