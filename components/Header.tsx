"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSite } from "@/context/SiteContext";

export default function Header() {
  const { settings, settingsLoaded } = useSite();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileMenuMounted, setIsMobileMenuMounted] = useState(false);
  const [isMobileMenuVisible, setIsMobileMenuVisible] = useState(false);

  const openMobileMenu = () => {
    setIsMobileMenuMounted(true);
    setIsMobileMenuOpen(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsMobileMenuVisible(true);
      });
    });
  };

  const closeMobileMenu = () => {
    setIsMobileMenuVisible(false);
    setIsMobileMenuOpen(false);
    setTimeout(() => {
      setIsMobileMenuMounted(false);
    }, 300);
  };

  const toggleMobileMenu = () => {
    if (isMobileMenuOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  };

  // Automatically close menu when navigating routes
  useEffect(() => {
    closeMobileMenu();
  }, [pathname]);

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <header
        id="page-header"
        className="sticky top-0 z-40 flex flex-none items-center justify-between py-3.5 px-4 sm:px-6 w-full max-w-full backdrop-blur-md rounded-2xl my-2 border border-white/10 shadow-sm transition-all duration-200"
        style={{
          backgroundColor: settings.navBgColor || "rgba(9, 9, 11, 0.85)",
          color: settings.navTextColor || "#f4f4f5",
        }}
      >
        <div className="flex items-center gap-2">
          {/* Logo */}
          {settings.logoText ? (
            <Link
              href="/"
              onClick={closeMobileMenu}
              style={{ color: settings.navTextColor || "#f4f4f5" }}
              className="text-2xl font-thin tracking-widest hover:opacity-80 active:opacity-70 transition-opacity duration-200"
            >
              {settings.logoText}
            </Link>
          ) : null}
          {/* END Logo */}
        </div>

        <div className="flex items-center gap-4">
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              style={{
                color: isActive("/")
                  ? settings.hoverAccentColor || "#a855f7"
                  : settings.navTextColor || "#f4f4f5",
              }}
              className={`text-sm font-semibold transition-colors hover:opacity-80 ${
                isActive("/") ? "underline decoration-2 underline-offset-8" : ""
              }`}
            >
              Home
            </Link>
            {settings.navCertificateText ? (
              <Link
                href="/certificates"
                style={{
                  color: isActive("/certificates")
                    ? settings.hoverAccentColor || "#a855f7"
                    : settings.navTextColor || "#f4f4f5",
                }}
                className={`text-sm font-semibold transition-colors hover:opacity-80 ${
                  isActive("/certificates") ? "underline decoration-2 underline-offset-8" : ""
                }`}
              >
                {settings.navCertificateText}
              </Link>
            ) : null}
            {settings.navProjectsText ? (
              <Link
                href="/projects"
                style={{
                  color: isActive("/projects")
                    ? settings.hoverAccentColor || "#a855f7"
                    : settings.navTextColor || "#f4f4f5",
                }}
                className={`text-sm font-semibold transition-colors hover:opacity-80 ${
                  isActive("/projects") ? "underline decoration-2 underline-offset-8" : ""
                }`}
              >
                {settings.navProjectsText}
              </Link>
            ) : null}
            {settings.navHireText ? (
              <a
                href="/#contact"
                style={{ color: settings.navTextColor || "#f4f4f5" }}
                className="text-sm font-semibold hover:opacity-80 transition-colors"
              >
                {settings.navHireText}
              </a>
            ) : null}
          </nav>
          {/* END Desktop Nav */}

          {/* Mobile Hamburger Button (Mobile Handphone Only) */}
          <button
            onClick={toggleMobileMenu}
            type="button"
            aria-label="Toggle Mobile Menu"
            aria-expanded={isMobileMenuOpen}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              color: settings.navTextColor || "#f4f4f5",
            }}
            className="flex md:hidden size-11 items-center justify-center rounded-xl border border-white/10 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <div className={`transition-transform duration-300 ease-out transform ${isMobileMenuOpen ? "rotate-90 scale-100" : "rotate-0 scale-100"}`}>
              {isMobileMenuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </div>
          </button>
        </div>

        {/* Mobile Navigation Dropdown Drawer with load-in and exit animation */}
        {isMobileMenuMounted && (
          <div
            style={{
              backgroundColor: settings.navBgColor || "#09090b",
              color: settings.navTextColor || "#f4f4f5",
            }}
            className={`absolute top-full left-0 right-0 mt-2 z-50 md:hidden rounded-2xl p-5 shadow-2xl border border-white/10 backdrop-blur-xl transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1) transform origin-top ${
              isMobileMenuVisible
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
            }`}
          >
            <nav className="flex flex-col gap-2">
              <Link
                href="/"
                onClick={closeMobileMenu}
                style={{
                  transitionDelay: isMobileMenuVisible ? "50ms" : "0ms",
                  color: isActive("/") ? settings.hoverAccentColor || "#a855f7" : settings.navTextColor || "#f4f4f5",
                }}
                className={`group flex items-center justify-between rounded-xl px-4 py-3 text-base font-semibold transition-all duration-300 ease-out transform hover:bg-white/5 ${
                  isMobileMenuVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"
                } ${isActive("/") ? "bg-white/10" : ""}`}
              >
                <span>Home</span>
                <span className="text-xs opacity-60 group-hover:translate-x-1 transition-transform duration-200">&rarr;</span>
              </Link>
              {settings.navCertificateText ? (
                <Link
                  href="/certificates"
                  onClick={closeMobileMenu}
                  style={{
                    transitionDelay: isMobileMenuVisible ? "100ms" : "0ms",
                    color: isActive("/certificates") ? settings.hoverAccentColor || "#a855f7" : settings.navTextColor || "#f4f4f5",
                  }}
                  className={`group flex items-center justify-between rounded-xl px-4 py-3 text-base font-semibold transition-all duration-300 ease-out transform hover:bg-white/5 ${
                    isMobileMenuVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"
                  } ${isActive("/certificates") ? "bg-white/10" : ""}`}
                >
                  <span>{settings.navCertificateText}</span>
                  <span className="text-xs opacity-60 group-hover:translate-x-1 transition-transform duration-200">&rarr;</span>
                </Link>
              ) : null}
              {settings.navProjectsText ? (
                <Link
                  href="/projects"
                  onClick={closeMobileMenu}
                  style={{
                    transitionDelay: isMobileMenuVisible ? "150ms" : "0ms",
                    color: isActive("/projects") ? settings.hoverAccentColor || "#a855f7" : settings.navTextColor || "#f4f4f5",
                  }}
                  className={`group flex items-center justify-between rounded-xl px-4 py-3 text-base font-semibold transition-all duration-300 ease-out transform hover:bg-white/5 ${
                    isMobileMenuVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"
                  } ${isActive("/projects") ? "bg-white/10" : ""}`}
                >
                  <span>{settings.navProjectsText}</span>
                  <span className="text-xs opacity-60 group-hover:translate-x-1 transition-transform duration-200">&rarr;</span>
                </Link>
              ) : null}
              {settings.navHireText ? (
                <a
                  href="/#contact"
                  onClick={closeMobileMenu}
                  style={{
                    transitionDelay: isMobileMenuVisible ? "200ms" : "0ms",
                    color: settings.navTextColor || "#f4f4f5",
                  }}
                  className={`group flex items-center justify-between rounded-xl px-4 py-3 text-base font-semibold transition-all duration-300 ease-out transform hover:bg-white/5 ${
                    isMobileMenuVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"
                  }`}
                >
                  <span>{settings.navHireText}</span>
                  <span className="text-xs opacity-60 group-hover:translate-x-1 transition-transform duration-200">&rarr;</span>
                </a>
              ) : null}
            </nav>
          </div>
        )}
      </header>

      {/* Backdrop overlay when mobile menu is open with fade transition */}
      {isMobileMenuMounted && (
        <div
          onClick={closeMobileMenu}
          aria-hidden="true"
          className={`fixed inset-0 bg-black/40 backdrop-blur-xs z-20 md:hidden transition-opacity duration-300 ease-out ${
            isMobileMenuVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        />
      )}
    </>
  );
}

