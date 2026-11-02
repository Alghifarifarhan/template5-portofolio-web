"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { certificatesData, Certificate } from "@/data/certificates";
import { formatImageUrl } from "@/lib/googleDrive";
import { useSite, REALTIME_SYNC_CHANNEL } from "@/context/SiteContext";
import FadeInCard from "./FadeInCard";
import CertificateModal from "./CertificateModal";

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

export default function CertificatesSection() {
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
      console.warn("Firestore certificates sync error:", e);
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

  return (
    <>
      <div id="certificates" className="scroll-mt-6 col-span-1 md:col-span-12 hidden" />
      {certificatesList.map((cert, index) => (
        <FadeInCard
          key={cert.id}
          delay={300 + index * 100}
          direction="up"
          className="col-span-1 md:col-span-4 h-full"
        >
          <div
            onClick={() => setSelectedCert(cert)}
            style={{
              backgroundColor: cert.boxBgColor || "#18181b",
            }}
            className="group relative flex flex-col h-full justify-between overflow-hidden rounded-2xl p-6 border border-white/10 cursor-pointer transition-all duration-200 shadow-xs hover:shadow-lg hover:border-white/20"
          >
            <div className="relative z-10">
              {/* Category & Date */}
              <div className="flex items-center justify-between gap-2 mb-4">
                {cert.category ? (
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
                ) : <span />}
                {cert.date && (
                  <span
                    style={{ color: settings.descTextColor || "#a1a1aa" }}
                    className="text-xs font-mono opacity-80"
                  >
                    {cert.date}
                  </span>
                )}
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

              {/* Certificate Image - 4:3 Scale for full visibility */}
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

            {/* Card Footer */}
            <div className="relative z-10 mt-6 flex items-center justify-between border-t border-white/10 pt-4">
              <span
                style={{ color: settings.descTextColor || "#a1a1aa" }}
                className="text-xs font-mono opacity-70"
              >
                {cert.credentialId || ""}
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

      {/* Certificate Detail Modal Popup */}
      <CertificateModal
        certificate={selectedCert}
        isOpen={!!selectedCert}
        onClose={() => setSelectedCert(null)}
      />
    </>
  );
}
