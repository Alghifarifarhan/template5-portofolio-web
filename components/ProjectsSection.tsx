"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { projectsData, Project } from "@/data/projects";
import { formatImageUrl } from "@/lib/googleDrive";
import { useSite, REALTIME_SYNC_CHANNEL } from "@/context/SiteContext";
import FadeInCard from "./FadeInCard";
import ProjectModal from "./ProjectModal";

const sortNewestFirst = (items: Project[]): Project[] => {
  return [...items].sort((a, b) => {
    const timeA =
      a.createdAt ||
      (typeof a.id === "string" && a.id.startsWith("proj_")
        ? parseInt(a.id.replace("proj_", "")) || 0
        : 0);
    const timeB =
      b.createdAt ||
      (typeof b.id === "string" && a.id.startsWith("proj_")
        ? parseInt(b.id.replace("proj_", "")) || 0
        : 0);
    return timeB - timeA;
  });
};

export default function ProjectsSection() {
  const { settings } = useSite();
  const [projectsList, setProjectsList] = useState<Project[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("portfolio_projects_cache");
        if (cached) {
          return sortNewestFirst(JSON.parse(cached));
        }
      } catch (e) {}
    }
    return [];
  });
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, "projects"), (snapshot) => {
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
      console.warn("Firestore projects sync error:", e);
    }
  }, []);

  // Multi-tab instant sync listener
  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;
    try {
      const channel = new BroadcastChannel(REALTIME_SYNC_CHANNEL);
      channel.onmessage = (event) => {
        const { type } = event.data || {};
        if (type === "projects" || type === "all") {
          try {
            const cached = localStorage.getItem("portfolio_projects_cache");
            if (cached) {
              setProjectsList(sortNewestFirst(JSON.parse(cached)));
            }
          } catch (e) {}
        }
      };
      return () => channel.close();
    } catch (e) {}
  }, []);

  return (
    <>
      <div id="projects" className="scroll-mt-6 col-span-1 md:col-span-12 hidden" />
      {projectsList.map((project, index) => (
        <FadeInCard
          key={project.id}
          delay={300 + index * 100}
          direction="up"
          className="col-span-1 md:col-span-4 h-full"
        >
          <div
            onClick={() => setSelectedProject(project)}
            style={{
              backgroundColor: project.boxBgColor || "#18181b",
            }}
            className="group relative flex flex-col h-full justify-between overflow-hidden rounded-2xl p-6 border border-white/10 cursor-pointer transition-all duration-200 shadow-xs hover:shadow-lg hover:border-white/20"
          >
            <div className="relative z-10">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3
                    style={{ color: settings.headerTextColor || "#ffffff" }}
                    className="text-lg font-bold transition-colors group-hover:opacity-90"
                  >
                    {project.title}
                  </h3>
                  {project.subtitle && (
                    <h4
                      style={{ color: settings.descTextColor || "#a1a1aa" }}
                      className="text-sm font-medium mt-0.5 opacity-80"
                    >
                      {project.subtitle}
                    </h4>
                  )}
                </div>

                <div
                  style={{ color: settings.hoverAccentColor || "#a855f7" }}
                  className="scale-90 opacity-70 transition duration-150 group-hover:scale-110 group-hover:opacity-100 shrink-0"
                  aria-hidden="true"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-6"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.75 12a.75.75 0 0 1 .75-.75h13.19l-5.47-5.47a.75.75 0 0 1 1.06-1.06l6.75 6.75a.75.75 0 0 1 0 1.06l-6.75 6.75a.75.75 0 1 1-1.06-1.06l5.47-5.47H4.5a.75.75 0 0 1-.75-.75Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              {/* Project Image - 16:9 Scale */}
              {project.image && (
                <div className="mt-6 transition duration-200 ease-out group-hover:scale-103 overflow-hidden rounded-xl bg-zinc-950 border border-white/10">
                  <img
                    src={formatImageUrl(project.image, "project")}
                    alt={project.title}
                    className="rounded-xl object-cover object-center w-full aspect-video overflow-hidden"
                  />
                </div>
              )}
            </div>

            {/* Optional External Link Button & Details Footer */}
            {project.link && (
              <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(project.link, "_blank", "noopener,noreferrer");
                  }}
                  style={{
                    backgroundColor: `${settings.hoverAccentColor || "#a855f7"}18`,
                    borderColor: `${settings.hoverAccentColor || "#a855f7"}40`,
                    color: settings.hoverAccentColor || "#a855f7",
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <span>{project.linkText || "Visit Project"}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
                <span
                  style={{ color: settings.hoverAccentColor || "#a855f7" }}
                  className="text-xs font-medium group-hover:translate-x-1 transition-transform"
                >
                  Details &rarr;
                </span>
              </div>
            )}
          </div>
        </FadeInCard>
      ))}

      {/* Project Detail Modal Popup */}
      <ProjectModal
        project={selectedProject}
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </>
  );
}
