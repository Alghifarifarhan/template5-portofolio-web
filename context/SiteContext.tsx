"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { doc, onSnapshot, setDoc, increment, collection, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatImageUrl } from "@/lib/googleDrive";

export interface SiteSettings {
  logoText: string;
  navCertificateText: string;
  navProjectsText: string;
  navHireText: string;
  heroTitle: string;
  heroBio: string;
  heroPhotoUrl: string;
  heroResumeBtnText: string;
  heroResumeLink: string;
  heroBoxBgColor?: string;
  certificatesPageBadge?: string;
  certificatesPageTitle?: string;
  certificatesPageDesc?: string;
  certificatesHeaderBgColor?: string;
  projectsPageBadge?: string;
  projectsPageTitle?: string;
  projectsPageDesc?: string;
  projectsHeaderBgColor?: string;
  contactTitle: string;
  contactSubtitle: string;
  contactBoxBgColor?: string;
  formspreeUrl: string; // Formspree endpoint URL e.g. 'https://formspree.io/f/YOUR_FORM_ID'
  footerName: string;
  footerCopyright: string;
  footerBgColor?: string;
  // 8 Custom Solid Theme Colors
  bgWebsiteColor: string;
  headerTextColor: string;
  descTextColor: string;
  buttonBgColor: string;
  buttonTextColor: string;
  navTextColor: string;
  navBgColor: string;
  hoverAccentColor: string;
  socialTwitter: string;
  socialFacebook: string;
  socialInstagram: string;
  socialGithub: string;
  socialDribbble: string;
  socialLinkedin: string;
  sampleDataCleared?: boolean;
}

export const defaultSettings: SiteSettings = {
  logoText: "",
  navCertificateText: "",
  navProjectsText: "",
  navHireText: "",
  heroTitle: "",
  heroBio: "",
  heroPhotoUrl: "",
  heroResumeBtnText: "",
  heroResumeLink: "",
  heroBoxBgColor: "",
  certificatesPageBadge: "",
  certificatesPageTitle: "",
  certificatesPageDesc: "",
  certificatesHeaderBgColor: "",
  projectsPageBadge: "",
  projectsPageTitle: "",
  projectsPageDesc: "",
  projectsHeaderBgColor: "",
  contactTitle: "",
  contactSubtitle: "",
  contactBoxBgColor: "",
  formspreeUrl: "",
  footerName: "",
  footerCopyright: "",
  footerBgColor: "",
  bgWebsiteColor: "#09090b",
  headerTextColor: "#ffffff",
  descTextColor: "#a1a1aa",
  buttonBgColor: "#ffffff",
  buttonTextColor: "#09090b",
  navTextColor: "#f4f4f5",
  navBgColor: "#09090bcc",
  hoverAccentColor: "#a855f7",
  socialTwitter: "",
  socialFacebook: "",
  socialInstagram: "",
  socialGithub: "",
  socialDribbble: "",
  socialLinkedin: "",
  sampleDataCleared: true,
};

/**
 * Sanitizes settings to merge clean data.
 */
export function sanitizeSampleSettings(
  current: SiteSettings,
  incoming: Partial<SiteSettings>
): SiteSettings {
  return { ...current, ...incoming, sampleDataCleared: true };
}

export const REALTIME_SYNC_CHANNEL = "portfolio_realtime_sync";

export function broadcastRealtimeUpdate(type: "settings" | "projects" | "certificates" | "all", payload?: any) {
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    try {
      const channel = new BroadcastChannel(REALTIME_SYNC_CHANNEL);
      channel.postMessage({ type, payload, timestamp: Date.now() });
      channel.close();
    } catch (e) {}
  }
}

