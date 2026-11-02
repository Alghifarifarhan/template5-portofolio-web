"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CertificateModal from "@/components/CertificateModal";
import FadeInCard from "@/components/FadeInCard";
import { certificatesData, Certificate } from "@/data/certificates";
import { formatImageUrl } from "@/lib/googleDrive";
import { useSite, REALTIME_SYNC_CHANNEL } from "@/context/SiteContext";

const sortNewestFirst = (items: Certificate[]): Certificate[] => {
  return [...items].sort((a, b) => {
    const timeA =
      a.createdAt ||
      (typeof a.id === "string" && a.id.startsWith("cert_")
        ? parseInt(a.id.replace("cert_", "")) || 0
        : 0);
    const timeB =
      b.createdAt ||
      (typeof b.id === "string" && a.id.startsWith("cert_")
        ? parseInt(b.id.replace("cert_", "")) || 0
        : 0);
    return timeB - timeA;
  });
};

export default function CertificatesPage() {
  const { settings } = useSite();
  const [certificatesList, setCertificatesList] = useState<Certificate[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("portfolio_certificates_cache");
        if (cached) {
          return sortNewestFirst(JSON.parse(cached));
        }
      } catch (e) {}
    }
    return [];
  });
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, "certificates"), (snapshot) => {
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
      console.warn("Certificates sync error:", e);
    }
  }, []);

  // Multi-tab instant sync listener
  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;
    try {
      const channel = new BroadcastChannel(REALTIME_SYNC_CHANNEL);
      channel.onmessage = (event) => {
        const { type } = event.data || {};
        if (type === "certificates" || type === "all") {
          try {
            const cached = localStorage.getItem("portfolio_certificates_cache");
            if (cached) {
              setCertificatesList(sortNewestFirst(JSON.parse(cached)));
            }
          } catch (e) {}
        }
      };
      return () => channel.close();
    } catch (e) {}
  }, []);

  const hasHeaderContent =
    settings.certificatesPageBadge || settings.certificatesPageTitle || settings.certificatesPageDesc;

  return (
    <div
      style={{
        backgroundColor: settings.bgWebsiteColor || "#09090b",
        color: settings.descTextColor || "#a1a1aa",
      }}
      className="min-h-dvh min-w-80 transition-colors"
    >
      <main className="mx-auto flex max-w-6xl flex-auto flex-col px-4 pb-4 lg:px-8 lg:pb-8">
        <Header />

        {/* Page Hero Title */}
        {hasHeaderContent ? (
          <FadeInCard delay={100} direction="up" className="my-8">
            <div
              style={{
                backgroundColor: settings.certificatesHeaderBgColor || "#18181b",
              }}
              className="rounded-2xl border border-white/10 p-8 md:p-12 shadow-xl relative overflow-hidden transition-colors"
            >
              <div className="relative z-10 max-w-2xl">
                {settings.certificatesPageBadge ? (
                  <span
                    style={{ color: settings.hoverAccentColor || "#a855f7" }}
                    className="text-xs font-semibold uppercase tracking-widest"
                  >
                    {settings.certificatesPageBadge}
                  </span>
                ) : null}
                {settings.certificatesPageTitle ? (
                  <h1
                    style={{ color: settings.headerTextColor || "#ffffff" }}
                    className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl"
                  >
                    {settings.certificatesPageTitle}
                  </h1>
                ) : null}
                {settings.certificatesPageDesc ? (
                  <p
                    style={{ color: settings.descTextColor || "#a1a1aa" }}
                    className="mt-4 text-base leading-relaxed"
                  >
                    {settings.certificatesPageDesc}
                  </p>
                ) : null}
              </div>
            </div>
          </FadeInCard>
        ) : null}

        {/* Certificates Grid */}
        {certificatesList.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-zinc-900/50 border border-dashed border-white/10 mb-12">
            <p className="text-sm opacity-70">
              Belum ada sertifikat yang ditambahkan. Silakan tambahkan sertifikat melalui Admin Panel.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {certificatesList.map((cert, idx) => (
            <FadeInCard key={cert.id} delay={200 + idx * 80} direction="up" className="h-full">
              <div
                onClick={() => setSelectedCert(cert)}
                style={{
                  backgroundColor: cert.boxBgColor || "#18181b",
                }}
                className="group relative flex flex-col h-full justify-between overflow-hidden rounded-2xl p-6 border border-white/10 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-lg hover:border-white/20"
              >
                <div className="relative z-10">
                  {/* Category & Date */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span
                      style={{
                        color: settings.hoverAccentColor || "#a855f7",
                        borderColor: `${settings.hoverAccentColor || "#a855f7"}40`,
                        backgroundColor: `${settings.hoverAccentColor || "#a855f7"}15`,
                      }}
                      className="inline-block rounded-full px-3 py-1 text-xs font-semibold border"
                    >
                      {cert.category}
                    </span>
                    <span
                      style={{ color: settings.descTextColor || "#a1a1aa" }}
                      className="text-xs font-mono opacity-80"
                    >
                      {cert.date}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    style={{ color: settings.headerTextColor || "#ffffff" }}
                    className="text-lg font-bold transition-colors group-hover:opacity-90"
                  >
                    {cert.title}
                  </h3>

                  {/* Issuer */}
                  {cert.issuer && (
                    <p
                      style={{ color: settings.descTextColor || "#a1a1aa" }}
                      className="mt-1 text-xs font-medium"
                    >
                      Issued by <strong style={{ color: settings.headerTextColor || "#ffffff" }}>{cert.issuer}</strong>
                    </p>
                  )}

                  {/* Description snippet */}
                  {cert.description && (
                    <p
                      style={{ color: settings.descTextColor || "#a1a1aa" }}
                      className="mt-3 text-xs leading-relaxed line-clamp-3 opacity-90"
                    >
                      {cert.description}
                    </p>
                  )}

                  {/* Certificate Image - 4:3 Scale */}
                  {cert.image && (
                    <div className="mt-4 overflow-hidden rounded-xl bg-zinc-950 transition duration-200 ease-out group-hover:scale-102 border border-white/10">
                      <img
                        src={formatImageUrl(cert.image, "certificate")}
                        alt={cert.title}
                        className="rounded-xl object-cover object-center w-full aspect-[4/3] overflow-hidden"
                      />
                    </div>
                  )}
                </div>

                {/* Card Footer Click Indicator */}
                <div className="relative z-10 mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                  <span
                    style={{ color: settings.descTextColor || "#a1a1aa" }}
                    className="text-xs font-mono opacity-70"
                  >
                    {cert.credentialId}
                  </span>
                  <span
                    style={{ color: settings.hoverAccentColor || "#a855f7" }}
                    className="inline-flex items-center gap-1 text-xs font-semibold group-hover:translate-x-1 transition-transform"
                  >
                    View Details &rarr;
                  </span>
                </div>
              </div>
            </FadeInCard>
          ))}
        </div>
        )}

        {/* Footer */}
        <Footer />
      </main>

      {/* Certificate Modal */}
      <CertificateModal
        certificate={selectedCert}
        isOpen={!!selectedCert}
        onClose={() => setSelectedCert(null)}
      />
    </div>
  );
}
