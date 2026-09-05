import path from "path";

/** Pre-compiled regex: only lowercase/uppercase alphanumeric, hyphens, and underscores. */
const SLUG_REGEX = /^[a-zA-Z0-9_-]+$/;

/**
 * Validates that an icon slug contains only safe, alphanumeric characters, hyphens, and underscores.
 * Disallows path traversal sequences (../), slashes, null bytes, and control characters.
 * Length is restricted to 1-64 characters.
 */
export function isValidIconSlug(slug: string): boolean {
  if (!slug || typeof slug !== "string") return false;
  const trimmed = slug.trim();
  if (trimmed.length === 0 || trimmed.length > 64) return false;
  return SLUG_REGEX.test(trimmed);
}

/**
 * Validates that a resolved file path is strictly contained within a trusted directory boundary.
 * Prevents Directory Traversal (LFI / Path Injection).
 */
export function isPathSafe(targetPath: string, rootDir: string): boolean {
  try {
    const resolvedRoot = path.resolve(rootDir);
    const resolvedTarget = path.resolve(targetPath);
    // Ensure the resolved target starts with the root directory followed by a path separator
    return resolvedTarget.startsWith(resolvedRoot + path.sep);
  } catch {
    return false;
  }
}

/**
 * Escapes characters for safe inclusion within HTML / XML attributes.
 * Prevents attribute breakout and Cross-Site Scripting (XSS).
 */
export function escapeHtmlAttr(str: string): string {
  if (!str || typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Sanitizes a numeric query parameter and clamps it within an acceptable range.
 */
export function sanitizeNumericParam(
  value: string | null,
  defaultValue: number,
  min: number,
  max: number
): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || !Number.isFinite(parsed)) {
    return defaultValue;
  }
  return Math.max(min, Math.min(max, parsed));
}

/**
 * Validates a string query parameter against an allowlist.
 */
export function sanitizeEnumParam<T extends string>(
  value: string | null,
  defaultValue: T,
  allowedValues: readonly T[]
): T {
  if (!value) return defaultValue;
  const lower = value.trim().toLowerCase() as T;
  return allowedValues.includes(lower) ? lower : defaultValue;
}
