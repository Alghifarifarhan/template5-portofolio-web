import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteProvider } from "@/context/SiteContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://your-portfolio.web.app"
  ),
  title: "Portfolio",
  description: "Personal portfolio website built with Next.js, React, TypeScript, and Tailwind CSS.",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/assets/olifyhub.png", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", type: "image/png" },
    ],
    shortcut: "/icon.png",
  },
  openGraph: {
    title: "Portfolio",
    description: "Personal portfolio website built with Next.js, React, TypeScript, and Tailwind CSS.",
    images: [
      {
        url: "/opengraph-image.png",
        width: 180,
        height: 180,
        alt: "Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Portfolio",
    description: "Personal portfolio website built with Next.js, React, TypeScript, and Tailwind CSS.",
    images: ["/twitter-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable}`}>
      <head>
        <link rel="icon" href="/icon.png" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body className="antialiased">
        <SiteProvider>{children}</SiteProvider>
      </body>
    </html>
  );
}
