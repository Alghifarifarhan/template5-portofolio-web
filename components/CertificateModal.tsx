import Modal from "./Modal";
import { Certificate } from "@/data/certificates";
import { formatImageUrl } from "@/lib/googleDrive";
import { useSite } from "@/context/SiteContext";

interface CertificateModalProps {
  certificate: Certificate | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CertificateModal({
  certificate,
  isOpen,
  onClose,
}: CertificateModalProps) {
  const { settings } = useSite();
  if (!certificate) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Certificate Details">
      <div className="space-y-6">
        {/* Top Header Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span
            style={{
              backgroundColor: `${settings.hoverAccentColor || "#a855f7"}20`,
              color: settings.hoverAccentColor || "#a855f7",
              borderColor: `${settings.hoverAccentColor || "#a855f7"}40`,
            }}
            className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold"
          >
            {certificate.category}
          </span>
          <span
            style={{ color: settings.descTextColor || "#a1a1aa" }}
            className="text-xs"
          >
            Issued:{" "}
            <strong style={{ color: settings.headerTextColor || "#ffffff" }}>
              {certificate.date}
            </strong>
          </span>
        </div>

        {/* Certificate Image Banner (if available) - 4:3 Scale */}
        {certificate.image && (
          <div className="relative overflow-hidden rounded-xl bg-black/40 p-2 flex items-center justify-center border border-white/10 aspect-[4/3] max-h-[420px] w-full">
            <img
              src={formatImageUrl(certificate.image, "certificate")}
              alt={certificate.title}
              className="rounded-lg object-contain object-center w-full h-full max-h-[410px] overflow-hidden"
            />
          </div>
        )}

        {/* Certificate Title & Issuer Banner */}
        <div
          style={{
            backgroundColor: certificate.boxBgColor || "#18181b",
          }}
          className="relative overflow-hidden rounded-xl p-6 shadow-md border border-white/10"
        >
          <div className="relative z-10">
            <div
              style={{ color: settings.headerTextColor || "#ffffff" }}
              className="text-xs font-medium uppercase tracking-wider opacity-90"
            >
              {certificate.issuer}
            </div>
            <h4
              style={{ color: settings.headerTextColor || "#ffffff" }}
              className="mt-2 text-2xl font-bold leading-tight"
            >
              {certificate.title}
            </h4>
            {certificate.credentialId && certificate.credentialId.trim().length > 0 && (
              <div
                style={{ color: settings.headerTextColor || "#ffffff" }}
                className="mt-4 flex items-center gap-2 text-xs font-mono bg-black/30 backdrop-blur-xs w-fit px-3 py-1.5 rounded-lg border border-white/20"
              >
                <span>ID: {certificate.credentialId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {certificate.description && (
          <div>
            <h5
              style={{ color: settings.headerTextColor || "#ffffff" }}
              className="text-sm font-semibold uppercase tracking-wider"
            >
              About This Certification
            </h5>
            <p
              style={{ color: settings.descTextColor || "#a1a1aa" }}
              className="mt-2 text-sm leading-relaxed"
            >
              {certificate.description}
            </p>
          </div>
        )}

        {/* Skills Verified */}
        {certificate.skills &&
          certificate.skills.filter((skill) => skill && skill.trim().length > 0).length > 0 && (
            <div>
              <h5
                style={{ color: settings.headerTextColor || "#ffffff" }}
                className="text-sm font-semibold uppercase tracking-wider mb-2"
              >
                Skills Verified
              </h5>
              <div className="flex flex-wrap gap-2">
                {certificate.skills
                  .filter((skill) => skill && skill.trim().length > 0)
                  .map((skill, idx) => (
                    <span
                      key={idx}
                      style={{
                        backgroundColor: "rgba(255,255,255,0.06)",
                        color: settings.descTextColor || "#a1a1aa",
                        borderColor: "rgba(255,255,255,0.12)",
                      }}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium border"
                    >
                      {skill}
                    </span>
                  ))}
              </div>
            </div>
          )}

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            type="button"
            style={{
              backgroundColor: "rgba(255,255,255,0.08)",
              color: settings.headerTextColor || "#ffffff",
              borderColor: "rgba(255,255,255,0.15)",
            }}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-white/15 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