interface SiteContextType {
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<void>;
  clearAllSampleData: () => Promise<void>;
  recordResumeDownload: () => Promise<void>;
  formattedPhotoUrl: string;
  mounted: boolean;
  settingsLoaded: boolean;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export function SiteProvider({ children }: { children: React.ReactNode }) {
  // Read instant cached settings synchronously on initial execution
  const [settings, setSettings] = useState<SiteSettings>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("portfolio_site_settings");
        if (cached) {
          return { ...defaultSettings, ...JSON.parse(cached) };
        }
      } catch (e) {
        console.warn("Failed to load settings from local cache:", e);
      }
    }
    return defaultSettings;
  });

  const [mounted, setMounted] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(() => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("portfolio_site_settings");
    }
    return false;
  });

  // Client hydration flag
  useEffect(() => {
    setMounted(true);
    // Secondary check if cache was loaded
    if (typeof window !== "undefined" && localStorage.getItem("portfolio_site_settings")) {
      setSettingsLoaded(true);
    }
  }, []);

  // Track site visits automatically in Firestore
  useEffect(() => {
    if (!mounted) return;
    try {
      const isUnique = typeof window !== "undefined" && !sessionStorage.getItem("visited_session");
      if (isUnique && typeof window !== "undefined") {
        sessionStorage.setItem("visited_session", "true");
      }
      const analyticsRef = doc(db, "siteAnalytics", "metrics");
      setDoc(
        analyticsRef,
        {
          totalVisits: increment(1),
          uniqueVisitors: isUnique ? increment(1) : increment(0),
          lastVisit: new Date().toISOString(),
        },
        { merge: true }
      ).catch((e) => console.warn("Analytics track warning:", e));
    } catch (err) {
      console.warn("Analytics error:", err);
    }
  }, [mounted]);

  // Sync with Firestore doc `siteConfig/main` and write to localStorage
  useEffect(() => {
    // Safety fallback timer so UI never hangs even if offline
    const timer = setTimeout(() => {
      setSettingsLoaded(true);
    }, 300);

    try {
      const docRef = doc(db, "siteConfig", "main");
      const unsubscribe = onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as Partial<SiteSettings>;
            setSettings((prev) => {
              const merged = { ...prev, ...data, sampleDataCleared: true };
              try {
                if (typeof window !== "undefined") {
                  localStorage.setItem("portfolio_site_settings", JSON.stringify(merged));
                }
              } catch (e) {}
              return merged;
            });
          }
          setSettingsLoaded(true);
          clearTimeout(timer);
        },
        (error) => {
          console.warn("Firestore snapshot warning (using local cache):", error);
          setSettingsLoaded(true);
          clearTimeout(timer);
        }
      );
      return () => {
        clearTimeout(timer);
        unsubscribe();
      };
    } catch (err) {
      console.warn("Firestore init warning:", err);
      setSettingsLoaded(true);
      clearTimeout(timer);
    }
  }, []);

  // BroadcastChannel multi-tab instant sync listener
  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;
    try {
      const channel = new BroadcastChannel(REALTIME_SYNC_CHANNEL);
      channel.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (type === "settings" || type === "all") {
          if (payload?.settings) {
            setSettings((prev) => {
              const merged = { ...prev, ...payload.settings, sampleDataCleared: true };
              try {
                localStorage.setItem("portfolio_site_settings", JSON.stringify(merged));
              } catch (e) {}
              return merged;
            });
          }
        }
      };
      return () => {
        channel.close();
      };
    } catch (e) {}
  }, []);

  // Apply dynamic solid theme color variables to root document
  useEffect(() => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;

      const bgWebsite = settings.bgWebsiteColor || "#09090b";
      const headerText = settings.headerTextColor || "#ffffff";
      const descText = settings.descTextColor || "#a1a1aa";
      const btnBg = settings.buttonBgColor || "#ffffff";
      const btnText = settings.buttonTextColor || "#09090b";
      const navText = settings.navTextColor || "#f4f4f5";
      const navBg = settings.navBgColor || "#09090bcc";
      const hoverAccent = settings.hoverAccentColor || "#a855f7";

      root.style.setProperty("--site-bg-color", bgWebsite);
      root.style.setProperty("--header-text-color", headerText);
      root.style.setProperty("--desc-text-color", descText);
      root.style.setProperty("--btn-bg-color", btnBg);
      root.style.setProperty("--btn-text-color", btnText);
      root.style.setProperty("--nav-text-color", navText);
      root.style.setProperty("--nav-bg-color", navBg);
      root.style.setProperty("--hover-accent-color", hoverAccent);

      // Support legacy variable mapping for backwards compatibility
      root.style.setProperty("--primary-color", btnBg);
      root.style.setProperty("--accent-color", hoverAccent);
      root.style.setProperty("--button-text-color", btnText);
      root.style.setProperty("--body-text-color", descText);
      root.style.setProperty("--color-yellow-500", hoverAccent);
      root.style.setProperty("--color-purple-600", hoverAccent);
      root.style.setProperty("--color-purple-500", hoverAccent);
      root.style.setProperty("--color-purple-400", hoverAccent);
      root.style.setProperty("--color-purple-300", hoverAccent);
    }
  }, [
    settings.bgWebsiteColor,
    settings.headerTextColor,
    settings.descTextColor,
    settings.buttonBgColor,
    settings.buttonTextColor,
    settings.navTextColor,
    settings.navBgColor,
    settings.hoverAccentColor,
  ]);

  const updateSettings = async (newSettings: Partial<SiteSettings>) => {
    const updated = sanitizeSampleSettings(settings, newSettings);
    setSettings(updated);

    // Write to instant local cache immediately
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("portfolio_site_settings", JSON.stringify(updated));
      }
    } catch (e) {
      console.warn("Failed to write to local storage cache:", e);
    }

    // Broadcast instantaneously across all tabs
    broadcastRealtimeUpdate("settings", { settings: updated });

    try {
      const docRef = doc(db, "siteConfig", "main");
      await setDoc(docRef, updated, { merge: true });
    } catch (err) {
      console.error("Error saving settings to Firestore:", err);
    }
  };

  const recordResumeDownload = async () => {
    try {
      const analyticsRef = doc(db, "siteAnalytics", "metrics");
      await setDoc(
        analyticsRef,
        {
          resumeDownloads: increment(1),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn("Download track error:", e);
    }
  };

  const clearAllSampleData = async () => {
    const clearedSettings: Partial<SiteSettings> = {
      logoText: "",
      navCertificateText: "",
      navProjectsText: "",
      navHireText: "",
      heroTitle: "",
      heroBio: "",
      heroPhotoUrl: "",
      heroResumeBtnText: "",
      heroResumeLink: "",
      certificatesPageBadge: "",
      certificatesPageTitle: "",
      certificatesPageDesc: "",
      projectsPageBadge: "",
      projectsPageTitle: "",
      projectsPageDesc: "",
      contactTitle: "",
      contactSubtitle: "",
      footerName: "",
      socialTwitter: "",
      socialFacebook: "",
      socialInstagram: "",
      socialGithub: "",
      socialDribbble: "",
      socialLinkedin: "",
      sampleDataCleared: true,
    };
    await updateSettings(clearedSettings);

    // Clear local storage caches for projects and certificates
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("portfolio_projects_cache", JSON.stringify([]));
        localStorage.setItem("portfolio_certificates_cache", JSON.stringify([]));
      }
    } catch (e) {}

    // Delete all projects from Firestore collection
    try {
      const projSnap = await getDocs(collection(db, "projects"));
      const deleteProj = projSnap.docs.map((d) => deleteDoc(d.ref));
      await Promise.all(deleteProj);
    } catch (err) {
      console.warn("Error clearing projects collection:", err);
    }

    // Delete all certificates from Firestore collection
    try {
      const certSnap = await getDocs(collection(db, "certificates"));
      const deleteCert = certSnap.docs.map((d) => deleteDoc(d.ref));
      await Promise.all(deleteCert);
    } catch (err) {
      console.warn("Error clearing certificates collection:", err);
    }

    broadcastRealtimeUpdate("all", { settings: clearedSettings });
  };

  const formattedPhotoUrl = formatImageUrl(settings.heroPhotoUrl, "hero");

  return (
    <SiteContext.Provider
      value={{
        settings,
        updateSettings,
        clearAllSampleData,
        recordResumeDownload,
        formattedPhotoUrl,
        mounted,
        settingsLoaded,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error("useSite must be used within a SiteProvider");
  }
  return context;
}

