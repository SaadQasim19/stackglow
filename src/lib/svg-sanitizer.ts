/**
 * Robust Multi-Pass SVG Sanitization Engine
 *
 * Sanitizes arbitrary SVG content before composite rendering to eliminate:
 * - Stored / Reflected Cross-Site Scripting (XSS)
 * - XML External Entity (XXE) / Billion Laughs attacks
 * - Malicious URI protocols (javascript:, vbscript:, data:text/html)
 * - Executable embedded objects (<foreignObject>, <script>, <embed>, <iframe>, <object>)
 * - Inline DOM event listeners (onload, onerror, onclick, etc.)
 */
export function sanitizeSvgContent(rawSvg: string): string {
  if (!rawSvg || typeof rawSvg !== "string") {
    return "";
  }

  let cleaned = rawSvg;

  // 1. Strip XML declarations, DOCTYPEs, and ENTITY definitions (XXE Mitigation)
  cleaned = cleaned
    .replace(/<\?xml.*?\?>/gi, "")
    .replace(/<!DOCTYPE[\s\S]*?>/gi, "")
    .replace(/<!ENTITY[\s\S]*?>/gi, "")
    .replace(/SYSTEM\s+["'][^"']*["']/gi, "")
    .replace(/PUBLIC\s+["'][^"']*["']/gi, "")
    .replace(/<!--[\s\S]*?-->/g, ""); // Strip comments

  // 2. Strip dangerous executable and embedding tags
  const dangerousTags = [
    "script",
    "foreignObject",
    "foreignobject",
    "embed",
    "object",
    "iframe",
    "applet",
    "meta",
    "link",
    "base",
  ];

  for (const tag of dangerousTags) {
    const blockRegex = new RegExp(`<${tag}\\b[\\s\\S]*?<\\/${tag}>`, "gi");
    const selfClosingRegex = new RegExp(`<${tag}\\b[^>]*\\/?>`, "gi");
    cleaned = cleaned.replace(blockRegex, "").replace(selfClosingRegex, "");
  }

  // 3. Strip inline event handlers (e.g. onload=..., onerror=..., onclick=...)
  cleaned = cleaned.replace(/\s+on[a-zA-Z]+\s*=\s*(['"]).*?\1/gi, "");
  cleaned = cleaned.replace(/\s+on[a-zA-Z]+\s*=\s*[^\s>]+/gi, "");

  // 4. Strip dangerous URI protocols in href and xlink:href attributes
  cleaned = cleaned.replace(
    /\s+(?:xlink:)?href\s*=\s*(['"])\s*(?:javascript|vbscript|data\s*:\s*text\/html|file):[\s\S]*?\1/gi,
    ""
  );

  // 5. Strip dangerous style expressions (CSS expression() / behavior / @import)
  cleaned = cleaned.replace(/expression\s*\([^)]*\)/gi, "none");
  cleaned = cleaned.replace(/@import\s+[^;]+;/gi, "");
  cleaned = cleaned.replace(/behavior\s*:\s*[^;]+;/gi, "");

  return cleaned.trim();
}
