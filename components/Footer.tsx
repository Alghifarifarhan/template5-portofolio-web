"use client";

import { useSite } from "@/context/SiteContext";

export default function Footer() {
  const { settings, settingsLoaded } = useSite();
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      id: "twitter",
      name: "Twitter / X",
      url: settings.socialTwitter,
      icon: (
        <svg
          className="bi bi-twitter-x inline-block size-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z" />
        </svg>
      ),
      hoverColor: "hover:text-zinc-800 dark:hover:text-white",
    },
    {
      id: "facebook",
      name: "Facebook",
      url: settings.socialFacebook,
      icon: (
        <svg
          className="icon-facebook inline-block size-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.378 14.192 5 15.115 5H18V0h-3.808C10.596 0 9 1.583 9 4.615V8z"></path>
        </svg>
      ),
      hoverColor: "hover:text-[#1877f2]",
    },
    {
      id: "instagram",
      name: "Instagram",
      url: settings.socialInstagram,
      icon: (
        <svg
          className="icon-instagram inline-block size-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"></path>
        </svg>
      ),
      hoverColor: "hover:text-[#405de6]",
    },
    {
      id: "github",
      name: "GitHub",
      url: settings.socialGithub,
      icon: (
        <svg
          className="icon-github inline-block size-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"></path>
        </svg>
      ),
      hoverColor: "hover:text-[#333] dark:hover:text-zinc-50",
    },
    {
      id: "dribbble",
      name: "Dribbble",
      url: settings.socialDribbble,
      icon: (
        <svg
          className="icon-dribbble inline-block size-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12 12-5.373 12-12S18.628 0 12 0zm9.885 11.441c-2.575-.422-4.943-.445-7.103-.073a42.153 42.153 0 00-.767-1.68c2.31-1 4.165-2.358 5.548-4.082a9.863 9.863 0 012.322 5.835zm-3.842-7.282c-1.205 1.554-2.868 2.783-4.986 3.68a46.287 46.287 0 00-3.488-5.438A9.894 9.894 0 0112 2.087c2.275 0 4.368.779 6.043 2.072zM7.527 3.166a44.59 44.59 0 013.537 5.381c-2.43.715-5.331 1.082-8.684 1.105a9.931 9.931 0 015.147-6.486zM2.087 12l.013-.256c3.849-.005 7.169-.448 9.95-1.322.233.475.456.952.67 1.432-3.38 1.057-6.165 3.222-8.337 6.48A9.865 9.865 0 012.087 12zm3.829 7.81c1.969-3.088 4.482-5.098 7.598-6.027a39.137 39.137 0 012.043 7.46c-3.349 1.291-6.953.666-9.641-1.433zm11.586.43a41.098 41.098 0 00-1.92-6.897c1.876-.265 3.94-.196 6.199.196a9.923 9.923 0 01-4.279 6.701z"></path>
        </svg>
      ),
      hoverColor: "hover:text-[#ea4c89]",
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      url: settings.socialLinkedin,
      icon: (
        <svg
          className="icon-linkedin inline-block size-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.69 1.69 0 1 0 0-3.38 1.69 1.69 0 0 0 0 3.38m1.39 9.74v-8.37H5.07v8.37h2.78z" />
        </svg>
      ),
      hoverColor: "hover:text-[#0077b5]",
    },
  ];

  const activeSocials = socialLinks.filter(
    (item) => item.url && item.url.trim().length > 0 && item.url !== "#"
  );

  return (
    <footer
      style={{
        backgroundColor: settings.footerBgColor || "transparent",
        ...(settings.footerBgColor
          ? {
              padding: "1.75rem",
              borderRadius: "1rem",
              border: "1px solid rgba(255,255,255,0.1)",
            }
          : {}),
      }}
      className="flex flex-col gap-6 py-7 text-center text-sm md:col-span-12 md:flex-row-reverse md:justify-between md:gap-0 md:text-left transition-colors"
    >
      {activeSocials.length > 0 ? (
        <nav className="flex items-center justify-center gap-4">
          {activeSocials.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.name}
              style={{ color: settings.descTextColor || "#a1a1aa" }}
              className="hover:opacity-75 transition-opacity"
            >
              {item.icon}
            </a>
          ))}
        </nav>
      ) : (
        <div />
      )}
      <div style={{ color: settings.descTextColor || "#a1a1aa" }} className="opacity-80">
        {settings.footerName ? (
          <span style={{ color: settings.headerTextColor || "#ffffff" }} className="font-medium">
            {settings.footerName} © {currentYear}
          </span>
        ) : (
          <span>© {currentYear}</span>
        )}
        {settings.footerCopyright ? (
          <p className="mt-1">{settings.footerCopyright}</p>
        ) : (
          <p className="mt-1">All rights reserved.</p>
        )}
      </div>
    </footer>
  );
}
