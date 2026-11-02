"use client";

import { useState } from "react";
import ResumeModal from "./ResumeModal";
import { useSite } from "@/context/SiteContext";
import { formatImageUrl } from "@/lib/googleDrive";
import FadeInCard from "./FadeInCard";

export default function HeroIntro() {
  const { settings, formattedPhotoUrl, mounted, recordResumeDownload, settingsLoaded } = useSite();
  const [isResumeOpen, setIsResumeOpen] = useState(false);

  const hasResumeLink = settings.heroResumeLink && settings.heroResumeLink.trim().length > 0;

  const handleResumeClick = () => {
    recordResumeDownload();
    if (hasResumeLink) {
      window.open(formatImageUrl(settings.heroResumeLink), "_blank", "noopener,noreferrer");
    } else {
      setIsResumeOpen(true);
    }
  };

  const btnStyle: React.CSSProperties = {
    backgroundColor: settings.buttonBgColor || "#ffffff",
    borderColor: settings.buttonBgColor || "#ffffff",
    color: settings.buttonTextColor || "#09090b",
  };

  const photoSrc = formattedPhotoUrl;
  const heroTitleText = settings.heroTitle;
  const heroBioText = settings.heroBio;
  const resumeBtnText = settings.heroResumeBtnText;

  return (
    <>
      {/* Photo Card */}
      <FadeInCard delay={100} direction="up" className="col-span-1 md:col-span-5 h-full">
        <div className="w-full h-full aspect-square overflow-hidden rounded-2xl bg-zinc-900 border border-white/10 shadow-md flex items-center justify-center">
          {photoSrc ? (
            <img
              src={photoSrc}
              alt={settings.logoText || "Profile Photo"}
              className="rounded-2xl object-cover object-center w-full h-full aspect-square max-w-full"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center text-zinc-600">
              <svg className="size-16 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs font-medium">Foto Profil Belum Diisi</span>
            </div>
          )}
        </div>
      </FadeInCard>
      {/* END Photo Card */}

      {/* Intro Card */}
      <FadeInCard delay={200} direction="up" className="col-span-1 md:col-span-7 h-full">
        <div
          style={{
            backgroundColor: settings.heroBoxBgColor || "#18181b",
          }}
          className="relative flex flex-col h-full overflow-hidden rounded-2xl p-8 sm:p-12 max-w-full border border-white/10 shadow-md transition-colors"
        >
          <div className="relative mt-auto z-10">
            {heroTitleText ? (
              <h1
                style={{ color: settings.headerTextColor || "#ffffff" }}
                className="text-3xl sm:text-4xl font-medium"
              >
                {heroTitleText}
              </h1>
            ) : null}
            {heroBioText ? (
              <h2
                style={{ color: settings.descTextColor || "#a1a1aa" }}
                className="mt-3 text-sm sm:text-base leading-relaxed"
              >
                {heroBioText}
              </h2>
            ) : null}

            {/* My Resume Button */}
            {resumeBtnText ? (
              <div className="mt-6">
                <button
                  onClick={handleResumeClick}
                  type="button"
                  style={btnStyle}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold shadow-xs hover:opacity-90 active:scale-98 transition-all duration-200 cursor-pointer border"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>{resumeBtnText}</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </FadeInCard>
      {/* END Intro Card */}

      {/* Resume Modal */}
      <ResumeModal
        isOpen={isResumeOpen}
        onClose={() => setIsResumeOpen(false)}
      />
    </>
  );
}
