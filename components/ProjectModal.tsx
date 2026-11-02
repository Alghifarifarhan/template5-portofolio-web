import Modal from "./Modal";
import { Project } from "@/data/projects";
import { formatImageUrl } from "@/lib/googleDrive";
import { useSite } from "@/context/SiteContext";

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectModal({
  project,
  isOpen,
  onClose,
}: ProjectModalProps) {
  const { settings } = useSite();
  if (!project) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={project.title}>
      <div className="space-y-6">
        {/* Project Image Banner */}
        {project.image && (
          <div className="relative overflow-hidden rounded-xl bg-black/40 p-2 flex items-center justify-center border border-white/10 aspect-video max-h-[360px] w-full">
            <img
              src={formatImageUrl(project.image, "project")}
              alt={project.title}
              className="rounded-lg object-cover object-center w-full h-full max-h-[350px] overflow-hidden"
            />
          </div>
        )}

        {/* Metadata Grid */}
        {(project.category || project.client || project.date || project.subtitle) && (
          <div className="grid grid-cols-2 gap-4 rounded-xl bg-black/30 p-4 border border-white/10">
            {project.category && (
              <div>
                <span style={{ color: settings.descTextColor || "#a1a1aa" }} className="text-xs block opacity-80">Category</span>
                <span style={{ color: settings.headerTextColor || "#ffffff" }} className="text-sm font-semibold">
                  {project.category}
                </span>
              </div>
            )}
            {project.client && (
              <div>
                <span style={{ color: settings.descTextColor || "#a1a1aa" }} className="text-xs block opacity-80">Client</span>
                <span style={{ color: settings.headerTextColor || "#ffffff" }} className="text-sm font-semibold">
                  {project.client}
                </span>
              </div>
            )}
            {project.date && (
              <div>
                <span style={{ color: settings.descTextColor || "#a1a1aa" }} className="text-xs block opacity-80">Timeline</span>
                <span style={{ color: settings.headerTextColor || "#ffffff" }} className="text-sm font-semibold">
                  {project.date}
                </span>
              </div>
            )}
            {project.subtitle && (
              <div>
                <span style={{ color: settings.descTextColor || "#a1a1aa" }} className="text-xs block opacity-80">Status / Tag</span>
                <span style={{ color: settings.hoverAccentColor || "#a855f7" }} className="text-sm font-semibold">
                  {project.subtitle}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        {project.description && (
          <div>
            <h5 style={{ color: settings.headerTextColor || "#ffffff" }} className="text-sm font-semibold uppercase tracking-wider">
              Project Overview
            </h5>
            <p style={{ color: settings.descTextColor || "#a1a1aa" }} className="mt-2 text-sm leading-relaxed">
              {project.description}
            </p>
          </div>
        )}

        {/* Highlights */}
        {project.highlights &&
          project.highlights.filter((item) => item && item.trim().length > 0).length > 0 && (
            <div>
              <h5 style={{ color: settings.headerTextColor || "#ffffff" }} className="text-sm font-semibold uppercase tracking-wider mb-2">
                Key Deliverables
              </h5>
              <ul style={{ color: settings.descTextColor || "#a1a1aa" }} className="space-y-1.5 text-sm">
                {project.highlights
                  .filter((item) => item && item.trim().length > 0)
                  .map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <svg
                        style={{ color: settings.hoverAccentColor || "#a855f7" }}
                        className="size-5 shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
              </ul>
            </div>
          )}

        {/* Tools Used */}
        {project.tools &&
          project.tools.filter((tool) => tool && tool.trim().length > 0).length > 0 && (
            <div>
              <h5 style={{ color: settings.headerTextColor || "#ffffff" }} className="text-sm font-semibold uppercase tracking-wider mb-2">
                Tools & Software
              </h5>
              <div className="flex flex-wrap gap-2">
                {project.tools
                  .filter((tool) => tool && tool.trim().length > 0)
                  .map((tool, idx) => (
                    <span
                      key={idx}
                      style={{
                        backgroundColor: "rgba(255,255,255,0.06)",
                        color: settings.descTextColor || "#a1a1aa",
                        borderColor: "rgba(255,255,255,0.12)",
                      }}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium border"
                    >
                      {tool}
                    </span>
                  ))}
              </div>
            </div>
          )}

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
          <div>
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: settings.hoverAccentColor || "#a855f7",
                  color: "#ffffff",
                }}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity"
              >
                <span>{project.linkText || "Visit Live Project"}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
          <button
            onClick={onClose}
            type="button"
            style={{
              backgroundColor: "rgba(255,255,255,0.08)",
              color: settings.headerTextColor || "#ffffff",
              borderColor: "rgba(255,255,255,0.15)",
            }}
            className="rounded-lg border px-5 py-2 text-sm font-medium hover:bg-white/15 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
