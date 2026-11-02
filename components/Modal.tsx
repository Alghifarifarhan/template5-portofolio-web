import { useEffect, useState } from "react";
import { useSite } from "@/context/SiteContext";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const { settings } = useSite();
  const [isRendered, setIsRendered] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    let animTimer: NodeJS.Timeout;
    let unmountTimer: NodeJS.Timeout;

    if (isOpen) {
      setIsRendered(true);
      document.body.style.overflow = "hidden";
      animTimer = setTimeout(() => {
        setAnimate(true);
      }, 20);
    } else {
      setAnimate(false);
      document.body.style.overflow = "unset";
      if (isRendered) {
        unmountTimer = setTimeout(() => {
          setIsRendered(false);
        }, 300);
      }
    }

    return () => {
      clearTimeout(animTimer);
      clearTimeout(unmountTimer);
    };
  }, [isOpen, isRendered]);

  // Always clean up body overflow on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isRendered) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 ${
        animate ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* Backdrop overlay with fade in/out animation */}
      <div
        className={`fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300 ease-in-out ${
          animate ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal dialog box with scale & opacity entrance and exit animation */}
      <div
        style={{
          backgroundColor: settings.bgWebsiteColor || "#09090b",
          color: settings.descTextColor || "#a1a1aa",
          borderColor: "rgba(255,255,255,0.12)",
        }}
        className={`relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-6 sm:p-8 shadow-2xl transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1) border transform ${
          animate
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
        }`}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h3
            style={{ color: settings.headerTextColor || "#ffffff" }}
            className="text-xl font-semibold"
          >
            {title || "Details"}
          </h3>
          <button
            onClick={onClose}
            type="button"
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-all duration-200 hover:rotate-90 cursor-pointer active:scale-90"
            aria-label="Close modal"
          >
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
          </button>
        </div>

        {/* Modal content body */}
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}


