import path from "path";
import {
  isValidIconSlug,
  isPathSafe,
  escapeHtmlAttr,
  sanitizeNumericParam,
  sanitizeEnumParam,
} from "../security";
import { sanitizeSvgContent } from "../svg-sanitizer";
import { checkRateLimit } from "../rate-limiter";
import { NextRequest } from "next/server";

// Simple test assertion helper
let passedCount = 0;
let failedCount = 0;

function assert(description: string, condition: boolean) {
  if (condition) {
    console.log(`  ✅ PASS: ${description}`);
    passedCount++;
  } else {
    console.error(`  ❌ FAIL: ${description}`);
    failedCount++;
  }
}

console.log("\n🛡️ ================= STACKGLOW SECURITY AUDIT SUITE ================= 🛡️\n");

// -------------------------------------------------------------
// 1. SLUG VALIDATION & PATH TRAVERSAL TESTS
// -------------------------------------------------------------
console.log("▶ 1. Icon Slug & Path Traversal Validation");

assert("Allows standard alphanumeric slugs", isValidIconSlug("react"));
assert("Allows hyphenated slugs", isValidIconSlug("skill-icons--react"));
assert("Allows underscored slugs", isValidIconSlug("devicon_nodejs"));
assert("Rejects path traversal via ../", !isValidIconSlug("../package.json"));
assert("Rejects path traversal via ..\\", !isValidIconSlug("..\\..\\etc\\passwd"));
assert("Rejects URL-encoded path traversal", !isValidIconSlug("%2e%2e%2fpackage"));
assert("Rejects slugs with slashes", !isValidIconSlug("icons/react"));
assert("Rejects slugs with backslashes", !isValidIconSlug("icons\\react"));
assert("Rejects empty slugs", !isValidIconSlug(""));
assert("Rejects whitespace-only slugs", !isValidIconSlug("   "));
assert("Rejects slugs exceeding 64 characters", !isValidIconSlug("a".repeat(65)));
assert("Rejects slugs with HTML tags", !isValidIconSlug("<script>alert(1)</script>"));
assert("Rejects null-byte injection", !isValidIconSlug("react\0.svg"));

// -------------------------------------------------------------
// 2. CANONICAL DIRECTORY BOUNDARY TESTS
// -------------------------------------------------------------
console.log("\n▶ 2. Canonical Directory Boundary Verification (LFI Defense)");

const testRootDir = path.resolve(process.cwd(), "icons");
const safePath = path.resolve(testRootDir, "devicon--linux.svg");
const maliciousPath1 = path.resolve(testRootDir, "../package.json");
const maliciousPath2 = path.resolve(testRootDir, "../../etc/passwd");
const maliciousPath3 = path.resolve(testRootDir, "../.env.local");

assert("Allows file strictly within icons directory", isPathSafe(safePath, testRootDir));
assert("Rejects relative traversal escaping root", !isPathSafe(maliciousPath1, testRootDir));
assert("Rejects absolute traversal escaping root", !isPathSafe(maliciousPath2, testRootDir));
assert("Rejects environment file access attempt", !isPathSafe(maliciousPath3, testRootDir));

// -------------------------------------------------------------
// 3. SVG SANITIZATION & XSS MITIGATION TESTS
// -------------------------------------------------------------
console.log("\n▶ 3. SVG Sanitizer & Injection Mitigation");

const xssPayload1 = `<svg xmlns="http://www.w3.org/2000/svg"><script>alert("XSS")</script><circle cx="5" cy="5" r="5"/></svg>`;
const clean1 = sanitizeSvgContent(xssPayload1);
assert("Strips <script> tags", !clean1.includes("<script>") && !clean1.includes("alert"));

const xssPayload2 = `<svg xmlns="http://www.w3.org/2000/svg" onload="alert(document.cookie)"><circle cx="5" cy="5" r="5"/></svg>`;
const clean2 = sanitizeSvgContent(xssPayload2);
assert("Strips inline onload= handler", !clean2.includes("onload") && !clean2.includes("document.cookie"));

const xssPayload3 = `<svg xmlns="http://www.w3.org/2000/svg"><a href="javascript:alert(1)"><text>Click</text></a></svg>`;
const clean3 = sanitizeSvgContent(xssPayload3);
assert("Strips javascript: URI in href", !clean3.includes("javascript:"));

const xssPayload4 = `<svg xmlns="http://www.w3.org/2000/svg"><foreignObject width="100" height="100"><iframe src="https://attacker.com"></iframe></foreignObject></svg>`;
const clean4 = sanitizeSvgContent(xssPayload4);
assert("Strips <foreignObject> and <iframe> elements", !clean4.includes("foreignObject") && !clean4.includes("iframe"));

const xxePayload = `<?xml version="1.0"?><!DOCTYPE svg [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><svg>&xxe;</svg>`;
const cleanXxe = sanitizeSvgContent(xxePayload);
assert("Strips XXE DOCTYPE and SYSTEM entities", !cleanXxe.includes("DOCTYPE") && !cleanXxe.includes("SYSTEM"));

const styleXss = `<svg style="background: expression(alert(1))"><path d="M0 0"/></svg>`;
const cleanStyle = sanitizeSvgContent(styleXss);
assert("Strips CSS expression() payloads", !cleanStyle.includes("expression("));

// -------------------------------------------------------------
// 4. HTML ATTRIBUTE ESCAPING TESTS
// -------------------------------------------------------------
console.log("\n▶ 4. HTML Attribute & Text Sanitization");

