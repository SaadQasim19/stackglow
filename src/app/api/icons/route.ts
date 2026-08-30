import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { resolveIconName } from "@/config/aliases";
import {
  isValidIconSlug,
  isPathSafe,
  sanitizeNumericParam,
  sanitizeEnumParam,
} from "@/lib/security";
import { sanitizeSvgContent } from "@/lib/svg-sanitizer";
import { checkRateLimit } from "@/lib/rate-limiter";

export const dynamic = "force-dynamic";

const ICON_DIR = path.join(process.cwd(), "icons");

function getLocalIconSvg(name: string): string | null {
  const cleanName = name.trim().toLowerCase();

  // 1. Validate slug safety (reject directory traversal, null bytes, etc.)
  if (!isValidIconSlug(cleanName)) {
    return null;
  }

  const canonicalName = resolveIconName(cleanName);
  if (!isValidIconSlug(canonicalName)) {
    return null;
  }

  // 2. Direct match with canonical alias or exact name
  const exactPath = path.join(ICON_DIR, `${canonicalName}.svg`);
  if (isPathSafe(exactPath, ICON_DIR) && fs.existsSync(exactPath)) {
    return fs.readFileSync(exactPath, "utf-8");
  }

  // 3. Direct match with raw name
  const rawPath = path.join(ICON_DIR, `${cleanName}.svg`);
  if (isPathSafe(rawPath, ICON_DIR) && fs.existsSync(rawPath)) {
    return fs.readFileSync(rawPath, "utf-8");
  }

  // 4. Fallback scan for prefixed files (e.g. "java" -> "devicon--java.svg")
  if (fs.existsSync(ICON_DIR)) {
    const files = fs.readdirSync(ICON_DIR);
    const match = files.find((file) => {
      if (!file.endsWith(".svg")) return false;
      const base = file.replace(/\.svg$/i, "").toLowerCase();
      return (
        base === cleanName ||
        base === canonicalName.toLowerCase() ||
        base.endsWith(`--${cleanName}`) ||
        base.endsWith(`--${canonicalName.toLowerCase()}`) ||
        base.endsWith(`--${cleanName}-light`) ||
        base.endsWith(`--${cleanName}-dark`) ||
        base.endsWith(`--${cleanName}-icon`) ||
        base.endsWith(`--${canonicalName.toLowerCase()}-light`) ||
        base.endsWith(`--${canonicalName.toLowerCase()}-dark`) ||
        base.endsWith(`--${canonicalName.toLowerCase()}-icon`)
      );
    });

    if (match) {
      const matchPath = path.join(ICON_DIR, match);
      if (isPathSafe(matchPath, ICON_DIR) && fs.existsSync(matchPath)) {
        return fs.readFileSync(matchPath, "utf-8");
      }
    }
  }

  return null;
}

const SECURITY_HEADERS = {
  "Content-Type": "image/svg+xml; charset=utf-8",
  "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Cache-Control": "public, max-age=60, s-maxage=3600, stale-while-revalidate=86400",
  "Vary": "Accept-Encoding",
};

