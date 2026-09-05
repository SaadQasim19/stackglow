/**
 * Robust Multi-Pass SVG Sanitization Engine
 *
 * Sanitizes arbitrary SVG content before composite rendering to eliminate:
 * - Stored / Reflected Cross-Site Scripting (XSS)
 * - XML External Entity (XXE) / Billion Laughs attacks
 * - Malicious URI protocols (javascript:, vbscript:, data:text/html, data:image/svg+xml, etc.)
 * - Executable embedded objects (<foreignObject>, <script>, <embed>, <iframe>, <object>, <animate>, <set>)
 * - Inline DOM event listeners (onload, onerror, onclick, onbegin, onend, etc.)
 */
export function sanitizeSvgContent(rawSvg: string): string {
  if (!rawSvg || typeof rawSvg !== "string") {
    return "";
  }

  let cleaned = rawSvg;

  // Multi-pass convergence loop (up to 5 iterations) to defeat nested tag evasion like <scr<script>ipt>
  for (let pass = 0; pass < 5; pass++) {
    const prev = cleaned;

    // 1. Strip XML declarations, DOCTYPEs, and ENTITY definitions (XXE Mitigation)
    cleaned = cleaned
      .replace(/<\?xml.*?\?>/gi, "")
      .replace(/<!DOCTYPE[\s\S]*?>/gi, "")
      .replace(/<!ENTITY[\s\S]*?>/gi, "")
      .replace(/SYSTEM\s+["'][^"']*["']/gi, "")
      .replace(/PUBLIC\s+["'][^"']*["']/gi, "")
      .replace(/<!--[\s\S]*?-->/g, ""); // Strip comments

    // 2. Strip dangerous executable, animation and embedding tags
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
      "animate",
      "set",
      "handler",
      "listener",
      "audio",
      "video",
      "form",
      "input",
      "button",
      "textarea",
    ];

    for (const tag of dangerousTags) {
      const blockRegex = new RegExp(`<${tag}\\b[\\s\\S]*?<\\/${tag}>`, "gi");
      const selfClosingRegex = new RegExp(`<${tag}\\b[^>]*\\/?>`, "gi");
      cleaned = cleaned.replace(blockRegex, "").replace(selfClosingRegex, "");
    }

    // 3. Strip inline event handlers (e.g. onload=..., onerror=..., onclick=..., onbegin=...)
    cleaned = cleaned.replace(/\s+on[a-zA-Z]+\s*=\s*(['"]).*?\1/gi, "");
    cleaned = cleaned.replace(/\s+on[a-zA-Z]+\s*=\s*[^\s>]+/gi, "");

    // 4. Strip dangerous URI protocols in href, xlink:href, src, data, and action attributes
    cleaned = cleaned.replace(
      /\s+(?:[a-zA-Z0-9_-]+:)?(?:href|src|data|action)\s*=\s*(['"])\s*(?:javascript\s*:|vbscript\s*:|file\s*:|data\s*:\s*(?:text\/(?:html|xml|plain)|image\/svg\+xml|application\/[^\s'"]*))[\s\S]*?\1/gi,
      ""
    );
    cleaned = cleaned.replace(
      /\s+(?:[a-zA-Z0-9_-]+:)?(?:href|src|data|action)\s*=\s*(?:javascript\s*:|vbscript\s*:|file\s*:|data\s*:\s*(?:text\/(?:html|xml|plain)|image\/svg\+xml|application\/[^\s>]*))[^\s>]*/gi,
      ""
    );

    // 5. Strip dangerous style expressions (CSS expression() / behavior / @import)
    cleaned = cleaned.replace(/expression\s*\([^)]*\)/gi, "none");
    cleaned = cleaned.replace(/@import\s+[^;]+;/gi, "");
    cleaned = cleaned.replace(/behavior\s*:\s*[^;]+;/gi, "");

    if (cleaned === prev) {
      break;
    }
  }

  return cleaned.trim();
}