assert("Escapes double quotes", escapeHtmlAttr('test "quote"').includes("&quot;quote&quot;"));
assert("Escapes angle brackets", escapeHtmlAttr("<script>").includes("&lt;script&gt;"));
assert("Escapes ampersands", escapeHtmlAttr("React & Vue").includes("React &amp; Vue"));
assert("Escapes single quotes", escapeHtmlAttr("user's stack").includes("user&#39;s stack"));
assert("Handles empty input safely", escapeHtmlAttr("") === "");

// -------------------------------------------------------------
// 5. PARAMETER BOUNDS & DOS PROTECTION TESTS
// -------------------------------------------------------------
console.log("\n▶ 5. Parameter Boundary Clamping & DoS Mitigation");

assert("Clamps negative size to minimum (16)", sanitizeNumericParam("-50", 70, 16, 256) === 16);
assert("Clamps oversized size to maximum (256)", sanitizeNumericParam("5000", 70, 16, 256) === 256);
assert("Falls back to default on NaN size", sanitizeNumericParam("invalid_size", 70, 16, 256) === 70);
assert("Clamps perline to range [1, 30]", sanitizeNumericParam("0", 12, 1, 30) === 1);
assert("Clamps oversized perline to 30", sanitizeNumericParam("100", 12, 1, 30) === 30);
assert("Accepts valid theme 'light'", sanitizeEnumParam("light", "dark", ["dark", "light"] as const) === "light");
assert("Rejects invalid theme payload and defaults to 'dark'", sanitizeEnumParam("malicious_theme", "dark", ["dark", "light"] as const) === "dark");

// -------------------------------------------------------------
// 6. RATE LIMITING TESTS
// -------------------------------------------------------------
console.log("\n▶ 6. In-Memory Sliding-Window Rate Limiter");

const mockReq = new NextRequest("http://localhost:3000/api/icons?i=react", {
  headers: { "x-forwarded-for": "192.168.1.100" },
});

let rlPassed = true;
for (let i = 0; i < 10; i++) {
  const result = checkRateLimit(mockReq, 10, 1000);
  if (i < 10 && !result.allowed) rlPassed = false;
}
const blockedResult = checkRateLimit(mockReq, 10, 1000);
assert("Allows requests up to defined limit", rlPassed);
assert("Blocks requests exceeding defined limit (429)", !blockedResult.allowed && blockedResult.remaining === 0);

// -------------------------------------------------------------
// 7. ADVERSARIAL EVASION & OBFUSCATED PAYLOAD TESTS
// -------------------------------------------------------------
console.log("\n▶ 7. Adversarial Evasion & Multi-Pass Convergence Tests");

const nestedScriptPayload = `<svg><scr<script>ipt>alert("nested")</script></svg>`;
const cleanNested = sanitizeSvgContent(nestedScriptPayload);
assert("Neutralizes nested <scr<script>ipt> evasion", !cleanNested.includes("script") && !cleanNested.includes("alert"));

const mixedCaseScript = `<svg><sCrIpT>alert("casing")</ScRiPt></svg>`;
const cleanMixedCase = sanitizeSvgContent(mixedCaseScript);
assert("Neutralizes mixed-case <sCrIpT> payloads", !cleanMixedCase.toLowerCase().includes("script"));

const animateHijack = `<svg><animate attributeName="href" values="javascript:alert(1)"/></svg>`;
const cleanAnimate = sanitizeSvgContent(animateHijack);
assert("Strips dangerous <animate> attribute hijacks", !cleanAnimate.includes("animate") && !cleanAnimate.includes("javascript:"));

const setHijack = `<svg><set attributeName="xlink:href" to="javascript:alert(1)"/></svg>`;
const cleanSet = sanitizeSvgContent(setHijack);
assert("Strips dangerous <set> attribute hijacks", !cleanSet.includes("set") && !cleanSet.includes("javascript:"));

const formPhishPayload = `<svg><form action="https://phishing.com"><input type="text" name="pw"/></form></svg>`;
const cleanForm = sanitizeSvgContent(formPhishPayload);
assert("Strips embedded <form> and <input> phishing elements", !cleanForm.includes("<form") && !cleanForm.includes("<input"));

const dataHtmlPayload = `<svg><a xlink:href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=="><text>link</text></a></svg>`;
const cleanDataHtml = sanitizeSvgContent(dataHtmlPayload);
assert("Strips data:text/html executable payloads", !cleanDataHtml.includes("data:text/html"));

// -------------------------------------------------------------
// 8. PARAMETER EXTREMES & INTEGER OVERFLOW FUZZING
// -------------------------------------------------------------
console.log("\n▶ 8. Parameter Extremes & Integer Overflow Fuzzing");

assert("Handles massive string length safely without NaN crash", sanitizeNumericParam("9".repeat(100), 70, 16, 256) === 256);
assert("Handles negative sign overflow safely", sanitizeNumericParam("-" + "9".repeat(100), 70, 16, 256) === 16);
assert("Handles float strings by integer conversion and clamping", sanitizeNumericParam("45.89", 70, 16, 256) === 45);
assert("Handles special characters in numeric inputs", sanitizeNumericParam("70px; DROP TABLE", 70, 16, 256) === 70);

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log("\n=============================================================");
console.log(`🎯 TOTAL TESTS RUN: ${passedCount + failedCount}`);
console.log(`✅ PASSED: ${passedCount}`);
console.log(`❌ FAILED: ${failedCount}`);
console.log("=============================================================\n");

if (failedCount > 0) {
  process.exit(1);
}
