"use client";

import { useEffect, useState, useRef } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  User,
} from "firebase/auth";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useSite, defaultSettings, broadcastRealtimeUpdate } from "@/context/SiteContext";
import { formatImageUrl } from "@/lib/googleDrive";
import { projectsData, Project } from "@/data/projects";
import { certificatesData, Certificate } from "@/data/certificates";
import Link from "next/link";

interface SolidThemePreset {
  id: string;
  name: string;
  bgWebsiteColor: string;
  headerTextColor: string;
  descTextColor: string;
  buttonBgColor: string;
  buttonTextColor: string;
  navTextColor: string;
  navBgColor: string;
  hoverAccentColor: string;
  desc: string;
}

const solidThemePresets: SolidThemePreset[] = [
  {
    id: "preset-dark-obsidian",
    name: "Dark Obsidian (Bawaan)",
    bgWebsiteColor: "#09090b",
    headerTextColor: "#ffffff",
    descTextColor: "#a1a1aa",
    buttonBgColor: "#ffffff",
    buttonTextColor: "#09090b",
    navTextColor: "#f4f4f5",
    navBgColor: "#09090bcc",
    hoverAccentColor: "#a855f7",
    desc: "Tema gelap modern premium dengan teks putih tajam dan aksen ungu futuristik.",
  },
  {
    id: "preset-clean-white",
    name: "Pure Clean Minimal",
    bgWebsiteColor: "#f8fafc",
    headerTextColor: "#0f172a",
    descTextColor: "#475569",
    buttonBgColor: "#0f172a",
    buttonTextColor: "#ffffff",
    navTextColor: "#0f172a",
    navBgColor: "#ffffffcc",
    hoverAccentColor: "#2563eb",
    desc: "Tema terang bersih minimalis dengan kontras tinggi untuk portofolio profesional.",
  },
  {
    id: "preset-cyber-midnight",
    name: "Cyber Midnight",
    bgWebsiteColor: "#020617",
    headerTextColor: "#38bdf8",
    descTextColor: "#94a3b8",
    buttonBgColor: "#06b6d4",
    buttonTextColor: "#082f49",
    navTextColor: "#e2e8f0",
    navBgColor: "#020617cc",
    hoverAccentColor: "#06b6d4",
    desc: "Gaya visual cybernetic dengan aksen biru cyan cerah yang tajam dan dinamis.",
  },
  {
    id: "preset-emerald-matrix",
    name: "Emerald Deep Forest",
    bgWebsiteColor: "#022c22",
    headerTextColor: "#6ee7b7",
    descTextColor: "#a7f3d0",
    buttonBgColor: "#10b981",
    buttonTextColor: "#022c22",
    navTextColor: "#ecfdf5",
    navBgColor: "#064e3bcc",
    hoverAccentColor: "#34d399",
    desc: "Nuansa hijau zamrud mendalam yang sejuk dan menenangkan khas teknologi modern.",
  },
  {
    id: "preset-royal-purple",
    name: "Royal Purple Velvet",
    bgWebsiteColor: "#180d2b",
    headerTextColor: "#f3e8ff",
    descTextColor: "#d8b4fe",
    buttonBgColor: "#c084fc",
    buttonTextColor: "#1e1035",
    navTextColor: "#f3e8ff",
    navBgColor: "#1e1035cc",
    hoverAccentColor: "#e879f9",
    desc: "Palet ungu mewah berkelas dengan estetika elegan untuk desainer kreatif.",
  },
  {
    id: "preset-warm-amber",
    name: "Warm Charcoal & Amber",
    bgWebsiteColor: "#1c1917",
    headerTextColor: "#fbbf24",
    descTextColor: "#d6d3d1",
    buttonBgColor: "#f59e0b",
    buttonTextColor: "#1c1917",
    navTextColor: "#fafaf9",
    navBgColor: "#292524cc",
    hoverAccentColor: "#f59e0b",
    desc: "Kombinasi arang hangat dengan sentuhan emas amber yang ramah dan menonjol.",
  },
];

const solidBoxColorPresets = [
  { name: "Default Box", color: "#18181b" },
  { name: "Deep Obsidian", color: "#09090b" },
  { name: "Slate Charcoal", color: "#1e293b" },
  { name: "Warm Coffee", color: "#27272a" },
  { name: "Midnight Navy", color: "#0f172a" },
  { name: "Dark Emerald", color: "#064e3b" },
  { name: "Royal Purple", color: "#1e1b4b" },
  { name: "Light Card", color: "#f4f4f5" },
  { name: "Bawaan", color: "" },
];

