"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProjectModal from "@/components/ProjectModal";
import { projectsData, Project } from "@/data/projects";
import FadeInCard from "@/components/FadeInCard";
import { formatImageUrl } from "@/lib/googleDrive";
import { useSite, REALTIME_SYNC_CHANNEL } from "@/context/SiteContext";

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

export default function ProjectsPage() {
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
      console.warn("Projects sync error:", e);
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

  const hasHeaderContent =
    settings.projectsPageBadge || settings.projectsPageTitle || settings.projectsPageDesc;

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

        {/* Hero Title */}
        {hasHeaderContent ? (
          <FadeInCard delay={100} direction="up" className="my-8">
            <div
              style={{
                backgroundColor: settings.projectsHeaderBgColor || "#18181b",
              }}
              className="rounded-2xl border border-white/10 p-8 md:p-12 shadow-xl relative overflow-hidden transition-colors"
            >
              <div className="relative z-10 max-w-2xl">
                {settings.projectsPageBadge ? (
                  <span
                    style={{ color: settings.hoverAccentColor || "#a855f7" }}
                    className="text-xs font-semibold uppercase tracking-widest"
                  >
                    {settings.projectsPageBadge}
                  </span>
                ) : null}
                {settings.projectsPageTitle ? (
                  <h1
                    style={{ color: settings.headerTextColor || "#ffffff" }}
                    className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl"
                  >
                    {settings.projectsPageTitle}
                  </h1>
                ) : null}
                {settings.projectsPageDesc ? (
                  <p
                    style={{ color: settings.descTextColor || "#a1a1aa" }}
                    className="mt-4 text-base leading-relaxed"
                  >
                    {settings.projectsPageDesc}
                  </p>
                ) : null}
              </div>
            </div>
          </FadeInCard>
        ) : null}

        {/* Projects Grid */}
        {projectsList.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-zinc-900/50 border border-dashed border-white/10 mb-12">
            <p className="text-sm opacity-70">
              Belum ada proyek yang ditambahkan. Silakan tambahkan proyek melalui Admin Panel.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
            {projectsList.map((project, idx) => (
              <FadeInCard key={project.id} delay={200 + idx * 80} direction="up" className="h-full">
                <div
                  onClick={() => setSelectedProject(project)}
                  style={{
                    backgroundColor: project.boxBgColor || "#18181b",
                  }}
                  className="group relative flex flex-col h-full justify-between overflow-hidden rounded-2xl p-6 border border-white/10 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-lg hover:border-white/20"
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

                  {project.tools &&
                    project.tools.filter((tool) => tool && tool.trim().length > 0).length > 0 && (
                      <div className="relative z-10 mt-4 flex flex-wrap gap-1.5 pt-4 border-t border-white/10">
                        {project.tools
                          .filter((tool) => tool && tool.trim().length > 0)
                          .map((tool, idx) => (
                            <span
                              key={idx}
                              style={{
                                color: settings.descTextColor || "#a1a1aa",
                                backgroundColor: "rgba(255,255,255,0.06)",
                              }}
                              className="rounded-md px-2 py-0.5 text-[11px] font-medium border border-white/10"
                            >
                              {tool}
                            </span>
                          ))}
                      </div>
                    )}

                  {/* Optional External Link Button */}
                  {project.link && (
                    <div className="relative z-10 mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-3">
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
        </div>
        )}

        {/* Footer */}
        <Footer />
      </main>

      {/* Project Modal */}
      <ProjectModal
        project={selectedProject}
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
}
