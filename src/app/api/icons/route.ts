import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { resolveIconName } from "@/config/aliases";

export const dynamic = "force-dynamic";

const ICON_DIR = path.join(process.cwd(), "icons");

function getLocalIconSvg(name: string): string | null {
  const cleanName = name.trim().toLowerCase();
  const canonicalName = resolveIconName(cleanName);

  // 1. Direct match with canonical alias or exact name
  const exactPath = path.join(ICON_DIR, `${canonicalName}.svg`);
  if (fs.existsSync(exactPath)) {
    return fs.readFileSync(exactPath, "utf-8");
  }

  // 2. Direct match with raw name
  const rawPath = path.join(ICON_DIR, `${cleanName}.svg`);
  if (fs.existsSync(rawPath)) {
    return fs.readFileSync(rawPath, "utf-8");
  }

  // 3. Fallback scan for prefixed files (e.g. "java" -> "devicon--java.svg", "python" -> "material-icon-theme--python.svg")
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
      return fs.readFileSync(path.join(ICON_DIR, match), "utf-8");
    }
  }

  return null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const rawIcons = searchParams.get("i") || "";
  const iconNames = rawIcons.split(",").map((s) => s.trim()).filter(Boolean);
  const perLine = Math.max(1, parseInt(searchParams.get("perline") || "12", 10));
  const theme = searchParams.get("theme") || "dark";

  if (iconNames.length === 0) {
    return new NextResponse(
      "<svg xmlns='http://www.w3.org/2000/svg' width='200' height='50'><text x='10' y='30' fill='red'>Error: No icons provided (?i=...)</text></svg>",
      {
        status: 400,
        headers: { "Content-Type": "image/svg+xml" },
      }
    );
  }

  const iconSize = Math.max(16, Math.min(256, parseInt(searchParams.get("size") || "70", 10)));
  const gap = 14;
  const padding = 18;

  // Load requested icons from disk
  const loadedIcons: { svg: string; name: string }[] = [];
  for (const name of iconNames) {
    const svg = getLocalIconSvg(name);
    if (svg) {
      loadedIcons.push({ svg, name });
    }
  }

  if (loadedIcons.length === 0) {
    return new NextResponse(
      "<svg xmlns='http://www.w3.org/2000/svg' width='250' height='50'><text x='10' y='30' fill='red'>Error: None of the requested icons exist</text></svg>",
      {
        status: 404,
        headers: { "Content-Type": "image/svg+xml" },
      }
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

    // 1. Dynamic viewBox extraction (with width/height attributes fallback)
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

    // 2. Clean XML headers, comments, outer <svg> wrappers & hardcoded background rectangles
    let cleanSvg = svg
      .replace(/<\?xml.*?\?>/gi, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<svg[^>]*>/i, "")
      .replace(/<\/svg>/gi, "")
      .trim();

    // Strip unwanted background <rect> elements (e.g. width="100%" or full bleed rectangles)
    cleanSvg = cleanSvg
      .replace(/<rect[^>]*width=["']100%["'][^>]*\/>/gi, "")
      .replace(/<rect[^>]*height=["']100%["'][^>]*\/>/gi, "")
      .replace(/<rect[^>]*width=["']100%["'][^>]*>.*?<\/rect>/gi, "");

    // 3. Resolve dynamic fills for dark/light themes (currentColor & dark fills)
    if (theme === "dark") {
      cleanSvg = cleanSvg
        .replace(/fill=["']currentColor["']/gi, `fill="${iconFillColor}"`)
        .replace(/fill=["']#000000["']/gi, `fill="${iconFillColor}"`)
        .replace(/fill=["']#000["']/gi, `fill="${iconFillColor}"`)
        .replace(/fill=["']#222f3e["']/gi, `fill="${iconFillColor}"`)
        .replace(/fill=["']#232f3e["']/gi, `fill="${iconFillColor}"`);
    } else {
      cleanSvg = cleanSvg
        .replace(/fill=["']currentColor["']/gi, `fill="${iconFillColor}"`)
        .replace(/fill=["']#ffffff["']/gi, `fill="${iconFillColor}"`)
        .replace(/fill=["']#fff["']/gi, `fill="${iconFillColor}"`);
    }

    // 4. Encapsulate in nested <svg> viewport with exact viewBox & xMidYMid meet centering
    innerElements += `<svg x="${x}" y="${y}" width="${iconSize}" height="${iconSize}" viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet" fill="${iconFillColor}">${cleanSvg}</svg>`;
  });

  const finalSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="100%" height="100%" rx="12" fill="${bgColor}" />
      ${innerElements}
    </svg>
  `.trim();

  return new NextResponse(finalSvg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}