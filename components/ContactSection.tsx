"use client";

import { useState } from "react";
import { useSite } from "@/context/SiteContext";
import FadeInCard from "./FadeInCard";

export default function ContactSection() {
  const { settings, mounted } = useSite();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const endpoint = settings.formspreeUrl?.trim() || "";

      if (endpoint) {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            message: formData.message,
          }),
        });

        if (response.ok) {
          setSubmitted(true);
          setFormData({ name: "", email: "", message: "" });
        } else {
          const data = await response.json().catch(() => ({}));
          setErrorMessage(
            data.error || "Gagal mengirim pesan via Formspree. Silakan periksa kembali Link Formspree Anda di Admin."
          );
        }
      } else {
        // Fallback demo submission if Formspree URL is not configured yet
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setFormData({ name: "", email: "", message: "" });
        }, 5000);
      }
    } catch (err: any) {
      setErrorMessage("Terjadi kesalahan koneksi saat mengirim pesan. Coba lagi nanti.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const btnStyle: React.CSSProperties = {
    backgroundColor: settings.buttonBgColor || "#ffffff",
    borderColor: settings.buttonBgColor || "#ffffff",
    color: settings.buttonTextColor || "#09090b",
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: settings.bgWebsiteColor || "#09090b",
    color: settings.headerTextColor || "#ffffff",
    borderColor: `${settings.headerTextColor || "#ffffff"}25`,
  };

  return (
    <FadeInCard delay={600} direction="up" className="col-span-1 md:col-span-12">
      <div
        id="contact"
        style={{
          backgroundColor: settings.contactBoxBgColor || "#18181b",
        }}
        className="relative flex flex-col overflow-hidden rounded-2xl px-6 py-12 md:px-12 md:py-20 border border-white/10 max-w-full shadow-md transition-colors"
      >
        <div className="relative mx-auto mt-auto max-w-md w-full z-10">
          {settings.contactTitle ? (
            <h2
              style={{ color: settings.headerTextColor || "#ffffff" }}
              className="text-3xl sm:text-4xl font-medium"
            >
              {settings.contactTitle}
            </h2>
          ) : null}
          {settings.contactSubtitle ? (
            <h3
              style={{ color: settings.descTextColor || "#a1a1aa" }}
              className="mt-3 text-sm sm:text-base leading-relaxed"
            >
              {settings.contactSubtitle}
            </h3>
          ) : null}

          {submitted ? (
            <div className="mt-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-5 text-center text-emerald-400 font-medium">
              <span className="block text-base font-bold">✓ Pesan Terkirim!</span>
              <p className="mt-1 text-xs text-zinc-400">
                Terima kasih telah menghubungi kami. Pesan Anda telah dikirim langsung ke email.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 sm:mt-10 w-full space-y-6">
              {errorMessage && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400 font-medium">
                  ⚠️ {errorMessage}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="name" style={{ color: settings.headerTextColor || "#ffffff" }} className="inline-block text-sm font-semibold">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  style={inputStyle}
                  className="block w-full rounded-xl border px-4 py-3 placeholder:opacity-60 focus:outline-hidden focus:ring-2 focus:ring-purple-500/40 transition-colors shadow-xs"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" style={{ color: settings.headerTextColor || "#ffffff" }} className="inline-block text-sm font-semibold">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  style={inputStyle}
                  className="block w-full rounded-xl border px-4 py-3 placeholder:opacity-60 focus:outline-hidden focus:ring-2 focus:ring-purple-500/40 transition-colors shadow-xs"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" style={{ color: settings.headerTextColor || "#ffffff" }} className="inline-block text-sm font-semibold">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  style={inputStyle}
                  className="block w-full rounded-xl border px-4 py-3 placeholder:opacity-60 focus:outline-hidden focus:ring-2 focus:ring-purple-500/40 transition-colors shadow-xs"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={btnStyle}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm leading-6 font-semibold shadow-xs hover:opacity-90 active:scale-98 transition-all lg:w-auto cursor-pointer disabled:opacity-50 border"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="size-4 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
                    Mengirim...
                  </span>
                ) : (
                  <span>Send Message</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </FadeInCard>
  );
}
