import path from "path";

/**
 * Canonical root directory for locally-served SVG icon assets.
 * Shared by `/api/icons` and `/api/icons/list` routes.
 */
export const ICON_DIR = path.join(process.cwd(), "icons");

// ─── Rate Limiting Defaults ────────────────────────────────────
export const DEFAULT_RATE_LIMIT = 180;
export const DEFAULT_RATE_WINDOW_MS = 60 * 1000;

// ─── Request Boundary Constants ────────────────────────────────
export const MAX_ICONS_PER_REQUEST = 50;
export const MAX_URI_LENGTH = 4096;

// ─── Shared Security Headers ──────────────────────────────────
/** Common security headers applied to all API responses. */
export const BASE_SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Cache-Control":
    "public, max-age=60, s-maxage=3600, stale-while-revalidate=86400",
} as const;

/** Security headers for SVG image API responses. */
export const SVG_SECURITY_HEADERS = {
  ...BASE_SECURITY_HEADERS,
  "Content-Type": "image/svg+xml; charset=utf-8",
  "Content-Security-Policy":
    "default-src 'none'; style-src 'unsafe-inline'; sandbox",
  Vary: "Accept-Encoding",
} as const;

/** Security headers for JSON list API responses. */
export const JSON_SECURITY_HEADERS = {
  ...BASE_SECURITY_HEADERS,
  "Content-Type": "application/json; charset=utf-8",
} as const;
