"use client";

import Modal from "./Modal";
import { useSite } from "@/context/SiteContext";
import { formatImageUrl } from "@/lib/googleDrive";

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ResumeModal({ isOpen, onClose }: ResumeModalProps) {
  const { settings } = useSite();

  const handleDownload = (e: React.MouseEvent) => {
    if (settings.heroResumeLink && settings.heroResumeLink.trim().length > 0) {
      e.preventDefault();
      window.open(formatImageUrl(settings.heroResumeLink), "_blank", "noopener,noreferrer");
    } else {
      e.preventDefault();
      alert("Belum ada link PDF Resume yang dimasukkan di halaman Admin.");
    }
  };

  const displayName = settings.logoText || settings.footerName || "Resume / CV";
  const displayBio = settings.heroBio;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${displayName}`}>
      <div className="space-y-6">
        {/* Header Profile Summary */}
        <div className="rounded-xl bg-gradient-to-r from-purple-900 to-zinc-900 p-6 text-white shadow-md">
          <h4 className="text-2xl font-bold">{displayName}</h4>
          {settings.heroTitle ? (
            <p className="text-sm font-medium text-purple-300 mt-1">
              {settings.heroTitle}
            </p>
          ) : null}
          {displayBio ? (
            <p className="mt-2 text-xs leading-relaxed text-zinc-300">
              {displayBio}
            </p>
          ) : null}
        </div>

        <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800/60 p-5 text-center border border-zinc-200 dark:border-zinc-700/60">
          {settings.heroResumeLink ? (
            <p className="text-xs text-zinc-600 dark:text-zinc-300">
              Dokumen Resume / CV tersedia untuk diunduh langsung. Klik tombol di bawah untuk membuka file resume.
            </p>
          ) : (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Link Resume PDF belum dimasukkan. Anda dapat menambahkan link file Google Drive atau URL PDF pada menu Admin.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-zinc-200 dark:border-zinc-800">
          {settings.heroResumeLink ? (
            <a
              href="#"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 text-xs font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF Resume
            </a>
          ) : <span />}
          <button
            onClick={onClose}
            type="button"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
