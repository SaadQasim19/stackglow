import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { resolveIconName } from "@/config/aliases";

const ICON_DIR = path.join(process.cwd(), "icons");

function getLocalIconSvg(name: string): string | null {
  const canonicalName = resolveIconName(name);
  const filePath = path.join(ICON_DIR, `${canonicalName}.svg`);
  
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, "utf-8");
  }
  return null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  const rawIcons = searchParams.get("i") || "";
  const iconNames = rawIcons.split(",").map((s) => s.trim()).filter(Boolean);
  const perLine = parseInt(searchParams.get("perline") || "10", 10);
  const theme = searchParams.get("theme") || "dark";

  if (iconNames.length === 0) {
    return new NextResponse("<svg xmlns='http://www.w3.org/2000/svg' width='200' height='50'><text x='10' y='30' fill='red'>Error: No icons provided (?i=...)</text></svg>", {
      status: 400,
      headers: { "Content-Type": "image/svg+xml" }
    });
  }

  const iconSize = 48;
  const gap = 12;
  const padding = 16;

  // Load requested icons from disk
  const loadedIcons: string[] = [];
  for (const name of iconNames) {
    const svg = getLocalIconSvg(name);
    if (svg) {
      loadedIcons.push(svg);
    }
  }

  if (loadedIcons.length === 0) {
    return new NextResponse("<svg xmlns='http://www.w3.org/2000/svg' width='250' height='50'><text x='10' y='30' fill='red'>Error: None of the requested icons exist</text></svg>", {
      status: 404,
      headers: { "Content-Type": "image/svg+xml" }
    });
  }

  const total = loadedIcons.length;
  const cols = Math.min(total, perLine);
  const rows = Math.ceil(total / perLine);

  const width = cols * iconSize + (cols - 1) * gap + padding * 2;
  const height = rows * iconSize + (rows - 1) * gap + padding * 2;

  const bgColor = theme === "dark" ? "#0d1117" : "#ffffff";

  let innerElements = "";
  loadedIcons.forEach((svgContent, index) => {
    const col = index % perLine;
    const row = Math.floor(index / perLine);
    const x = padding + col * (iconSize + gap);
    const y = padding + row * (iconSize + gap);

    // Clean XML wrappers to embed safely inside main SVG group
    const cleanSvg = svgContent
      .replace(/<\?xml.*?\?>/g, "")
      .replace(/<svg[^>]*>/, "")
      .replace(/<\/svg>/, "");

    innerElements += `<g transform="translate(${x}, ${y})" width="${iconSize}" height="${iconSize}">${cleanSvg}</g>`;
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