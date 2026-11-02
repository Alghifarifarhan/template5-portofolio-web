/**
  Helper utility to parse and format Google Drive links or standard image paths into direct displayable image URLs.
  Includes auto-scaling & center-cropping presets for default image resolutions:
  - HERO: 1:1 Square (800x800 px)
  - PROJECT: 1:1 Square (800x800 px)
  - CERTIFICATE: 4:3 / 1:1 Square (600x600 px)
 */
export type ImagePreset = "hero" | "project" | "certificate" | "default";

export function formatImageUrl(url?: string | null, preset: ImagePreset = "default"): string {
  if (!url || typeof url !== "string" || !url.trim()) {
    return "";
  }

  const trimmed = url.trim();

  // Determine Google CDN resize & center-crop parameter based on image preset
  let cdnParam = "";
  if (preset === "hero") {
    cdnParam = "=w800-h800-c";
  } else if (preset === "project") {
    cdnParam = "=w1280-h720-c";
  } else if (preset === "certificate") {
    cdnParam = "=w800-h600-c";
  }

  // Handle standard relative paths or external non-drive URLs directly
  if (trimmed.startsWith("/") || (!trimmed.includes("drive.google.com") && !trimmed.includes("googleusercontent.com"))) {
    return trimmed;
  }

  let fileId = "";

  // Check pattern: drive.google.com/file/d/FILE_ID/...
  const matchFileD = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFileD && matchFileD[1]) {
    fileId = matchFileD[1];
  }

  // Check pattern: drive.google.com/...id=FILE_ID
  if (!fileId) {
    const matchIdParam = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (matchIdParam && matchIdParam[1]) {
      fileId = matchIdParam[1];
    }
  }

  // Check pattern: googleusercontent.com/d/FILE_ID
  if (!fileId) {
    const matchLh3 = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (matchLh3 && matchLh3[1]) {
      fileId = matchLh3[1];
    }
  }

  if (fileId) {
    const cleanId = fileId.split("=")[0];
    return `https://lh3.googleusercontent.com/d/${cleanId}${cdnParam}`;
  }

  return trimmed;
}