export async function GET(req: NextRequest) {
  // 1. Rate Limiting Protection (DoS / Scraping defense)
  const rateLimit = checkRateLimit(req, 180, 60 * 1000);
  if (!rateLimit.allowed) {
    return new NextResponse(
      `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="60" viewBox="0 0 320 60"><rect width="100%" height="100%" rx="8" fill="#1e1e2e"/><text x="16" y="36" fill="#f38ba8" font-family="monospace" font-size="13">429: Too Many Requests (Rate Limited)</text></svg>`,
      {
        status: 429,
        headers: {
          ...SECURITY_HEADERS,
          "Retry-After": rateLimit.reset.toString(),
          "X-RateLimit-Limit": "180",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": rateLimit.reset.toString(),
        },
      }
    );
  }

  // 2. URI Length Validation (Buffer Overflow / ReDoS defense)
  if (req.url.length > 4096) {
    return new NextResponse(
      `<svg xmlns="http://www.w3.org/2000/svg" width="260" height="50"><text x="10" y="30" fill="red" font-family="monospace">414: URI Too Long</text></svg>`,
      { status: 414, headers: SECURITY_HEADERS }
    );
  }

  const { searchParams } = new URL(req.url);

  // 3. Input Sanitization & Bounds Checking
  const rawIcons = searchParams.get("i") || "";
  const iconNames = rawIcons
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 50); // Hard cap at maximum 50 icons per combined badge

  if (iconNames.length === 0) {
    return new NextResponse(
      `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="50"><text x="10" y="30" fill="red" font-family="monospace">Error: No icons provided (?i=...)</text></svg>`,
      { status: 400, headers: SECURITY_HEADERS }
    );
  }

  const perLine = sanitizeNumericParam(searchParams.get("perline"), 12, 1, 30);
  const iconSize = sanitizeNumericParam(searchParams.get("size"), 70, 16, 256);
  const theme = sanitizeEnumParam(searchParams.get("theme"), "dark", ["dark", "light"] as const);

  const gap = 14;
  const padding = 18;

  // 4. Safe Icon Resolution from Disk
  const loadedIcons: { svg: string; name: string }[] = [];
  for (const name of iconNames) {
    const rawSvg = getLocalIconSvg(name);
    if (rawSvg) {
      // 5. Multi-Pass SVG Sanitization (Strips XSS, XXE, <script>, and malicious protocols)
      const sanitized = sanitizeSvgContent(rawSvg);
      if (sanitized) {
        loadedIcons.push({ svg: sanitized, name });
      }
    }
  }

  if (loadedIcons.length === 0) {
    return new NextResponse(
      `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="50"><text x="10" y="30" fill="red" font-family="monospace">Error: None of requested icons exist</text></svg>`,
      { status: 404, headers: SECURITY_HEADERS }
    );
  }

  const total = loadedIcons.length;
  const cols = Math.min(total, perLine);
  const rows = Math.ceil(total / perLine);

  const width = cols * iconSize + (cols - 1) * gap + padding * 2;
  const height = rows * iconSize + (rows - 1) * gap + padding * 2;

  const bgColor = theme === "dark" ? "#0d1117" : "#ffffff";
  const iconFillColor = theme === "dark" ? "#ffffff" : "#0d1117";

  let innerElements = "";
  loadedIcons.forEach(({ svg }, index) => {
    const col = index % perLine;
    const row = Math.floor(index / perLine);
    const x = padding + col * (iconSize + gap);
    const y = padding + row * (iconSize + gap);

    // Dynamic viewBox extraction
    let viewBox = "0 0 24 24";
    const viewBoxMatch = svg.match(/viewBox=["']([^"']+)["']/i);
    if (viewBoxMatch && viewBoxMatch[1]) {
      viewBox = viewBoxMatch[1];
    } else {
      const widthMatch = svg.match(/width=["']([0-9.]+)(px)?["']/i);
      const heightMatch = svg.match(/height=["']([0-9.]+)(px)?["']/i);
      if (widthMatch && heightMatch) {
        viewBox = `0 0 ${widthMatch[1]} ${heightMatch[1]}`;
      }
    }

    // Clean outer SVG tags
    let cleanSvg = svg
      .replace(/<svg[^>]*>/i, "")
      .replace(/<\/svg>/gi, "")
      .trim();

    // Strip unwanted background <rect> elements
    cleanSvg = cleanSvg
      .replace(/<rect[^>]*width=["']100%["'][^>]*\/>/gi, "")
      .replace(/<rect[^>]*height=["']100%["'][^>]*\/>/gi, "")
      .replace(/<rect[^>]*width=["']100%["'][^>]*>.*?<\/rect>/gi, "");

    // Resolve dynamic fills strictly for currentColor
    cleanSvg = cleanSvg.replace(/fill=["']currentColor["']/gi, `fill="${iconFillColor}"`);

    // Encapsulate in isolated nested SVG viewport
    innerElements += `<svg x="${x}" y="${y}" width="${iconSize}" height="${iconSize}" viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet">${cleanSvg}</svg>`;
  });

  const finalSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="100%" height="100%" rx="12" fill="${bgColor}" />
      ${innerElements}
    </svg>
  `.trim();

  return new NextResponse(finalSvg, {
    headers: {
      ...SECURITY_HEADERS,
      "X-RateLimit-Limit": "180",
      "X-RateLimit-Remaining": rateLimit.remaining.toString(),
      "X-RateLimit-Reset": rateLimit.reset.toString(),
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: SECURITY_HEADERS,
  });
}