export default function AdminPage() {
  const {
    settings,
    updateSettings,
    clearAllSampleData,
    mounted,
  } = useSite();

  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // Active Admin Tabs (Default to stats)
  const [activeTab, setActiveTab] = useState<
    "stats" | "theme" | "text" | "photo" | "certificates" | "projects" | "social" | "settings"
  >("stats");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isClearingData, setIsClearingData] = useState(false);
  const [isSavingSidebar, setIsSavingSidebar] = useState(false);
  const [isExportingJSON, setIsExportingJSON] = useState(false);
  const [isImportingJSON, setIsImportingJSON] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Local copy of editable text settings
  const [textForm, setTextForm] = useState(settings);

  // Helper function: Sort items so newest (highest createdAt or latest timestamp) is always first
  const sortNewestFirst = <T extends { createdAt?: number; id?: string }>(items: T[]): T[] => {
    return [...items].sort((a, b) => {
      const timeA =
        a.createdAt ||
        (typeof a.id === "string" && (a.id.startsWith("proj_") || a.id.startsWith("cert_"))
          ? parseInt(a.id.split("_")[1]) || 0
          : 0);
      const timeB =
        b.createdAt ||
        (typeof b.id === "string" && (b.id.startsWith("proj_") || b.id.startsWith("cert_"))
          ? parseInt(b.id.split("_")[1]) || 0
          : 0);
      return timeB - timeA;
    });
  };

  // Dynamic projects & certificates from Firestore / local cache (sorted newest first)
  const [projectsList, setProjectsList] = useState<Project[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("portfolio_projects_cache");
        if (cached) return sortNewestFirst(JSON.parse(cached));
      } catch (e) {}
    }
    return [];
  });
  const [certificatesList, setCertificatesList] = useState<Certificate[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("portfolio_certificates_cache");
        if (cached) return sortNewestFirst(JSON.parse(cached));
      } catch (e) {}
    }
    return [];
  });

  // Analytics Metrics state from Firestore siteAnalytics/metrics
  const [metrics, setMetrics] = useState<{
    totalVisits: number;
    uniqueVisitors: number;
    resumeDownloads: number;
    lastVisit?: string;
  }>({
    totalVisits: 0,
    uniqueVisitors: 0,
    resumeDownloads: 0,
  });

  // Project form modal/editing state
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  // Certificate form modal/editing state
  const [editingCert, setEditingCert] = useState<Partial<Certificate> | null>(null);

  useEffect(() => {
    try {
      const unsub = onSnapshot(doc(db, "siteAnalytics", "metrics"), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setMetrics({
            totalVisits: data.totalVisits || 0,
            uniqueVisitors: data.uniqueVisitors || 0,
            resumeDownloads: data.resumeDownloads || 0,
            lastVisit: data.lastVisit || undefined,
          });
        }
      });
      return () => unsub();
    } catch (e) {
      console.warn("Analytics metrics sync error:", e);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setTextForm(settings);
  }, [settings]);

  // Sync projects from Firestore (sorted newest first)
  useEffect(() => {
    try {
      const projCol = collection(db, "projects");
      const unsub = onSnapshot(projCol, (snapshot) => {
        if (!snapshot.empty) {
          const list: Project[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...docSnap.data() } as Project);
          });
          const sorted = sortNewestFirst(list);
          setProjectsList(sorted);
          try {
            if (typeof window !== "undefined") {
              localStorage.setItem("portfolio_projects_cache", JSON.stringify(sorted));
            }
          } catch (e) {}
        } else {
          setProjectsList([]);
          try {
            if (typeof window !== "undefined") {
              localStorage.setItem("portfolio_projects_cache", JSON.stringify([]));
            }
          } catch (e) {}
        }
      });
      return () => unsub();
    } catch (e) {
      console.warn("Projects sync fallback:", e);
    }
  }, []);

  // Sync certificates from Firestore (sorted newest first)
  useEffect(() => {
    try {
      const certCol = collection(db, "certificates");
      const unsub = onSnapshot(certCol, (snapshot) => {
        if (!snapshot.empty) {
          const list: Certificate[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...docSnap.data() } as Certificate);
          });
          const sorted = sortNewestFirst(list);
          setCertificatesList(sorted);
          try {
            if (typeof window !== "undefined") {
              localStorage.setItem("portfolio_certificates_cache", JSON.stringify(sorted));
            }
          } catch (e) {}
        } else {
          setCertificatesList([]);
          try {
            if (typeof window !== "undefined") {
              localStorage.setItem("portfolio_certificates_cache", JSON.stringify([]));
            }
          } catch (e) {}
        }
      });
      return () => unsub();
    } catch (e) {
      console.warn("Certificates sync fallback:", e);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsSubmittingLogin(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setLoginError(err.message || "Failed to sign in with provided credentials.");
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleSaveTextSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      ...textForm,
      sampleDataCleared: true,
    });
    setSaveStatus("Settings saved & sample data cleaned successfully!");
    setTimeout(() => setSaveStatus(null), 3000);
  };

  // Quick Save from Sidebar
  const handleSaveSidebarUpdate = async () => {
    setIsSavingSidebar(true);
    try {
      await updateSettings({
        ...textForm,
        sampleDataCleared: true,
      });
      setSaveStatus("Semua perubahan berhasil disimpan & disinkronkan ke website secara real-time!");
      setTimeout(() => setSaveStatus(null), 3500);
    } catch (err: any) {
      console.error("Sidebar save error:", err);
      setSaveStatus("Gagal menyimpan perubahan. Periksa koneksi Firestore.");
      setTimeout(() => setSaveStatus(null), 3500);
    } finally {
      setIsSavingSidebar(false);
    }
  };

  // Export database.json from Firestore
  const handleExportDatabaseJSON = async () => {
    setIsExportingJSON(true);
    try {
      const siteDocSnap = await getDoc(doc(db, "siteConfig", "main"));
      const currentSettings = siteDocSnap.exists() ? siteDocSnap.data() : settings;

      const projSnap = await getDocs(collection(db, "projects"));
      const currentProjects = projSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const certSnap = await getDocs(collection(db, "certificates"));
      const currentCerts = certSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const exportPayload = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        settings: currentSettings,
        projects: sortNewestFirst(currentProjects as Project[]),
        certificates: sortNewestFirst(currentCerts as Certificate[]),
      };

      const jsonStr = JSON.stringify(exportPayload, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "database.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSaveStatus("database.json berhasil di-download!");
      setTimeout(() => setSaveStatus(null), 4000);
    } catch (err) {
      console.error("Export database error:", err);
      alert("Gagal mendownload database.json. Periksa koneksi Firestore.");
    } finally {
      setIsExportingJSON(false);
    }
  };

  // Import database.json to Firestore
  const handleImportDatabaseJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImportingJSON(true);
    try {
      const text = await file.text();
      let json: any;
      try {
        json = JSON.parse(text);
      } catch (parseErr) {
        alert("File yang diupload bukan file JSON yang valid!");
        setIsImportingJSON(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      const importedSettings = json.settings || json.siteSettings || null;
      const importedProjects: Project[] = Array.isArray(json.projects) ? json.projects : [];
      const importedCertificates: Certificate[] = Array.isArray(json.certificates) ? json.certificates : [];

      const confirmMsg =
        `Apakah Anda yakin ingin mengimpor database ini ke Firestore?\n\n` +
        `Rincian data dalam file database.json:\n` +
        `- Konfigurasi Pengaturan & Tema: ${importedSettings ? "Ditemukan" : "Tidak ada"}\n` +
        `- Jumlah Proyek: ${importedProjects.length} proyek\n` +
        `- Jumlah Sertifikat: ${importedCertificates.length} sertifikat\n\n` +
        `Data di Firestore akan diperbarui dan disinkronkan secara real-time ke website.`;

      if (!window.confirm(confirmMsg)) {
        setIsImportingJSON(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      // 1. Update settings if present
      if (importedSettings) {
        await updateSettings({
          ...importedSettings,
          sampleDataCleared: true,
        });
        setTextForm((prev) => ({ ...prev, ...importedSettings, sampleDataCleared: true }));
      }

      // 2. Upload projects
      if (importedProjects.length > 0) {
        for (const proj of importedProjects) {
          const id = proj.id || `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          await setDoc(doc(db, "projects", id), {
            ...proj,
            id,
            createdAt: proj.createdAt || Date.now(),
          });
        }
        const sortedProjs = sortNewestFirst(importedProjects);
        setProjectsList(sortedProjs);
        try {
          localStorage.setItem("portfolio_projects_cache", JSON.stringify(sortedProjs));
        } catch (e) {}
      }

      // 3. Upload certificates
      if (importedCertificates.length > 0) {
        for (const cert of importedCertificates) {
          const id = cert.id || `cert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          await setDoc(doc(db, "certificates", id), {
            ...cert,
            id,
            createdAt: cert.createdAt || Date.now(),
          });
        }
        const sortedCerts = sortNewestFirst(importedCertificates);
        setCertificatesList(sortedCerts);
        try {
          localStorage.setItem("portfolio_certificates_cache", JSON.stringify(sortedCerts));
        } catch (e) {}
      }

      // Broadcast sync
      broadcastRealtimeUpdate("all", {
        settings: importedSettings || undefined,
      });

      setSaveStatus(
        `Database berhasil diimpor! Total ${importedProjects.length} proyek dan ${importedCertificates.length} sertifikat berhasil dipulihkan.`
      );
      setTimeout(() => setSaveStatus(null), 4000);
    } catch (err: any) {
      console.error("Import database error:", err);
      alert("Terjadi kesalahan saat mengimpor database.json: " + (err.message || err));
    } finally {
      setIsImportingJSON(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: "error", message: "New password and confirmation do not match." });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordStatus({ type: "error", message: "New password must be at least 6 characters long." });
      return;
    }

    if (!user || !user.email) return;

    setIsSubmittingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setPasswordStatus({ type: "success", message: "Password updated successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error("Password update error:", err);
      setPasswordStatus({
        type: "error",
        message: err.message || "Failed to update password. Please check your current password.",
      });
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject?.title) return;
    const projId = editingProject.id || `proj_${Date.now()}`;

    // Parse highlights (Key Deliverables) if entered as multiline string or array
    let highlightsArray: string[] = [];
    if (Array.isArray(editingProject.highlights)) {
      highlightsArray = editingProject.highlights.map((h) => h.trim()).filter(Boolean);
    } else if (typeof editingProject.highlights === "string") {
      highlightsArray = (editingProject.highlights as string).split("\n").map((h) => h.trim()).filter(Boolean);
    }

    // Parse tools (Tools & Software) if entered as comma-separated string or array
    let toolsArray: string[] = [];
    if (Array.isArray(editingProject.tools)) {
      toolsArray = editingProject.tools.map((t) => t.trim()).filter(Boolean);
    } else if (typeof editingProject.tools === "string") {
      toolsArray = (editingProject.tools as string).split(",").map((t) => t.trim()).filter(Boolean);
    }

    const now = Date.now();
    const projectToSave: Project = {
      id: projId,
      title: editingProject.title || "Untitled Project",
      subtitle: editingProject.subtitle || "",
      image: editingProject.image || "",
      category: editingProject.category || "",
      client: editingProject.client || "",
      date: editingProject.date || "",
      tools: toolsArray,
      description: editingProject.description || "",
      highlights: highlightsArray,
      link: editingProject.link || "",
      linkText: editingProject.linkText || "",
      boxBgColor: editingProject.boxBgColor || "",
      createdAt: editingProject.createdAt || now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, "projects", projId), projectToSave);
      if (!settings.sampleDataCleared) {
        await updateSettings({ sampleDataCleared: true });
      }
      setEditingProject(null);
      broadcastRealtimeUpdate("projects");
      setSaveStatus("Project saved!");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      console.error("Failed to save project:", err);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteDoc(doc(db, "projects", id));
        broadcastRealtimeUpdate("projects");
        setProjectsList((prev) => {
          const next = prev.filter((p) => p.id !== id);
          try {
            if (typeof window !== "undefined") {
              localStorage.setItem("portfolio_projects_cache", JSON.stringify(next));
            }
          } catch (e) {}
          return next;
        });
      } catch (err) {
        console.error("Failed to delete project:", err);
      }
    }
  };

  const handleClearAllProjects = async () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus SEMUA proyek di daftar?")) {
      try {
        const projSnap = await getDocs(collection(db, "projects"));
        const deletePromises = projSnap.docs.map((d) => deleteDoc(d.ref));
        await Promise.all(deletePromises);
        await updateSettings({ sampleDataCleared: true });
        setProjectsList([]);
        broadcastRealtimeUpdate("projects");
        try {
          if (typeof window !== "undefined") {
            localStorage.setItem("portfolio_projects_cache", JSON.stringify([]));
          }
        } catch (e) {}
        setSaveStatus("Semua proyek berhasil dibersihkan!");
        setTimeout(() => setSaveStatus(null), 3000);
      } catch (err) {
        console.error("Failed to clear all projects:", err);
      }
    }
  };

  const handleSaveCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCert?.title) return;
    const certId = editingCert.id || `cert_${Date.now()}`;
    const now = Date.now();
    const certToSave: Certificate = {
      id: certId,
      title: editingCert.title || "Untitled Certificate",
      issuer: editingCert.issuer || "Organization",
      date: editingCert.date || "",
      credentialId: editingCert.credentialId || "",
      category: editingCert.category || "",
      description: editingCert.description || "",
      skills: editingCert.skills || [],
      iconColor: editingCert.iconColor || "from-purple-500 to-indigo-500",
      image: editingCert.image || "",
      boxBgColor: editingCert.boxBgColor || "",
      createdAt: editingCert.createdAt || now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, "certificates", certId), certToSave);
      if (!settings.sampleDataCleared) {
        await updateSettings({ sampleDataCleared: true });
      }
      setEditingCert(null);
      broadcastRealtimeUpdate("certificates");
      setSaveStatus("Certificate saved!");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      console.error("Failed to save certificate:", err);
    }
  };

  const handleDeleteCertificate = async (id: string) => {
    if (confirm("Are you sure you want to delete this certificate?")) {
      try {
        await deleteDoc(doc(db, "certificates", id));
        broadcastRealtimeUpdate("certificates");
        setCertificatesList((prev) => {
          const next = prev.filter((c) => c.id !== id);
          try {
            if (typeof window !== "undefined") {
              localStorage.setItem("portfolio_certificates_cache", JSON.stringify(next));
            }
          } catch (e) {}
          return next;
        });
      } catch (err) {
        console.error("Failed to delete certificate:", err);
      }
    }
  };

  const handleClearAllCertificates = async () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus SEMUA sertifikat di daftar?")) {
      try {
        const certSnap = await getDocs(collection(db, "certificates"));
        const deletePromises = certSnap.docs.map((d) => deleteDoc(d.ref));
        await Promise.all(deletePromises);
        await updateSettings({ sampleDataCleared: true });
        setCertificatesList([]);
        broadcastRealtimeUpdate("certificates");
        try {
          if (typeof window !== "undefined") {
            localStorage.setItem("portfolio_certificates_cache", JSON.stringify([]));
          }
        } catch (e) {}
        setSaveStatus("Semua sertifikat berhasil dibersihkan!");
        setTimeout(() => setSaveStatus(null), 3000);
      } catch (err) {
        console.error("Failed to clear all certificates:", err);
      }
    }
  };

  const handleClearSampleData = async () => {
    const confirmMsg =
      "Apakah Anda yakin ingin membersihkan SEMUA data contoh bawaan template?\n\n" +
      "Tindakan ini akan:\n" +
      "1. Mengosongkan teks contoh (nama logo, teks menu navbar, bio hero, kontak, dsb).\n" +
      "2. Mengosongkan link foto hero contoh.\n" +
      "3. Menghapus semua proyek contoh bawaan.\n" +
      "4. Menghapus semua sertifikat contoh bawaan.\n\n" +
      "Website akan menjadi bersih dan hanya menampilkan data asli yang Anda input.";

    if (window.confirm(confirmMsg)) {
      setIsClearingData(true);
      try {
        await clearAllSampleData();
        setProjectsList([]);
        setCertificatesList([]);
        setTextForm({
          ...settings,
          logoText: "",
          navCertificateText: "",
          navProjectsText: "",
          navHireText: "",
          heroTitle: "",
          heroBio: "",
          heroPhotoUrl: "",
          heroResumeBtnText: "",
          heroResumeLink: "",
          contactTitle: "",
          contactSubtitle: "",
          footerName: "",
          socialTwitter: "",
          socialFacebook: "",
          socialInstagram: "",
          socialGithub: "",
          socialDribbble: "",
          sampleDataCleared: true,
        });
        setSaveStatus("Semua data contoh (teks navbar, logo, bio, foto hero, proyek & sertifikat) berhasil dibersihkan!");
        setTimeout(() => setSaveStatus(null), 4000);
      } catch (err) {
        console.error("Error clearing sample data:", err);
      } finally {
        setIsClearingData(false);
      }
    }
  };

  if (loadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="flex items-center gap-3">
          <div className="size-5 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
          <span className="text-sm font-medium">Loading Admin Panel...</span>
        </div>
      </div>
    );
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 focus:outline-hidden transition-colors";

  // --- UNAUTHENTICATED: LOGIN VIEW ---
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-8 max-w-full overflow-x-hidden text-white">
        <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8 shadow-2xl">
          <div className="text-center">
            <Link
              href="/"
              className="text-2xl font-thin tracking-widest text-white hover:text-purple-400 transition-colors"
            >
              {settings.logoText || "Portfolio"}
            </Link>
            <h1 className="mt-4 text-xl font-bold text-white">
              Admin Authentication
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Enter your Firebase Email & Password to access the website management dashboard.
            </p>
          </div>

          {loginError && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Contoh: admin@portfolio.com"
                className="mt-1 block w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contoh: Masukkan password akun admin Anda"
                  className="block w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 pr-11 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-400 hover:text-zinc-200 focus:outline-hidden cursor-pointer"
                  title={showLoginPassword ? "Sembunyikan Password" : "Tampilkan Password"}
                >
                  {showLoginPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.04 10.04 0 013.122-.463c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m-6.115-3.486a3 3 0 11-4.243-4.243m4.243 4.243L3 3l18 18" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmittingLogin}
              className="w-full rounded-lg bg-purple-700 hover:bg-purple-600 py-3 text-sm font-semibold text-white shadow-md disabled:opacity-50 cursor-pointer transition-colors"
            >
              {isSubmittingLogin ? "Signing in..." : "Sign In to Admin"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-xs text-zinc-400 hover:text-white transition-colors"
            >
              &larr; Back to Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- AUTHENTICATED: ADMIN DASHBOARD VIEW ---
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col md:flex-row">
      {/* --- DESKTOP SIDEBAR (Mode PC: md and above) --- */}
      <aside className="hidden md:flex md:w-64 lg:w-72 flex-col justify-between shrink-0 border-r border-zinc-800 bg-zinc-900/80 min-h-screen sticky top-0 h-screen overflow-y-auto p-4 lg:p-5 backdrop-blur-md z-40">
        <div className="space-y-5">
          {/* Logo & Brand Header */}
          <div className="flex items-center justify-between px-1">
            <Link
              href="/"
              className="text-xl font-thin tracking-widest text-white hover:text-purple-400 transition-colors"
            >
              {settings.logoText || "Portfolio"}{" "}
              <span className="rounded-md border border-purple-500/40 bg-purple-950/60 px-2 py-0.5 text-xs font-sans font-semibold text-purple-400">
                ADMIN
              </span>
            </Link>
          </div>

          {/* Action Buttons on Sidebar (Save, Clear Sample, Lihat Web) */}
          <div className="space-y-2 pt-1">
            {/* Button 1: Save Update */}
            <button
              type="button"
              onClick={handleSaveSidebarUpdate}
              disabled={isSavingSidebar}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-purple-700 hover:bg-purple-600 disabled:opacity-50 px-4 py-2.5 text-xs font-bold text-white transition-all shadow-md shadow-purple-950/50 cursor-pointer active:scale-98"
            >
              {isSavingSidebar ? (
                <>
                  <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>

            {/* Button 2: Hapus Semua Data Contoh */}
            <button
              type="button"
              onClick={handleClearSampleData}
              disabled={isClearingData}
              className="flex items-center justify-center gap-2 w-full rounded-xl border border-red-500/30 bg-red-950/40 hover:bg-red-900/60 disabled:opacity-50 px-4 py-2 text-xs font-semibold text-red-300 hover:text-white transition-all cursor-pointer active:scale-98"
              title="Hapus seluruh data contoh awal saat hosting"
            >
              {isClearingData ? (
                <>
                  <span className="size-3.5 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                  <span>Membersihkan...</span>
                </>
              ) : (
                <>
                  <span>🧹</span>
                  <span>Hapus Data Contoh</span>
                </>
              )}
            </button>

            {/* Button 3: Lihat Website */}
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full rounded-xl border border-zinc-800 bg-zinc-800/80 hover:bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 hover:text-white transition-all shadow-xs group cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-3.5 group-hover:scale-110 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              <span>Lihat Website</span>
            </Link>
          </div>

          {/* Vertical Menu Navigation (Sidebar) */}
          <nav className="space-y-1">
            <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-2">
              Menu Pengaturan
            </span>
            {[
              { id: "stats", label: "Statistik Website", icon: "📊" },
              { id: "theme", label: "Theme & Colors", icon: "🎨" },
              { id: "text", label: "Navigation & Text", icon: "📝" },
              { id: "photo", label: "Hero Photo & Drive", icon: "🖼️" },
              { id: "certificates", label: "Certificates Manager", icon: "📜" },
              { id: "projects", label: "Project Manager", icon: "💼" },
              { id: "social", label: "Social Links", icon: "🌐" },
              { id: "settings", label: "Settings & Password", icon: "⚙️" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold cursor-pointer transition-all duration-150 text-left ${
                    isActive
                      ? "bg-purple-700 text-white font-bold shadow-md shadow-purple-950/50 translate-x-0.5"
                      : "text-zinc-400 hover:bg-zinc-800/80 hover:text-white"
                  }`}
                >
                  <span className="text-sm shrink-0">{tab.icon}</span>
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-zinc-800/80 space-y-3">
          <div className="px-2">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 block">
              Akun Login
            </span>
            <strong className="text-xs text-zinc-300 truncate block mt-0.5" title={user.email || ""}>
              {user.email}
            </strong>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-800 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 cursor-pointer transition-colors"
            >
              <span>🌐 Lihat Web</span>
            </Link>
            <button
              onClick={handleLogout}
              type="button"
              className="rounded-lg bg-red-950/60 px-3 py-1.5 text-xs font-semibold text-red-400 border border-red-500/30 hover:bg-red-900 cursor-pointer transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* --- MOBILE TOPBAR & MAIN CONTENT WRAPPER --- */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-900/90 px-4 py-3 sm:px-6 backdrop-blur-md md:hidden">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-lg font-thin tracking-widest text-white hover:text-purple-400 transition-colors"
            >
              {settings.logoText || "Portfolio"}{" "}
              <span className="rounded-md border border-purple-500/40 bg-purple-950/60 px-1.5 py-0.5 text-[10px] font-sans font-semibold text-purple-400">
                ADMIN
              </span>
            </Link>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleSaveSidebarUpdate}
                disabled={isSavingSidebar}
                className="flex items-center gap-1 rounded-lg bg-purple-700 hover:bg-purple-600 disabled:opacity-50 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs cursor-pointer active:scale-95"
                title="Simpan Perubahan ke Website"
              >
                {isSavingSidebar ? (
                  <span className="size-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <span>💾</span>
                )}
                <span>Simpan</span>
              </button>

              <button
                type="button"
                onClick={handleClearSampleData}
                disabled={isClearingData}
                className="flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-950/60 hover:bg-red-900/80 disabled:opacity-50 px-2 py-1 text-[11px] font-semibold text-red-300 cursor-pointer active:scale-95"
                title="Hapus Semua Data Contoh"
              >
                <span>🧹</span>
              </button>

              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-800 px-2 py-1 text-[11px] font-semibold text-zinc-200"
                title="Lihat Website"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </Link>
              <button
                onClick={handleLogout}
                type="button"
                className="rounded-lg bg-red-950/60 px-2 py-1 text-[11px] font-semibold text-red-400 border border-red-500/30 hover:bg-red-900"
              >
                Exit
              </button>
            </div>
          </div>

          {/* Horizontal Mobile Tabs */}
          <div className="w-full overflow-x-auto scrollbar-none flex flex-nowrap gap-1.5 pt-3 pb-1 border-t border-zinc-800 mt-2.5">
            {[
              { id: "stats", label: "📊 Stats" },
              { id: "theme", label: "Theme & Colors" },
              { id: "text", label: "Navigation & Text" },
              { id: "photo", label: "Hero Photo & Drive" },
              { id: "certificates", label: "Certificates" },
              { id: "projects", label: "Project Manager" },
              { id: "social", label: "Social Links" },
              { id: "settings", label: "Settings & Password" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`whitespace-nowrap shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-semibold cursor-pointer transition-colors ${
                  activeTab === tab.id
                    ? "bg-purple-700 text-white font-bold shadow-xs"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full min-w-0 overflow-x-hidden">
          {saveStatus && (
            <div className="mb-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400 font-semibold">
              ✓ {saveStatus}
            </div>
          )}

          {/* TAB 1: TEXT & NAVIGATION MANAGER */}
          {activeTab === "text" && (
          <form onSubmit={handleSaveTextSettings} className="mt-6 space-y-6">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6 space-y-4">
              <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                Brand & Navigation Menu Text
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs text-zinc-400">Logo Name</label>
                  <input
                    type="text"
                    value={textForm.logoText}
                    onChange={(e) => setTextForm({ ...textForm, logoText: e.target.value })}
                    placeholder="Contoh: John Doe / Studio Digital"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400">Nav Link 1 (Certificate)</label>
                  <input
                    type="text"
                    value={textForm.navCertificateText}
                    onChange={(e) => setTextForm({ ...textForm, navCertificateText: e.target.value })}
                    placeholder="Contoh: Certificate / Sertifikat"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400">Nav Link 2 (Projects)</label>
                  <input
                    type="text"
                    value={textForm.navProjectsText}
                    onChange={(e) => setTextForm({ ...textForm, navProjectsText: e.target.value })}
                    placeholder="Contoh: Projects / Proyek"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400">Nav Link 3 (Hire Me)</label>
                  <input
                    type="text"
                    value={textForm.navHireText}
                    onChange={(e) => setTextForm({ ...textForm, navHireText: e.target.value })}
                    placeholder="Contoh: Hire me / Hubungi Saya"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6 space-y-4">
              <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                Hero & Resume Section
              </h2>
              <div>
                <label className="block text-xs text-zinc-400">Hero Main Heading</label>
                <input
                  type="text"
                  value={textForm.heroTitle}
                  onChange={(e) => setTextForm({ ...textForm, heroTitle: e.target.value })}
                  placeholder="Contoh: Hi there, I'm John Doe 👋"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400">Hero Biography Text</label>
                <textarea
                  rows={3}
                  value={textForm.heroBio}
                  onChange={(e) => setTextForm({ ...textForm, heroBio: e.target.value })}
                  placeholder="Contoh: Fullstack Web Developer yang berfokus pada performa, skalabilitas, dan pengalaman pengguna modern..."
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs text-zinc-400">Resume Button Label</label>
                  <input
                    type="text"
                    value={textForm.heroResumeBtnText}
                    onChange={(e) => setTextForm({ ...textForm, heroResumeBtnText: e.target.value })}
                    placeholder="Contoh: My Resume / Unduh CV"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400">My Resume PDF / External URL (Google Drive / Link)</label>
                  <input
                    type="text"
                    value={textForm.heroResumeLink}
                    onChange={(e) => setTextForm({ ...textForm, heroResumeLink: e.target.value })}
                    placeholder="Contoh: https://drive.google.com/file/d/1ABC... atau https://example.com/resume.pdf"
                    className={`${inputClass} font-mono`}
                  />
                </div>
              </div>

              {/* Hero Box Background Color Picker */}
              <div className="pt-3 border-t border-white/10">
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  🎨 Warna Background Box Hero & Resume
                </label>
                <span className="block text-[11px] text-zinc-400 mb-2">
                  Pilih warna solid kustom untuk latar belakang kotak Hero & Resume di halaman utama.
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="color"
                    value={textForm.heroBoxBgColor || "#18181b"}
                    onChange={(e) => setTextForm({ ...textForm, heroBoxBgColor: e.target.value })}
                    className="size-9 rounded-md border border-zinc-700 bg-transparent cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={textForm.heroBoxBgColor || ""}
                    onChange={(e) => setTextForm({ ...textForm, heroBoxBgColor: e.target.value })}
                    placeholder="Contoh: #18181b"
                    className={`${inputClass} font-mono text-xs w-48`}
                  />
                  <div className="flex items-center gap-1.5">
                    {solidBoxColorPresets.slice(0, 6).map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        title={p.name}
                        onClick={() => setTextForm({ ...textForm, heroBoxBgColor: p.color })}
                        className="size-6 rounded-full border border-white/20 hover:scale-110 transition-transform cursor-pointer"
                        style={{ backgroundColor: p.color || "#18181b" }}
                      />
                    ))}
                  </div>
                  {textForm.heroBoxBgColor && (
                    <button
                      type="button"
                      onClick={() => setTextForm({ ...textForm, heroBoxBgColor: "" })}
                      className="text-xs text-red-400 hover:text-red-300 underline cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Certificates Page Header Section */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6 space-y-4">
              <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                Halaman Certificates Header Text (/certificates)
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs text-zinc-400">Badge / Subtitle</label>
                  <input
                    type="text"
                    value={textForm.certificatesPageBadge || ""}
                    onChange={(e) => setTextForm({ ...textForm, certificatesPageBadge: e.target.value })}
                    placeholder="Contoh: Verified Qualifications / Lisensi & Sertifikasi"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400">Heading Title</label>
                  <input
                    type="text"
                    value={textForm.certificatesPageTitle || ""}
                    onChange={(e) => setTextForm({ ...textForm, certificatesPageTitle: e.target.value })}
                    placeholder="Contoh: My Certificates / Sertifikat Saya"
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-400">Description Text</label>
                <textarea
                  rows={2}
                  value={textForm.certificatesPageDesc || ""}
                  onChange={(e) => setTextForm({ ...textForm, certificatesPageDesc: e.target.value })}
                  placeholder="Contoh: Kumpulan sertifikasi resmi dan pencapaian keahlian profesional yang telah diverifikasi..."
                  className={inputClass}
                />
              </div>

              {/* Certificates Header Box Background Color Picker */}
              <div className="pt-3 border-t border-zinc-800">
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  🎨 Warna Background Box Header Certificates
                </label>
                <span className="block text-[11px] text-zinc-400 mb-2">
                  Pilih warna solid kustom untuk latar belakang kotak header halaman /certificates.
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="color"
                    value={textForm.certificatesHeaderBgColor || "#18181b"}
                    onChange={(e) => setTextForm({ ...textForm, certificatesHeaderBgColor: e.target.value })}
                    className="size-9 rounded-md border border-zinc-700 bg-transparent cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={textForm.certificatesHeaderBgColor || ""}
                    onChange={(e) => setTextForm({ ...textForm, certificatesHeaderBgColor: e.target.value })}
                    placeholder="Contoh: #18181b"
                    className={`${inputClass} font-mono text-xs w-48`}
                  />
                  <div className="flex items-center gap-1.5">
                    {solidBoxColorPresets.slice(0, 6).map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        title={p.name}
                        onClick={() => setTextForm({ ...textForm, certificatesHeaderBgColor: p.color })}
                        className="size-6 rounded-full border border-white/20 hover:scale-110 transition-transform cursor-pointer"
                        style={{ backgroundColor: p.color || "#18181b" }}
                      />
                    ))}
                  </div>
                  {textForm.certificatesHeaderBgColor && (
                    <button
                      type="button"
                      onClick={() => setTextForm({ ...textForm, certificatesHeaderBgColor: "" })}
                      className="text-xs text-red-400 hover:text-red-300 underline cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Projects Page Header Section */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6 space-y-4">
              <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                Halaman Projects Header Text (/projects)
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs text-zinc-400">Badge / Subtitle</label>
                  <input
                    type="text"
                    value={textForm.projectsPageBadge || ""}
                    onChange={(e) => setTextForm({ ...textForm, projectsPageBadge: e.target.value })}
                    placeholder="Contoh: Portfolio Showcase / Galeri Karya"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400">Heading Title</label>
                  <input
                    type="text"
                    value={textForm.projectsPageTitle || ""}
                    onChange={(e) => setTextForm({ ...textForm, projectsPageTitle: e.target.value })}
                    placeholder="Contoh: My Projects / Proyek Pilihan"
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-400">Description Text</label>
                <textarea
                  rows={2}
                  value={textForm.projectsPageDesc || ""}
                  onChange={(e) => setTextForm({ ...textForm, projectsPageDesc: e.target.value })}
                  placeholder="Contoh: Kumpulan studi kasus dan proyek unggulan yang telah diselesaikan untuk berbagai klien..."
                  className={inputClass}
                />
              </div>

              {/* Projects Header Box Background Color Picker */}
              <div className="pt-3 border-t border-zinc-800">
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  🎨 Warna Background Box Header Projects
                </label>
                <span className="block text-[11px] text-zinc-400 mb-2">
                  Pilih warna solid kustom untuk latar belakang kotak header halaman /projects.
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="color"
                    value={textForm.projectsHeaderBgColor || "#18181b"}
                    onChange={(e) => setTextForm({ ...textForm, projectsHeaderBgColor: e.target.value })}
                    className="size-9 rounded-md border border-zinc-700 bg-transparent cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={textForm.projectsHeaderBgColor || ""}
                    onChange={(e) => setTextForm({ ...textForm, projectsHeaderBgColor: e.target.value })}
                    placeholder="Contoh: #18181b"
                    className={`${inputClass} font-mono text-xs w-48`}
                  />
                  <div className="flex items-center gap-1.5">
                    {solidBoxColorPresets.slice(0, 6).map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        title={p.name}
                        onClick={() => setTextForm({ ...textForm, projectsHeaderBgColor: p.color })}
                        className="size-6 rounded-full border border-white/20 hover:scale-110 transition-transform cursor-pointer"
                        style={{ backgroundColor: p.color || "#18181b" }}
                      />
                    ))}
                  </div>
                  {textForm.projectsHeaderBgColor && (
                    <button
                      type="button"
                      onClick={() => setTextForm({ ...textForm, projectsHeaderBgColor: "" })}
                      className="text-xs text-red-400 hover:text-red-300 underline cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6 space-y-4">
              <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                Contact & Footer Section Text
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs text-zinc-400">Contact Title</label>
                  <input
                    type="text"
                    value={textForm.contactTitle}
                    onChange={(e) => setTextForm({ ...textForm, contactTitle: e.target.value })}
                    placeholder="Contoh: Get in touch / Mari Berkolaborasi"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400">Footer Name</label>
                  <input
                    type="text"
                    value={textForm.footerName}
                    onChange={(e) => setTextForm({ ...textForm, footerName: e.target.value })}
                    placeholder="Contoh: John Doe / Brand Name"
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-400">Contact Subtitle</label>
                <textarea
                  rows={2}
                  value={textForm.contactSubtitle}
                  onChange={(e) => setTextForm({ ...textForm, contactSubtitle: e.target.value })}
                  placeholder="Contoh: Tertarik bekerja sama atau mendiskusikan ide proyek baru? Silakan kirimkan pesan di bawah ini..."
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-purple-400">
                  Formspree Link / Endpoint URL (Email Contact Form)
                </label>
                <input
                  type="text"
                  value={textForm.formspreeUrl || ""}
                  onChange={(e) => setTextForm({ ...textForm, formspreeUrl: e.target.value })}
                  placeholder="Contoh: https://formspree.io/f/mqaejvyq"
                  className={`${inputClass} font-mono border-purple-500/50`}
                />
                <span className="block mt-1 text-[11px] text-zinc-500">
                  Isi dengan URL Formspree Anda (misal: <code>https://formspree.io/f/mqaejvyq</code>) agar pesan dikirim langsung ke inbox email Anda.
                </span>
              </div>

              {/* Contact Box & Footer Background Color Pickers */}
              <div className="pt-3 border-t border-zinc-800 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    🎨 Warna Background Box Contact
                  </label>
                  <span className="block text-[11px] text-zinc-400 mb-2">
                    Pilih warna solid kustom untuk latar belakang kotak formulir kontak (Contact Section).
                  </span>
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="color"
                      value={textForm.contactBoxBgColor || "#18181b"}
                      onChange={(e) => setTextForm({ ...textForm, contactBoxBgColor: e.target.value })}
                      className="size-9 rounded-md border border-zinc-700 bg-transparent cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={textForm.contactBoxBgColor || ""}
                      onChange={(e) => setTextForm({ ...textForm, contactBoxBgColor: e.target.value })}
                      placeholder="Contoh: #18181b"
                      className={`${inputClass} font-mono text-xs w-48`}
                    />
                    <div className="flex items-center gap-1.5">
                      {solidBoxColorPresets.slice(0, 6).map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          title={p.name}
                          onClick={() => setTextForm({ ...textForm, contactBoxBgColor: p.color })}
                          className="size-6 rounded-full border border-white/20 hover:scale-110 transition-transform cursor-pointer"
                          style={{ backgroundColor: p.color || "#18181b" }}
                        />
                      ))}
                    </div>
                    {textForm.contactBoxBgColor && (
                      <button
                        type="button"
                        onClick={() => setTextForm({ ...textForm, contactBoxBgColor: "" })}
                        className="text-xs text-red-400 hover:text-red-300 underline cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    🎨 Warna Background Footer (Opsional)
                  </label>
                  <span className="block text-[11px] text-zinc-400 mb-2">
                    Pilih warna solid kustom untuk latar belakang baris Footer (kosongkan untuk transparan).
                  </span>
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="color"
                      value={textForm.footerBgColor || "#18181b"}
                      onChange={(e) => setTextForm({ ...textForm, footerBgColor: e.target.value })}
                      className="size-9 rounded-md border border-zinc-700 bg-transparent cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={textForm.footerBgColor || ""}
                      onChange={(e) => setTextForm({ ...textForm, footerBgColor: e.target.value })}
                      placeholder="Contoh: #18181b (kosongkan jika transparan)"
                      className={`${inputClass} font-mono text-xs w-48`}
                    />
                    <div className="flex items-center gap-1.5">
                      {solidBoxColorPresets.slice(0, 6).map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          title={p.name}
                          onClick={() => setTextForm({ ...textForm, footerBgColor: p.color })}
                          className="size-6 rounded-full border border-white/20 hover:scale-110 transition-transform cursor-pointer"
                          style={{ backgroundColor: p.color || "#18181b" }}
                        />
                      ))}
                    </div>
                    {textForm.footerBgColor && (
                      <button
                        type="button"
                        onClick={() => setTextForm({ ...textForm, footerBgColor: "" })}
                        className="text-xs text-red-400 hover:text-red-300 underline cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-400">
                  Footer Copyright Attribution <span className="text-[10px] text-zinc-500 font-normal">(Non-editable / Paten)</span>
                </label>
                <div className="mt-1 flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-300">
                  <span className="font-mono">
                    All right reserved by Pixelcave (https://pixelcave.com/) • Distributed by ThemeWagon (https://themewagon.com/)
                  </span>
                  <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-400 shrink-0 ml-2">
                    🔒 Terkunci
                  </span>
                </div>
              </div>
            </div>

            {/* Danger Zone: Bersihkan Semua Data Contoh Template */}
            <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 sm:p-6 space-y-3">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm sm:text-base">
                <span>🧹</span>
                <h3>Bersihkan Seluruh Data Contoh Template (Clear All Sample Data)</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Fitur ini akan <strong>menghapus & mengosongkan seluruh data bawaan contoh template</strong> (nama logo, seluruh teks menu navbar, bio hero, link foto hero, seluruh proyek contoh, dan sertifikat contoh). Website akan menjadi bersih 100% dari data bawaan dan hanya menampilkan data asli yang Anda isi.
              </p>
              <button
                type="button"
                onClick={handleClearSampleData}
                disabled={isClearingData}
                className="rounded-lg bg-red-600 hover:bg-red-500 text-white px-4 py-2 text-xs font-semibold shadow-md transition-colors cursor-pointer disabled:opacity-50"
              >
                {isClearingData ? "Membersihkan Data..." : "🧹 Bersihkan Seluruh Data Contoh"}
              </button>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto rounded-lg bg-purple-700 hover:bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-md cursor-pointer transition-colors"
            >
              Save Text Settings
            </button>
          </form>
        )}

        {/* TAB 2: PHOTO & GOOGLE DRIVE LINK MANAGER */}
        {activeTab === "photo" && (
          <form onSubmit={handleSaveTextSettings} className="mt-6 space-y-6">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6 space-y-4">
              <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                Hero Profile Photo Link (Google Drive / Direct URL)
              </h2>
              <p className="text-xs text-zinc-400">
                You can paste a standard image URL or a Google Drive sharing link (e.g., <code>https://drive.google.com/file/d/1ABC.../view</code>). The system automatically formats Google Drive links into direct embed URLs.
              </p>

              <div className="rounded-lg bg-purple-500/10 p-3.5 border border-purple-500/30 text-xs text-purple-300 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-purple-200">
                  ✨ Standar Resolusi Otomatis Foto Profil: <strong>800 × 800 px (Rasio 1:1 Square)</strong>
                </span>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Gambar yang dimasukkan (skala/resolusi apapun) akan otomatis di-crop simetris ke tengah (center crop) agar tampilan profil tidak kekecilan, kebesaran, atau terdistorsi.
                </p>
              </div>

              <div>
                <label className="block text-xs text-zinc-400">Hero Photo URL / Drive Link</label>
                <input
                  type="text"
                  value={textForm.heroPhotoUrl}
                  onChange={(e) => setTextForm({ ...textForm, heroPhotoUrl: e.target.value })}
                  placeholder="Contoh: https://drive.google.com/file/d/1ABC... atau https://example.com/photo.jpg"
                  className={`${inputClass} font-mono`}
                />
              </div>

              {/* Preview */}
              <div className="mt-4 rounded-lg bg-zinc-950 p-4 border border-zinc-800">
                <span className="block text-xs font-semibold text-zinc-400 mb-2">Live Auto-Cropped Image Preview (1:1 Square):</span>
                <img
                  src={formatImageUrl(textForm.heroPhotoUrl, "hero")}
                  alt="Hero Preview"
                  className="size-36 sm:size-48 rounded-xl object-cover object-center aspect-square border border-zinc-700 overflow-hidden"
                />
                <span className="block text-[11px] font-mono text-zinc-500 mt-2 break-all">
                  Converted URL: {formatImageUrl(textForm.heroPhotoUrl, "hero")}
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto rounded-lg bg-purple-700 hover:bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-md cursor-pointer transition-colors"
            >
              Save Photo URL
            </button>
          </form>
        )}

        {/* TAB 3: THEME & COLOR CUSTOMIZER */}
        {activeTab === "theme" && (
          <form onSubmit={handleSaveTextSettings} className="mt-6 space-y-6">
            {/* Color Presets Card */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <span>🎨</span>
                    <span>Pilihan Preset Tema Solid (Solid Theme Presets)</span>
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Pilih salah satu dari 6 preset palet warna solid serasi di bawah ini untuk mengisi ke-8 pengaturan warna secara otomatis:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
                {solidThemePresets.map((preset) => {
                  const isSelected =
                    textForm.bgWebsiteColor?.toLowerCase() === preset.bgWebsiteColor.toLowerCase() &&
                    textForm.headerTextColor?.toLowerCase() === preset.headerTextColor.toLowerCase() &&
                    textForm.buttonBgColor?.toLowerCase() === preset.buttonBgColor.toLowerCase() &&
                    textForm.hoverAccentColor?.toLowerCase() === preset.hoverAccentColor.toLowerCase();

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() =>
                        setTextForm({
                          ...textForm,
                          bgWebsiteColor: preset.bgWebsiteColor,
                          headerTextColor: preset.headerTextColor,
                          descTextColor: preset.descTextColor,
                          buttonBgColor: preset.buttonBgColor,
                          buttonTextColor: preset.buttonTextColor,
                          navTextColor: preset.navTextColor,
                          navBgColor: preset.navBgColor,
                          hoverAccentColor: preset.hoverAccentColor,
                        })
                      }
                      className={`relative flex flex-col justify-between text-left p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-purple-950/40 border-purple-500 shadow-md shadow-purple-500/10 ring-1 ring-purple-500"
                          : "bg-zinc-950 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-white truncate">{preset.name}</span>
                          <span className="size-3.5 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: preset.hoverAccentColor }} />
                        </div>
                        <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                          {preset.desc}
                        </p>
                      </div>

                      {/* Swatches bar */}
                      <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            title={`Background: ${preset.bgWebsiteColor}`}
                            className="size-4 rounded-full border border-white/20 shadow-xs"
                            style={{ backgroundColor: preset.bgWebsiteColor }}
                          />
                          <span
                            title={`Header Text: ${preset.headerTextColor}`}
                            className="size-4 rounded-full border border-white/20 shadow-xs"
                            style={{ backgroundColor: preset.headerTextColor }}
                          />
                          <span
                            title={`Button: ${preset.buttonBgColor}`}
                            className="size-4 rounded-full border border-white/20 shadow-xs"
                            style={{ backgroundColor: preset.buttonBgColor }}
                          />
                          <span
                            title={`Hover/Accent: ${preset.hoverAccentColor}`}
                            className="size-4 rounded-full border border-white/20 shadow-xs"
                            style={{ backgroundColor: preset.hoverAccentColor }}
                          />
                        </div>
                        <span
                          className={`text-[11px] font-semibold ${
                            isSelected ? "text-purple-400 font-bold" : "text-zinc-400"
                          }`}
                        >
                          {isSelected ? "✓ Aktif" : "Terapkan →"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 8 Custom Color Pickers */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6 space-y-6">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                  Pengaturan 8 Warna Website (Kustomisasi Manual)
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Sesuaikan warna elemen website di bawah ini sesuai selera. Setiap warna akan langsung diaktifkan secara solid.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* 1. Warna Background Website */}
                <div className="rounded-xl bg-zinc-950 p-4 border border-zinc-800 space-y-2">
                  <label className="block text-xs font-semibold text-zinc-200">
                    1. Warna Background Website
                  </label>
                  <span className="block text-[11px] text-zinc-400">Warna dasar latar belakang seluruh halaman web.</span>
                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="color"
                      value={textForm.bgWebsiteColor || "#09090b"}
                      onChange={(e) => setTextForm({ ...textForm, bgWebsiteColor: e.target.value })}
                      className="size-10 rounded-lg cursor-pointer border-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={textForm.bgWebsiteColor || "#09090b"}
                      onChange={(e) => setTextForm({ ...textForm, bgWebsiteColor: e.target.value })}
                      placeholder="Contoh: #09090b"
                      className={`${inputClass} font-mono`}
                    />
                  </div>
                </div>

                {/* 2. Warna Text Header */}
                <div className="rounded-xl bg-zinc-950 p-4 border border-zinc-800 space-y-2">
                  <label className="block text-xs font-semibold text-zinc-200">
                    2. Warna Text Header
                  </label>
                  <span className="block text-[11px] text-zinc-400">Warna untuk judul utama, heading (H1, H2, H3), dan judul kartu.</span>
                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="color"
                      value={textForm.headerTextColor || "#ffffff"}
                      onChange={(e) => setTextForm({ ...textForm, headerTextColor: e.target.value })}
                      className="size-10 rounded-lg cursor-pointer border-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={textForm.headerTextColor || "#ffffff"}
                      onChange={(e) => setTextForm({ ...textForm, headerTextColor: e.target.value })}
                      placeholder="Contoh: #ffffff"
                      className={`${inputClass} font-mono`}
                    />
                  </div>
                </div>

                {/* 3. Warna Text Description */}
                <div className="rounded-xl bg-zinc-950 p-4 border border-zinc-800 space-y-2">
                  <label className="block text-xs font-semibold text-zinc-200">
                    3. Warna Text Description
                  </label>
                  <span className="block text-[11px] text-zinc-400">Warna untuk deskripsi bio, paragraf teks, label info, dan isi tulisan.</span>
                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="color"
                      value={textForm.descTextColor || "#a1a1aa"}
                      onChange={(e) => setTextForm({ ...textForm, descTextColor: e.target.value })}
                      className="size-10 rounded-lg cursor-pointer border-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={textForm.descTextColor || "#a1a1aa"}
                      onChange={(e) => setTextForm({ ...textForm, descTextColor: e.target.value })}
                      placeholder="Contoh: #a1a1aa"
                      className={`${inputClass} font-mono`}
                    />
                  </div>
                </div>

                {/* 4. Warna Button */}
                <div className="rounded-xl bg-zinc-950 p-4 border border-zinc-800 space-y-2">
                  <label className="block text-xs font-semibold text-zinc-200">
                    4. Warna Button (Background Tombol)
                  </label>
                  <span className="block text-[11px] text-zinc-400">Warna latar belakang tombol (Resume, Send Message, dsb).</span>
                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="color"
                      value={textForm.buttonBgColor || "#ffffff"}
                      onChange={(e) => setTextForm({ ...textForm, buttonBgColor: e.target.value })}
                      className="size-10 rounded-lg cursor-pointer border-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={textForm.buttonBgColor || "#ffffff"}
                      onChange={(e) => setTextForm({ ...textForm, buttonBgColor: e.target.value })}
                      placeholder="Contoh: #ffffff"
                      className={`${inputClass} font-mono`}
                    />
                  </div>
                </div>

                {/* 5. Warna Text Button */}
                <div className="rounded-xl bg-zinc-950 p-4 border border-zinc-800 space-y-2">
                  <label className="block text-xs font-semibold text-zinc-200">
                    5. Warna Text Button
                  </label>
                  <span className="block text-[11px] text-zinc-400">Warna teks di dalam tombol tombol website.</span>
                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="color"
                      value={textForm.buttonTextColor || "#09090b"}
                      onChange={(e) => setTextForm({ ...textForm, buttonTextColor: e.target.value })}
                      className="size-10 rounded-lg cursor-pointer border-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={textForm.buttonTextColor || "#09090b"}
                      onChange={(e) => setTextForm({ ...textForm, buttonTextColor: e.target.value })}
                      placeholder="Contoh: #09090b"
                      className={`${inputClass} font-mono`}
                    />
                  </div>
                </div>

                {/* 6. Warna Text Navigation Bar */}
                <div className="rounded-xl bg-zinc-950 p-4 border border-zinc-800 space-y-2">
                  <label className="block text-xs font-semibold text-zinc-200">
                    6. Warna Text Navigation Bar
                  </label>
                  <span className="block text-[11px] text-zinc-400">Warna teks nama logo dan menu tautan navigasi.</span>
                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="color"
                      value={textForm.navTextColor || "#f4f4f5"}
                      onChange={(e) => setTextForm({ ...textForm, navTextColor: e.target.value })}
                      className="size-10 rounded-lg cursor-pointer border-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={textForm.navTextColor || "#f4f4f5"}
                      onChange={(e) => setTextForm({ ...textForm, navTextColor: e.target.value })}
                      placeholder="Contoh: #f4f4f5"
                      className={`${inputClass} font-mono`}
                    />
                  </div>
                </div>

                {/* 7. Warna Background Navigation Bar */}
                <div className="rounded-xl bg-zinc-950 p-4 border border-zinc-800 space-y-2">
                  <label className="block text-xs font-semibold text-zinc-200">
                    7. Warna Background Navigation Bar
                  </label>
                  <span className="block text-[11px] text-zinc-400">Warna latar belakang sticky navigation bar di bagian atas.</span>
                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="color"
                      value={textForm.navBgColor?.startsWith("#") ? textForm.navBgColor.slice(0, 7) : "#09090b"}
                      onChange={(e) => setTextForm({ ...textForm, navBgColor: `${e.target.value}cc` })}
                      className="size-10 rounded-lg cursor-pointer border-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={textForm.navBgColor || "#09090bcc"}
                      onChange={(e) => setTextForm({ ...textForm, navBgColor: e.target.value })}
                      placeholder="Contoh: #09090bcc"
                      className={`${inputClass} font-mono`}
                    />
                  </div>
                </div>

                {/* 8. Warna After Saat Cursor Mengarahkan ke Objek */}
                <div className="rounded-xl bg-zinc-950 p-4 border border-zinc-800 space-y-2">
                  <label className="block text-xs font-semibold text-zinc-200">
                    8. Warna After Saat Cursor Mengarahkan ke Objek (Hover / Accent)
                  </label>
                  <span className="block text-[11px] text-zinc-400">Warna aksen saat kursor mouse diarahkan ke link, badge, dan tombol.</span>
                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="color"
                      value={textForm.hoverAccentColor || "#a855f7"}
                      onChange={(e) => setTextForm({ ...textForm, hoverAccentColor: e.target.value })}
                      className="size-10 rounded-lg cursor-pointer border-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={textForm.hoverAccentColor || "#a855f7"}
                      onChange={(e) => setTextForm({ ...textForm, hoverAccentColor: e.target.value })}
                      placeholder="Contoh: #a855f7"
                      className={`${inputClass} font-mono`}
                    />
                  </div>
                </div>
              </div>

              {/* Live Interactive Preview Simulation */}
              <div className="pt-4 border-t border-zinc-800">
                <span className="block text-xs font-semibold text-zinc-300 mb-3">
                  ✨ Live Preview Interaktif 8 Warna:
                </span>
                <div
                  style={{
                    backgroundColor: textForm.bgWebsiteColor || "#09090b",
                    borderColor: "rgba(255,255,255,0.15)",
                  }}
                  className="rounded-2xl p-5 border shadow-xl space-y-4 transition-colors"
                >
                  {/* Nav preview */}
                  <div
                    style={{
                      backgroundColor: textForm.navBgColor || "#09090bcc",
                      color: textForm.navTextColor || "#f4f4f5",
                    }}
                    className="flex items-center justify-between rounded-xl px-4 py-2.5 border border-white/10"
                  >
                    <span className="text-sm font-bold tracking-widest">{textForm.logoText || "LOGO"}</span>
                    <div className="flex items-center gap-4 text-xs">
                      <span>Home</span>
                      <span style={{ color: textForm.hoverAccentColor || "#a855f7" }} className="font-semibold underline">
                        Active Menu
                      </span>
                      <span>Contact</span>
                    </div>
                  </div>

                  {/* Card content preview */}
                  <div className="rounded-xl bg-black/40 p-4 border border-white/10 space-y-3">
                    <h3 style={{ color: textForm.headerTextColor || "#ffffff" }} className="text-base font-bold">
                      Contoh Judul Header Website
                    </h3>
                    <p style={{ color: textForm.descTextColor || "#a1a1aa" }} className="text-xs leading-relaxed">
                      Ini adalah simulasi teks deskripsi yang menggunakan Warna Text Description.
                    </p>
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        style={{
                          backgroundColor: textForm.buttonBgColor || "#ffffff",
                          color: textForm.buttonTextColor || "#09090b",
                        }}
                        className="rounded-lg px-4 py-2 text-xs font-semibold shadow-xs"
                      >
                        Tombol Preview
                      </button>
                      <span
                        style={{
                          color: textForm.hoverAccentColor || "#a855f7",
                          backgroundColor: `${textForm.hoverAccentColor || "#a855f7"}20`,
                          borderColor: `${textForm.hoverAccentColor || "#a855f7"}40`,
                        }}
                        className="rounded-full px-3 py-1 text-[11px] font-semibold border"
                      >
                        Hover / Accent Badge
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto rounded-lg bg-purple-700 hover:bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-md cursor-pointer transition-colors"
            >
              Save Theme & Color Settings
            </button>
          </form>
        )}

        {/* TAB 4: SOCIAL MEDIA LINKS MANAGER */}
        {activeTab === "social" && (
          <form onSubmit={handleSaveTextSettings} className="mt-6 space-y-6">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6 space-y-4">
              <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                Social Media Links (Footer)
              </h2>
              <p className="text-xs text-zinc-400">
                Leave a field empty to hide that social media icon from the footer navigation.
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs text-zinc-400">Twitter / X URL</label>
                  <input
                    type="text"
                    value={textForm.socialTwitter}
                    onChange={(e) => setTextForm({ ...textForm, socialTwitter: e.target.value })}
                    placeholder="Contoh: https://x.com/username"
                    className={`${inputClass} font-mono`}
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400">Facebook URL</label>
                  <input
                    type="text"
                    value={textForm.socialFacebook}
                    onChange={(e) => setTextForm({ ...textForm, socialFacebook: e.target.value })}
                    placeholder="Contoh: https://facebook.com/username"
                    className={`${inputClass} font-mono`}
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400">Instagram URL</label>
                  <input
                    type="text"
                    value={textForm.socialInstagram}
                    onChange={(e) => setTextForm({ ...textForm, socialInstagram: e.target.value })}
                    placeholder="Contoh: https://instagram.com/username"
                    className={`${inputClass} font-mono`}
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400">GitHub URL</label>
                  <input
                    type="text"
                    value={textForm.socialGithub}
                    onChange={(e) => setTextForm({ ...textForm, socialGithub: e.target.value })}
                    placeholder="Contoh: https://github.com/username"
                    className={`${inputClass} font-mono`}
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400">Dribbble URL</label>
                  <input
                    type="text"
                    value={textForm.socialDribbble}
                    onChange={(e) => setTextForm({ ...textForm, socialDribbble: e.target.value })}
                    placeholder="Contoh: https://dribbble.com/username"
                    className={`${inputClass} font-mono`}
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400">LinkedIn URL</label>
                  <input
                    type="text"
                    value={textForm.socialLinkedin || ""}
                    onChange={(e) => setTextForm({ ...textForm, socialLinkedin: e.target.value })}
                    placeholder="Contoh: https://linkedin.com/in/username"
                    className={`${inputClass} font-mono`}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto rounded-lg bg-purple-700 hover:bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-md cursor-pointer transition-colors"
            >
              Save Social Media Links
            </button>
          </form>
        )}

        {/* TAB 5: PROJECTS MANAGER */}
        {activeTab === "projects" && (
          <div className="mt-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base sm:text-lg font-bold text-white">Manage Projects ({projectsList.length})</h2>
              <div className="flex flex-wrap items-center gap-2">
                {projectsList.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllProjects}
                    className="rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-400 cursor-pointer transition-colors"
                  >
                    🧹 Bersihkan Semua Proyek
                  </button>
                )}
                <button
                  onClick={() =>
                    setEditingProject({
                      title: "",
                      subtitle: "",
                      image: "",
                      category: "",
                      client: "",
                      date: "",
                      tools: [],
                      description: "",
                      highlights: [],
                      link: "",
                      linkText: "",
                      boxBgColor: "",
                    })
                  }
                  className="rounded-lg bg-purple-700 hover:bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-md cursor-pointer transition-colors"
                >
                  + Add New Project
                </button>
              </div>
            </div>

            {/* Projects List */}
            {projectsList.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/50 p-8 text-center">
                <p className="text-xs text-zinc-400">
                  Belum ada proyek di daftar. Klik tombol <strong>+ Add New Project</strong> di atas untuk menambahkan proyek pertama Anda.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {projectsList.map((proj) => (
                  <div key={proj.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 flex flex-col sm:flex-row gap-4">
                    {proj.image && (
                      <img
                        src={formatImageUrl(proj.image, "project")}
                        alt={proj.title}
                        className="w-full sm:w-32 aspect-video rounded-lg object-cover bg-zinc-950 shrink-0 border border-zinc-800"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white text-sm truncate">{proj.title}</h4>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-purple-400 mt-0.5">
                        {proj.category && <span>{proj.category}</span>}
                        {proj.client && <span className="text-zinc-500">• Klien: {proj.client}</span>}
                      </div>
                      <span className="text-[11px] text-zinc-400 block mt-1 line-clamp-2">{proj.description}</span>
                      
                      {/* External Link Indicator */}
                      {proj.link && (
                        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-purple-400">
                          <span>🔗</span>
                          <a
                            href={proj.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-purple-300 truncate max-w-[200px]"
                          >
                            {proj.linkText || proj.link}
                          </a>
                        </div>
                      )}

                      {/* Solid Box Color preview indicator */}
                      {proj.boxBgColor && (
                        <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-zinc-400">
                          <span>🎨 Box:</span>
                          <span
                            className="size-3.5 rounded-full border border-white/20 inline-block shrink-0"
                            style={{
                              backgroundColor: proj.boxBgColor,
                            }}
                          />
                        </div>
                      )}

                      {proj.tools && proj.tools.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {proj.tools.slice(0, 3).map((t, idx) => (
                            <span key={idx} className="rounded-md bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-300">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => setEditingProject(proj)}
                          className="rounded-md bg-zinc-800 px-2.5 py-1 text-xs text-zinc-200 hover:bg-zinc-700 cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProject(proj.id)}
                          className="rounded-md bg-red-950 px-2.5 py-1 text-xs text-red-400 hover:bg-red-900 cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Editing / Adding Project Modal Form */}
            {editingProject && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
                <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-zinc-900 p-5 sm:p-6 border border-zinc-800 text-white shadow-2xl">
                  <h3 className="text-lg font-bold text-white mb-4">
                    {editingProject.id ? "Edit Project" : "Add New Project"}
                  </h3>
                  <form onSubmit={handleSaveProject} className="space-y-4">
                    <div>
                      <label className="block text-xs text-zinc-400">Project Title</label>
                      <input
                        type="text"
                        required
                        value={editingProject.title || ""}
                        onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                        placeholder="Contoh: Website E-Commerce Modern"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400">Image URL / Google Drive Link (Opsional)</label>
                      <input
                        type="text"
                        value={editingProject.image || ""}
                        onChange={(e) => setEditingProject({ ...editingProject, image: e.target.value })}
                        placeholder="Contoh: https://drive.google.com/file/d/1ABC... atau /assets/project1.png"
                        className={`${inputClass} font-mono`}
                      />
                      <span className="block text-[11px] text-purple-400 mt-1">
                        ✨ Standar Resolusi Otomatis Gambar Proyek: <strong>16:9 Landscape (1280 × 720 px)</strong>.
                      </span>
                    </div>

                    {editingProject.image && (
                      <div className="rounded-lg bg-zinc-950 p-3 border border-zinc-800 flex items-center gap-3">
                        <img
                          src={formatImageUrl(editingProject.image, "project")}
                          alt="Project Preview"
                          className="w-32 aspect-video rounded-lg object-cover object-center border border-zinc-700 overflow-hidden"
                        />
                        <div className="text-xs text-zinc-400 space-y-1">
                          <span className="font-semibold text-zinc-200 block">Preview Crop Proyek (16:9)</span>
                          <span className="text-[11px] text-emerald-400 block">✓ Otomatis di-crop tengah 16:9 landscape</span>
                        </div>
                      </div>
                    )}

                    {/* External Link inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-zinc-400">Link URL Proyek Asli / Live (Opsional)</label>
                        <input
                          type="text"
                          value={editingProject.link || ""}
                          onChange={(e) => setEditingProject({ ...editingProject, link: e.target.value })}
                          placeholder="Contoh: https://myproject.com atau https://github.com/..."
                          className={`${inputClass} font-mono`}
                        />
                        <span className="block text-[10px] text-zinc-500 mt-0.5">
                          Link eksternal yang akan dibuka saat tombol diklik.
                        </span>
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-400">Teks Tombol Link (Opsional)</label>
                        <input
                          type="text"
                          value={editingProject.linkText || ""}
                          onChange={(e) => setEditingProject({ ...editingProject, linkText: e.target.value })}
                          placeholder="Contoh: Visit Project / Live Demo / Kunjungi Proyek"
                          className={inputClass}
                        />
                        <span className="block text-[10px] text-zinc-500 mt-0.5">
                          Default: &quot;Visit Project&quot;
                        </span>
                      </div>
                    </div>

                    {/* Box Solid Background Selector */}
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-200">
                          🎨 Warna Solid Background Box
                        </label>
                        <span className="block text-[11px] text-zinc-400 mt-0.5">
                          Pilih preset atau tentukan 1 warna solid kustom untuk background box kartu proyek ini.
                        </span>
                      </div>

                      {/* Presets */}
                      <div className="flex flex-wrap gap-1.5">
                        {solidBoxColorPresets.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() =>
                              setEditingProject({
                                ...editingProject,
                                boxBgColor: preset.color,
                              })
                            }
                            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border transition-colors cursor-pointer ${
                              editingProject.boxBgColor === preset.color
                                ? "border-purple-500 bg-purple-950/60 text-white"
                                : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                            }`}
                          >
                            {preset.color ? (
                              <span
                                className="size-3 rounded-full shrink-0 border border-white/20"
                                style={{ backgroundColor: preset.color }}
                              />
                            ) : (
                              <span className="size-3 rounded-full shrink-0 bg-zinc-700" />
                            )}
                            <span>{preset.name}</span>
                          </button>
                        ))}
                      </div>

                      {/* Custom Color Picker */}
                      <div className="pt-1">
                        <label className="block text-[11px] text-zinc-400 mb-1">Pilih Warna Solid Kustom</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={editingProject.boxBgColor || "#18181b"}
                            onChange={(e) =>
                              setEditingProject({ ...editingProject, boxBgColor: e.target.value })
                            }
                            className="size-9 rounded-md border border-zinc-700 bg-transparent cursor-pointer p-0.5"
                          />
                          <input
                            type="text"
                            value={editingProject.boxBgColor || ""}
                            onChange={(e) =>
                              setEditingProject({ ...editingProject, boxBgColor: e.target.value })
                            }
                            placeholder="Contoh: #18181b"
                            className={`${inputClass} font-mono text-xs`}
                          />
                        </div>
                      </div>

                      {/* Live Preview Box */}
                      <div
                        style={{
                          backgroundColor: editingProject.boxBgColor || "#18181b",
                        }}
                        className="relative overflow-hidden rounded-xl p-4 border border-white/10 mt-2 flex items-center justify-between"
                      >
                        <div className="text-xs">
                          <span className="font-bold text-white block">✨ Live Preview Box Proyek</span>
                          <span className="text-[11px] text-zinc-400">
                            Warna aktif: {editingProject.boxBgColor || "#18181b (Default)"}
                          </span>
                        </div>
                        {editingProject.boxBgColor && (
                          <button
                            type="button"
                            onClick={() => setEditingProject({ ...editingProject, boxBgColor: "" })}
                            className="text-[11px] text-red-400 hover:text-red-300 cursor-pointer underline"
                          >
                            Reset Warna
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-zinc-400">Category (Opsional)</label>
                        <input
                          type="text"
                          value={editingProject.category || ""}
                          onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                          placeholder="Contoh: Web Development / UI Design / Mobile App"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-400">Subtitle / Tag (Opsional)</label>
                        <input
                          type="text"
                          value={editingProject.subtitle || ""}
                          onChange={(e) => setEditingProject({ ...editingProject, subtitle: e.target.value })}
                          placeholder="Contoh: Featured Work / Fullstack Project"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-zinc-400">Client / Klien (Opsional)</label>
                        <input
                          type="text"
                          value={editingProject.client || ""}
                          onChange={(e) => setEditingProject({ ...editingProject, client: e.target.value })}
                          placeholder="Contoh: PT Teknologi Nusantara / Personal Project"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-400">Date / Timeline (Opsional)</label>
                        <input
                          type="text"
                          value={editingProject.date || ""}
                          onChange={(e) => setEditingProject({ ...editingProject, date: e.target.value })}
                          placeholder="Contoh: August 2026 / 2026"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-zinc-400">Description / Deskripsi Proyek (Opsional)</label>
                      <textarea
                        rows={3}
                        value={editingProject.description || ""}
                        onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                        placeholder="Contoh: Deskripsi detail tujuan proyek, teknologi yang digunakan, tantangan, dan solusi..."
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-zinc-400">Tools & Software (Pisahkan dengan koma - Opsional)</label>
                      <input
                        type="text"
                        value={
                          Array.isArray(editingProject.tools)
                            ? editingProject.tools.join(", ")
                            : editingProject.tools || ""
                        }
                        onChange={(e) => setEditingProject({ ...editingProject, tools: e.target.value as any })}
                        placeholder="Contoh: Next.js, TypeScript, Tailwind CSS, Firebase"
                        className={inputClass}
                      />
                      <span className="block mt-1 text-[11px] text-zinc-500">
                        Contoh: <code>Next.js, TypeScript, Tailwind CSS, Firebase</code> (boleh dikosongkan jika tidak ada)
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs text-zinc-400">Key Deliverables / Hasil Poin Utama (1 per baris - Opsional)</label>
                      <textarea
                        rows={3}
                        value={
                          Array.isArray(editingProject.highlights)
                            ? editingProject.highlights.join("\n")
                            : editingProject.highlights || ""
                        }
                        onChange={(e) => setEditingProject({ ...editingProject, highlights: e.target.value as any })}
                        placeholder={"Contoh:\nOver 40 high-resolution vector assets\nTailored color palettes for dark and light modes\nPeningkatan page speed hingga 98/100"}
                        className={`${inputClass} font-sans`}
                      />
                      <span className="block mt-1 text-[11px] text-zinc-500">
                        Isi setiap poin Key Deliverables di baris baru (boleh dikosongkan jika tidak ada).
                      </span>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setEditingProject(null)}
                        className="rounded-lg bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-700 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded-lg bg-purple-700 hover:bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-md cursor-pointer"
                      >
                        Save Project
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: CERTIFICATES MANAGER */}
        {activeTab === "certificates" && (
          <div className="mt-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base sm:text-lg font-bold text-white">
                Manage Certificates ({certificatesList.length})
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                {certificatesList.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllCertificates}
                    className="rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-400 cursor-pointer transition-colors"
                  >
                    🧹 Bersihkan Semua Sertifikat
                  </button>
                )}
                <button
                  onClick={() =>
                    setEditingCert({
                      title: "",
                      issuer: "",
                      date: "",
                      credentialId: "",
                      category: "",
                      description: "",
                      skills: [],
                      image: "",
                      boxBgColor: "",
                    })
                  }
                  className="rounded-lg bg-purple-700 hover:bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-md cursor-pointer transition-colors"
                >
                  + Add New Certificate
                </button>
              </div>
            </div>

            {/* Certificates List */}
            {certificatesList.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/50 p-8 text-center">
                <p className="text-xs text-zinc-400">
                  Belum ada sertifikat di daftar. Klik tombol <strong>+ Add New Certificate</strong> di atas untuk menambahkan sertifikat pertama Anda.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {certificatesList.map((cert) => (
                  <div key={cert.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 flex flex-col sm:flex-row gap-4 items-start">
                    {cert.image && (
                      <img
                        src={formatImageUrl(cert.image, "certificate")}
                        alt={cert.title}
                        className="w-full sm:w-28 aspect-[4/3] rounded-lg object-cover bg-zinc-950 shrink-0 border border-zinc-800"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="min-w-0 pr-2">
                          <span className="text-xs font-semibold text-purple-400 block">{cert.category}</span>
                          <h4 className="font-bold text-white text-sm truncate">{cert.title}</h4>
                          <span className="text-xs text-zinc-400 block">Issued by {cert.issuer} ({cert.date})</span>
                          {cert.credentialId && (
                            <span className="text-[11px] font-mono text-zinc-400 block mt-1">ID: {cert.credentialId}</span>
                          )}

                          {/* Solid Box Color preview indicator */}
                          {cert.boxBgColor && (
                            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-zinc-400">
                              <span>🎨 Box:</span>
                              <span
                                className="size-3.5 rounded-full border border-white/20 inline-block shrink-0"
                                style={{
                                  backgroundColor: cert.boxBgColor,
                                }}
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => setEditingCert(cert)}
                            className="rounded-md bg-zinc-800 px-2.5 py-1 text-xs text-zinc-200 hover:bg-zinc-700 cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCertificate(cert.id)}
                            className="rounded-md bg-red-950 px-2.5 py-1 text-xs text-red-400 hover:bg-red-900 cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Editing Certificate Modal */}
            {editingCert && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
                <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-zinc-900 p-5 sm:p-6 border border-zinc-800 text-white shadow-2xl">
                  <h3 className="text-lg font-bold text-white mb-4">
                    {editingCert.id ? "Edit Certificate" : "Add New Certificate"}
                  </h3>
                  <form onSubmit={handleSaveCertificate} className="space-y-4">
                    <div>
                      <label className="block text-xs text-zinc-400">Certificate Title</label>
                      <input
                        type="text"
                        required
                        value={editingCert.title || ""}
                        onChange={(e) => setEditingCert({ ...editingCert, title: e.target.value })}
                        placeholder="Contoh: Google Certified Professional Cloud Architect"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400">Image URL / Google Drive Link (Gambar Sertifikat - Opsional)</label>
                      <input
                        type="text"
                        value={editingCert.image || ""}
                        onChange={(e) => setEditingCert({ ...editingCert, image: e.target.value })}
                        placeholder="Contoh: https://drive.google.com/file/d/1ABC... atau /assets/cert1.png"
                        className={`${inputClass} font-mono`}
                      />
                      <span className="block text-[11px] text-purple-400 mt-1">
                        ✨ Standar Resolusi Otomatis Gambar Sertifikat: <strong>4:3 Landscape (800 × 600 px)</strong>.
                      </span>
                    </div>

                    {editingCert.image && (
                      <div className="rounded-lg bg-zinc-950 p-3 border border-zinc-800 flex items-center gap-3">
                        <img
                          src={formatImageUrl(editingCert.image, "certificate")}
                          alt="Certificate Preview"
                          className="w-32 aspect-[4/3] rounded-lg object-cover object-center border border-zinc-700 overflow-hidden"
                        />
                        <div className="text-xs text-zinc-400 space-y-1">
                          <span className="font-semibold text-zinc-200 block">Preview Gambar Sertifikat (4:3)</span>
                          <span className="text-[11px] text-emerald-400 block">✓ Gambar berhasil dimuat dalam skala 4:3</span>
                        </div>
                      </div>
                    )}

                    {/* Box Solid Background Selector */}
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-200">
                          🎨 Warna Solid Background Box
                        </label>
                        <span className="block text-[11px] text-zinc-400 mt-0.5">
                          Pilih preset atau tentukan 1 warna solid kustom untuk background box kartu sertifikat ini.
                        </span>
                      </div>

                      {/* Presets */}
                      <div className="flex flex-wrap gap-1.5">
                        {solidBoxColorPresets.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() =>
                              setEditingCert({
                                ...editingCert,
                                boxBgColor: preset.color,
                              })
                            }
                            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border transition-colors cursor-pointer ${
                              editingCert.boxBgColor === preset.color
                                ? "border-purple-500 bg-purple-950/60 text-white"
                                : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                            }`}
                          >
                            {preset.color ? (
                              <span
                                className="size-3 rounded-full shrink-0 border border-white/20"
                                style={{ backgroundColor: preset.color }}
                              />
                            ) : (
                              <span className="size-3 rounded-full shrink-0 bg-zinc-700" />
                            )}
                            <span>{preset.name}</span>
                          </button>
                        ))}
                      </div>

                      {/* Custom Color Picker */}
                      <div className="pt-1">
                        <label className="block text-[11px] text-zinc-400 mb-1">Pilih Warna Solid Kustom</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={editingCert.boxBgColor || "#18181b"}
                            onChange={(e) =>
                              setEditingCert({ ...editingCert, boxBgColor: e.target.value })
                            }
                            className="size-9 rounded-md border border-zinc-700 bg-transparent cursor-pointer p-0.5"
                          />
                          <input
                            type="text"
                            value={editingCert.boxBgColor || ""}
                            onChange={(e) =>
                              setEditingCert({ ...editingCert, boxBgColor: e.target.value })
                            }
                            placeholder="Contoh: #18181b"
                            className={`${inputClass} font-mono text-xs`}
                          />
                        </div>
                      </div>

                      {/* Live Preview Box */}
                      <div
                        style={{
                          backgroundColor: editingCert.boxBgColor || "#18181b",
                        }}
                        className="relative overflow-hidden rounded-xl p-4 border border-white/10 mt-2 flex items-center justify-between"
                      >
                        <div className="text-xs">
                          <span className="font-bold text-white block">✨ Live Preview Box Sertifikat</span>
                          <span className="text-[11px] text-zinc-400">
                            Warna aktif: {editingCert.boxBgColor || "#18181b (Default)"}
                          </span>
                        </div>
                        {editingCert.boxBgColor && (
                          <button
                            type="button"
                            onClick={() => setEditingCert({ ...editingCert, boxBgColor: "" })}
                            className="text-[11px] text-red-400 hover:text-red-300 cursor-pointer underline"
                          >
                            Reset Warna
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-zinc-400">Issuer / Organization</label>
                        <input
                          type="text"
                          required
                          value={editingCert.issuer || ""}
                          onChange={(e) => setEditingCert({ ...editingCert, issuer: e.target.value })}
                          placeholder="Contoh: Google Cloud / Dicoding Indonesia / Coursera"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-400">Date Issued (Opsional)</label>
                        <input
                          type="text"
                          value={editingCert.date || ""}
                          onChange={(e) => setEditingCert({ ...editingCert, date: e.target.value })}
                          placeholder="Contoh: August 2026 / 2026"
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400">Credential ID (Opsional)</label>
                      <input
                        type="text"
                        value={editingCert.credentialId || ""}
                        onChange={(e) => setEditingCert({ ...editingCert, credentialId: e.target.value })}
                        placeholder="Contoh: GCP-CLOUD-98214 (boleh dikosongkan jika tidak ada)"
                        className={`${inputClass} font-mono`}
                      />
                      <span className="block text-[11px] text-zinc-500 mt-1">
                        Boleh dikosongkan jika sertifikat tidak memiliki nomor atau ID kredensial.
                      </span>
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400">Description (Opsional)</label>
                      <textarea
                        rows={3}
                        value={editingCert.description || ""}
                        onChange={(e) => setEditingCert({ ...editingCert, description: e.target.value })}
                        placeholder="Contoh: Deskripsi ringkas mengenai materi sertifikasi atau kompetensi keahlian yang diuji..."
                        className={inputClass}
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setEditingCert(null)}
                        className="rounded-lg bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-700 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded-lg bg-purple-700 hover:bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-md cursor-pointer"
                      >
                        Save Certificate
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 7: WEBSITE STATISTICS & FIREBASE SETUP GUIDE */}
        {activeTab === "stats" && (
          <div className="mt-6 space-y-6">
            {/* Header / Overview */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    📊 Statistik Kunjungan & Traffic Website
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Laporan statistik real-time mengenai jumlah pengunjung, download resume, serta perkiraan aktivitas data website.
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
                    <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                    Live Firestore Sync
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Card 1: Total Kunjungan */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 flex flex-col justify-between shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Kunjungan</span>
                  <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400">
                    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-extrabold tracking-tight text-white">{metrics.totalVisits.toLocaleString("id-ID")}</span>
                  <span className="block text-[11px] text-zinc-400 mt-1">Total tayangan halaman (Page Views)</span>
                </div>
              </div>

              {/* Card 2: Pengunjung Unik */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 flex flex-col justify-between shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Pengunjung Unik</span>
                  <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
                    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-extrabold tracking-tight text-white">{metrics.uniqueVisitors.toLocaleString("id-ID")}</span>
                  <span className="block text-[11px] text-zinc-400 mt-1">Berdasarkan sesi unik per perangkat</span>
                </div>
              </div>

              {/* Card 3: Download Resume */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 flex flex-col justify-between shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Download Resume/CV</span>
                  <div className="rounded-lg bg-yellow-500/10 p-2 text-yellow-400">
                    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-extrabold tracking-tight text-white">{metrics.resumeDownloads.toLocaleString("id-ID")}</span>
                  <span className="block text-[11px] text-zinc-400 mt-1">Total klik tombol "My Resume"</span>
                </div>
              </div>

              {/* Card 4: Media Assets & Upload */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 flex flex-col justify-between shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Asset & Item Aktif</span>
                  <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
                    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 002-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-extrabold tracking-tight text-white">
                    {projectsList.length + certificatesList.length + 1}
                  </span>
                  <span className="block text-[11px] text-zinc-400 mt-1">Total proyek, sertifikat & foto profil</span>
                </div>
              </div>
            </div>

            {/* Estimasi Activity & Usage Bandwidth */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Estimasi Penggunaan Data & Firestore Quota (Spark Free Plan)
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-zinc-300 font-semibold mb-1">
                    <span>Firestore Document Reads (Estimasi):</span>
                    <span>~{metrics.totalVisits * 4} / 50,000 per hari (Free)</span>
                  </div>
                  <div className="w-full bg-zinc-950 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(2, ((metrics.totalVisits * 4) / 50000) * 100))}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-zinc-300 font-semibold mb-1">
                    <span>Download Bandwidth (Egress Estimasi):</span>
                    <span>~{((metrics.totalVisits * 1.2) / 1024).toFixed(2)} GB / 10 GB per bulan (Free)</span>
                  </div>
                  <div className="w-full bg-zinc-950 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(2, (((metrics.totalVisits * 1.2) / 1024) / 10) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: SETTINGS & CHANGE PASSWORD */}
        {activeTab === "settings" && (
          <div className="mt-6 space-y-6">
            {/* Backup & Restore Database JSON */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6 space-y-4 max-w-2xl">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span>💾</span>
                  <span>Backup & Restore Database (database.json)</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Unduh seluruh isi database Firestore (pengaturan teks, 8 warna tema solid, proyek, dan sertifikat) ke dalam file <code>database.json</code>, atau unggah file <code>database.json</code> untuk memulihkan / migrasi database secara instan.
                </p>
              </div>

              <div className="rounded-lg bg-purple-500/10 p-3.5 border border-purple-500/30 text-xs text-purple-300 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-purple-200">
                  ✨ Format Data Terpadu:
                </span>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  File backup mencakup data konfigurasi website lengkap: Logo, Navbar, Bio Hero, Drive photo, Formspree, Social media, Color themes, {projectsList.length} Proyek, dan {certificatesList.length} Sertifikat.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                {/* Export Button */}
                <button
                  type="button"
                  onClick={handleExportDatabaseJSON}
                  disabled={isExportingJSON}
                  className="flex items-center justify-center gap-2 rounded-xl bg-purple-700 hover:bg-purple-600 disabled:opacity-50 px-5 py-3 text-xs font-bold text-white transition-all shadow-md shadow-purple-950/40 cursor-pointer active:scale-98"
                >
                  {isExportingJSON ? (
                    <>
                      <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Mempersiapkan JSON...</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>Download database.json</span>
                    </>
                  )}
                </button>

                {/* Import Button & Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json,application/json"
                  onChange={handleImportDatabaseJSON}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImportingJSON}
                  className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 px-5 py-3 text-xs font-bold text-zinc-100 hover:text-white transition-all shadow-xs cursor-pointer active:scale-98"
                >
                  {isImportingJSON ? (
                    <>
                      <span className="size-4 animate-spin rounded-full border-2 border-zinc-300 border-t-transparent" />
                      <span>Mengimpor Database...</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" />
                      </svg>
                      <span>Upload & Import database.json</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Change Admin Password */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6 space-y-4 max-w-2xl">
              <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                Change Admin Password (Keamanan Akun)
              </h2>
              <p className="text-xs text-zinc-400">
                Ubah password akun admin Anda untuk menjaga keamanan website. Diperlukan konfirmasi password saat ini.
              </p>

              {passwordStatus && (
                <div
                  className={`rounded-lg p-3 text-xs font-semibold border ${
                    passwordStatus.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-red-500/10 border-red-500/30 text-red-400"
                  }`}
                >
                  {passwordStatus.message}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs text-zinc-400">Current Password (Password Saat Ini)</label>
                  <div className="relative mt-1">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Contoh: Masukkan password akun saat ini"
                      className={`${inputClass} mt-0 pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-400 hover:text-zinc-200 focus:outline-hidden cursor-pointer"
                      title={showCurrentPassword ? "Sembunyikan Password" : "Tampilkan Password"}
                    >
                      {showCurrentPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.04 10.04 0 013.122-.463c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m-6.115-3.486a3 3 0 11-4.243-4.243m4.243 4.243L3 3l18 18" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-zinc-400">New Password (Password Baru)</label>
                  <div className="relative mt-1">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Contoh: Masukkan minimal 6 karakter password baru"
                      className={`${inputClass} mt-0 pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-400 hover:text-zinc-200 focus:outline-hidden cursor-pointer"
                      title={showNewPassword ? "Sembunyikan Password" : "Tampilkan Password"}
                    >
                      {showNewPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.04 10.04 0 013.122-.463c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m-6.115-3.486a3 3 0 11-4.243-4.243m4.243 4.243L3 3l18 18" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-zinc-400">Confirm New Password (Konfirmasi Password Baru)</label>
                  <div className="relative mt-1">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Contoh: Ulangi password baru yang sama"
                      className={`${inputClass} mt-0 pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-400 hover:text-zinc-200 focus:outline-hidden cursor-pointer"
                      title={showConfirmPassword ? "Sembunyikan Password" : "Tampilkan Password"}
                    >
                      {showConfirmPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.04 10.04 0 013.122-.463c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m-6.115-3.486a3 3 0 11-4.243-4.243m4.243 4.243L3 3l18 18" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingPassword}
                  className="w-full sm:w-auto rounded-lg bg-purple-700 hover:bg-purple-600 px-6 py-2.5 text-xs font-semibold text-white shadow-md disabled:opacity-50 cursor-pointer transition-colors"
                >
                  {isSubmittingPassword ? "Updating Password..." : "Update Password"}
                </button>
              </form>
            </div>
          </div>
        )}
        </main>
      </div>
    </div>
  );
}
