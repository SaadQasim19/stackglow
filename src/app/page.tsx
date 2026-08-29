"use client";

import { useState, useMemo, useEffect, useSyncExternalStore } from "react";
import Navbar from "@/components/Navbar";

const DEFAULT_ICONS = [
  { id: "gdg", name: "GDG Logo" },
  { id: "hardhat", name: "Hardhat" },
  { id: "mongodb", name: "MongoDB" },
  { id: "nestjs", name: "NestJS" },
  { id: "react", name: "React" },
  { id: "typescript", name: "TypeScript" },
];

function ClipboardIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function CheckIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function ExternalLinkIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

export default function Home() {
  const [iconsList, setIconsList] = useState<{ id: string; name: string }[]>(DEFAULT_ICONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [siteTheme, setSiteTheme] = useState<"light" | "dark">("light");
  const [activeTab, setActiveTab] = useState<"all-icons" | "guide">("all-icons");
  const [selectedQueue, setSelectedQueue] = useState<string[]>([
    "react",
    "typescript",
    "nodejs",
    "rust",
    "docker",
    "aws",
  ]);

  // Combined Badge Customization Controls
  const [badgeMode, setBadgeMode] = useState<"combined" | "individual">("combined");
  const [badgeTheme, setBadgeTheme] = useState<"dark" | "light">("dark");
  const [iconsPerLine, setIconsPerLine] = useState<number>(12);
  const [iconSize, setIconSize] = useState<number>(70);
  const [badgeAlt, setBadgeAlt] = useState<string>("My Tech Stack");
  const [snippetFormat, setSnippetFormat] = useState<"markdown" | "html" | "url">("markdown");
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [previewCanvasTheme, setPreviewCanvasTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    // Dynamically fetch & scan icon directory
    fetch("/api/icons/list")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setIconsList(data);
        }
      })
      .catch(() => {
        // Silent fallback to defaults if offline or error
      });
  }, []);

  useEffect(() => {
    if (siteTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [siteTheme]);

  const filteredIcons = useMemo(() => {
    return iconsList.filter(
      (icon) =>
        icon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        icon.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [iconsList, searchQuery]);

  const origin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => "https://stackglow.vercel.app"
  );

  const toggleIcon = (id: string) => {
    if (selectedQueue.includes(id)) {
      setSelectedQueue(selectedQueue.filter((item) => item !== id));
    } else {
      setSelectedQueue([...selectedQueue, id]);
    }
  };

  const removeIcon = (id: string) => {
    setSelectedQueue(selectedQueue.filter((item) => item !== id));
  };

  const clearQueue = () => {
    setSelectedQueue([]);
  };

  const selectAll = () => {
    const allIds = iconsList.map((i) => i.id);
    setSelectedQueue(allIds);
  };

  // Generate Combined Badge URL and Snippets
  const badgeQueryParams = useMemo(() => {
    if (selectedQueue.length === 0) return "";
    const params = new URLSearchParams();
    params.set("i", selectedQueue.join(","));
    if (iconsPerLine !== 12) params.set("perline", iconsPerLine.toString());
    if (badgeTheme !== "dark") params.set("theme", badgeTheme);
    if (iconSize !== 70) params.set("size", iconSize.toString());
    return params.toString();
  }, [selectedQueue, iconsPerLine, badgeTheme, iconSize]);

  const combinedBadgePreviewUrl = badgeQueryParams ? `/api/icons?${badgeQueryParams}` : "";
  const combinedBadgeUrl = badgeQueryParams ? `${origin}/api/icons?${badgeQueryParams}` : "";

  // Generate Snippet text based on format & mode
  const generatedSnippet = useMemo(() => {
    if (selectedQueue.length === 0) return "";

    if (badgeMode === "combined") {
      if (snippetFormat === "markdown") {
        return `![${badgeAlt || "Tech Stack"}](${combinedBadgeUrl})`;
      } else if (snippetFormat === "html") {
        return `<img src="${combinedBadgeUrl}" height="${iconSize}" alt="${badgeAlt || "Tech Stack"}" />`;
      } else {
        return combinedBadgeUrl;
      }
    } else {
      // Individual badges
      if (snippetFormat === "markdown") {
        return selectedQueue
          .map((id) => `![${id}](${origin}/api/icons?i=${id}&theme=${badgeTheme}&size=${iconSize})`)
          .join(" ");
      } else if (snippetFormat === "html") {
        return selectedQueue
          .map((id) => `<img src="${origin}/api/icons?i=${id}&theme=${badgeTheme}&size=${iconSize}" height="${iconSize}" alt="${id}" />`)
          .join("\n");
      } else {
        return selectedQueue
          .map((id) => `${origin}/api/icons?i=${id}&theme=${badgeTheme}&size=${iconSize}`)
          .join("\n");
      }
    }
  }, [badgeMode, snippetFormat, badgeAlt, combinedBadgeUrl, selectedQueue, origin, badgeTheme, iconSize]);

  const copySnippet = () => {
    if (!generatedSnippet) return;
    navigator.clipboard.writeText(generatedSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  // Estimated Badge Grid Dimension Calculations
  const cols = Math.min(selectedQueue.length, iconsPerLine);
  const rows = Math.ceil(selectedQueue.length / (iconsPerLine || 1));
  const estimatedWidth = cols * iconSize + (cols - 1) * 14 + 36;
  const estimatedHeight = rows * iconSize + (rows - 1) * 14 + 36;

  // Calculate dynamic rows needed for textarea if multiline
  const snippetLineCount = (generatedSnippet.match(/\n/g) || []).length + 1;

  return (
    <div
      className={`min-h-screen font-sans transition-colors ${
        siteTheme === "dark" ? "bg-neutral-950 text-neutral-300" : "bg-neutral-50 text-neutral-800"
      }`}
    >
      <Navbar siteTheme={siteTheme} setSiteTheme={setSiteTheme} />

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        {/* Hero Section */}
        <section className="space-y-4 pt-2">
          <div className="text-xs font-mono tracking-wide text-cyan-500 uppercase flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            {"// Open-source developer utilities"}
          </div>
          <h1
            className={`text-4xl md:text-5xl font-bold tracking-tight ${
              siteTheme === "dark" ? "text-neutral-100" : "text-neutral-900"
            }`}
          >
            Generate dynamic <span className="text-cyan-500">tech stack badges</span> for your{" "}
            <span className="text-purple-500">GitHub README</span>.
          </h1>
          <p className="text-sm md:text-base max-w-2xl leading-relaxed text-neutral-500">
            A fast, local SVG icon generator built for developers. Generate unified multi-icon grid badges or individual
            shields with zero latency and full customization.
          </p>

          <div className="flex gap-2 pt-4 border-b border-neutral-800/20">
            <button
              onClick={() => setActiveTab("all-icons")}
              className={`pb-3 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors px-1 cursor-pointer ${
                activeTab === "all-icons"
                  ? "border-cyan-500 text-cyan-500 font-semibold"
                  : "border-transparent text-neutral-500 hover:text-neutral-300"
              }`}
            >
              Badge Generator & Gallery
            </button>
            <button
              onClick={() => setActiveTab("guide")}
              className={`pb-3 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors px-1 cursor-pointer ${
                activeTab === "guide"
                  ? "border-cyan-500 text-cyan-500 font-semibold"
                  : "border-transparent text-neutral-500 hover:text-neutral-300"
              }`}
            >
              Usecase & Guide
            </button>
          </div>
        </section>

        {/* TAB 1: BADGE GENERATOR & ICONS GALLERY */}
        {activeTab === "all-icons" && (
          <div className="space-y-12">
            {/* COMBINED MULTI-ICON BADGE STUDIO (Appears when items are selected) */}
            {selectedQueue.length > 0 ? (
              <div
                className={`border rounded-2xl p-6 md:p-8 space-y-6 shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-top-3 ${
                  siteTheme === "dark"
                    ? "border-neutral-800 bg-neutral-900/80 shadow-black/40 backdrop-blur-md"
                    : "border-neutral-200 bg-white/90 shadow-neutral-200/50 backdrop-blur-md"
                }`}
              >
                {/* Studio Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800/20">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse"></span>
                    <h2
                      className={`text-lg font-mono font-bold uppercase tracking-wider ${
                        siteTheme === "dark" ? "text-neutral-100" : "text-neutral-900"
                      }`}
                    >
                      Badge Studio & Live Preview
                    </h2>
                    <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/30">
                      {selectedQueue.length} icons selected
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono">
                    <button
                      onClick={selectAll}
                      className="text-neutral-400 hover:text-cyan-400 transition-colors cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-neutral-700">|</span>
                    <button
                      onClick={clearQueue}
                      className="text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      Clear Selection
                    </button>
                  </div>
                </div>

                {/* Selected Icon Chips */}
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-neutral-500">
                    Active Stack Queue (Click &times; to remove):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedQueue.map((id) => {
                      const iconItem = iconsList.find((i) => i.id === id);
                      const displayName = iconItem ? iconItem.name : id;
                      return (
                        <span
                          key={id}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border transition-all ${
                            siteTheme === "dark"
                              ? "bg-neutral-950 border-neutral-800 text-neutral-300"
                              : "bg-neutral-100 border-neutral-200 text-neutral-800"
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={`/api/icons?i=${id}`} alt={displayName} className="w-3.5 h-3.5 object-contain" />
                          <span>{displayName}</span>
                          <button
                            onClick={() => removeIcon(id)}
                            className="text-neutral-500 hover:text-red-400 ml-1 font-bold text-sm cursor-pointer"
                            title={`Remove ${displayName}`}
                          >
                            &times;
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Generator Customization Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-neutral-500/5 border border-neutral-800/20 text-xs font-mono">
                  {/* Badge Mode */}
                  <div className="space-y-1.5">
                    <label className="text-neutral-400 font-semibold uppercase tracking-wider block">
                      Badge Layout Mode
                    </label>
                    <div className="grid grid-cols-2 gap-1 bg-neutral-950/40 p-1 rounded-lg border border-neutral-800/40">
                      <button
                        onClick={() => setBadgeMode("combined")}
                        className={`py-1.5 px-2 rounded-md font-semibold text-[11px] transition-colors cursor-pointer ${
                          badgeMode === "combined"
                            ? "bg-cyan-500 text-neutral-950 shadow-sm"
                            : "text-neutral-400 hover:text-neutral-200"
                        }`}
                      >
                        Combined Grid
                      </button>
                      <button
                        onClick={() => setBadgeMode("individual")}
                        className={`py-1.5 px-2 rounded-md font-semibold text-[11px] transition-colors cursor-pointer ${
                          badgeMode === "individual"
                            ? "bg-cyan-500 text-neutral-950 shadow-sm"
                            : "text-neutral-400 hover:text-neutral-200"
                        }`}
                      >
                        Individual
                      </button>
                    </div>
                  </div>

                  {/* Badge Theme */}
                  <div className="space-y-1.5">
                    <label className="text-neutral-400 font-semibold uppercase tracking-wider block">
                      Badge Theme
                    </label>
                    <div className="grid grid-cols-2 gap-1 bg-neutral-950/40 p-1 rounded-lg border border-neutral-800/40">
                      <button
                        onClick={() => setBadgeTheme("dark")}
                        className={`py-1.5 px-2 rounded-md font-semibold text-[11px] transition-colors cursor-pointer ${
                          badgeTheme === "dark"
                            ? "bg-neutral-800 text-neutral-100 shadow-sm border border-neutral-700"
                            : "text-neutral-400 hover:text-neutral-200"
                        }`}
                      >
                        Dark (#0d1117)
                      </button>
                      <button
                        onClick={() => setBadgeTheme("light")}
                        className={`py-1.5 px-2 rounded-md font-semibold text-[11px] transition-colors cursor-pointer ${
                          badgeTheme === "light"
                            ? "bg-white text-neutral-900 shadow-sm border border-neutral-300"
                            : "text-neutral-400 hover:text-neutral-200"
                        }`}
                      >
                        Light (#ffffff)
                      </button>
                    </div>
                  </div>

                  {/* Icons Per Line */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-neutral-400 font-semibold uppercase tracking-wider">
                        Icons Per Row (Max Width)
                      </label>
                      <span className="text-cyan-500 font-bold">{iconsPerLine}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="24"
                      disabled={badgeMode === "individual"}
                      value={iconsPerLine}
                      onChange={(e) => setIconsPerLine(parseInt(e.target.value, 10))}
                      className="w-full accent-cyan-500 cursor-pointer disabled:opacity-30"
                    />
                    <div className="flex justify-between text-[10px] text-neutral-500 font-mono pt-0.5">
                      <button
                        onClick={() => setIconsPerLine(6)}
                        className={`hover:text-cyan-400 underline cursor-pointer ${iconsPerLine === 6 ? "text-cyan-400 font-bold" : ""}`}
                      >
                        6/row
                      </button>
                      <button
                        onClick={() => setIconsPerLine(8)}
                        className={`hover:text-cyan-400 underline cursor-pointer ${iconsPerLine === 8 ? "text-cyan-400 font-bold" : ""}`}
                      >
                        8/row
                      </button>
                      <button
                        onClick={() => setIconsPerLine(12)}
                        className={`hover:text-cyan-400 underline cursor-pointer ${iconsPerLine === 12 ? "text-cyan-400 font-bold" : ""}`}
                      >
                        12/row (Default)
                      </button>
                      <button
                        onClick={() => setIconsPerLine(16)}
                        className={`hover:text-cyan-400 underline cursor-pointer ${iconsPerLine === 16 ? "text-cyan-400 font-bold" : ""}`}
                      >
                        16/row
                      </button>
                    </div>
                  </div>

                  {/* Icon Size */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-neutral-400 font-semibold uppercase tracking-wider">
                        Icon Size / Height
                      </label>
                      <span className="text-cyan-500 font-bold">{iconSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="24"
                      max="120"
                      step="2"
                      value={iconSize}
                      onChange={(e) => setIconSize(parseInt(e.target.value, 10))}
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-neutral-500 font-mono pt-0.5">
                      <button
                        onClick={() => setIconSize(48)}
                        className={`hover:text-cyan-400 underline cursor-pointer ${iconSize === 48 ? "text-cyan-400 font-bold" : ""}`}
                      >
                        48px
                      </button>
                      <button
                        onClick={() => setIconSize(70)}
                        className={`hover:text-cyan-400 underline cursor-pointer ${iconSize === 70 ? "text-cyan-400 font-bold" : ""}`}
                      >
                        70px (Default)
                      </button>
                      <button
                        onClick={() => setIconSize(96)}
                        className={`hover:text-cyan-400 underline cursor-pointer ${iconSize === 96 ? "text-cyan-400 font-bold" : ""}`}
                      >
                        96px
                      </button>
                    </div>
                  </div>
                </div>

                {/* Alt Title Text Input */}
                {badgeMode === "combined" && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs font-mono">
                    <label className="text-neutral-400 font-semibold uppercase tracking-wider shrink-0">
                      Alt / Title Text:
                    </label>
                    <input
                      type="text"
                      value={badgeAlt}
                      onChange={(e) => setBadgeAlt(e.target.value)}
                      placeholder="e.g. My Tech Stack"
                      className={`flex-1 border rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none ${
                        siteTheme === "dark"
                          ? "bg-neutral-950 border-neutral-800 text-neutral-200 focus:border-cyan-500"
                          : "bg-neutral-50 border-neutral-200 text-neutral-900 focus:border-cyan-600"
                      }`}
                    />
                  </div>
                )}

                {/* LIVE PREVIEW CANVAS */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-neutral-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                      <span>Live SVG Preview</span>
                      {badgeMode === "combined" && (
                        <span className="text-neutral-500 text-[11px] font-normal">
                          ({cols} col &times; {rows} {rows === 1 ? "row" : "rows"} &bull; ~{estimatedWidth} &times;{" "}
                          {estimatedHeight}px)
                        </span>
                      )}
                    </span>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="text-neutral-500">Preview BG:</span>
                      <button
                        onClick={() => setPreviewCanvasTheme("dark")}
                        className={`px-2 py-0.5 rounded cursor-pointer ${
                          previewCanvasTheme === "dark"
                            ? "bg-neutral-800 text-cyan-400 border border-neutral-700"
                            : "text-neutral-500 hover:text-neutral-300"
                        }`}
                      >
                        Dark
                      </button>
                      <button
                        onClick={() => setPreviewCanvasTheme("light")}
                        className={`px-2 py-0.5 rounded cursor-pointer ${
                          previewCanvasTheme === "light"
                            ? "bg-neutral-200 text-neutral-900 border border-neutral-300"
                            : "text-neutral-500 hover:text-neutral-300"
                        }`}
                      >
                        Light
                      </button>
                    </div>
                  </div>

                  {/* Preview Container */}
                  <div
                    className={`rounded-xl p-8 flex items-center justify-center min-h-[140px] overflow-x-auto border transition-colors ${
                      previewCanvasTheme === "dark"
                        ? "bg-[#0b0e14] border-neutral-800"
                        : "bg-[#f6f8fa] border-neutral-200"
                    }`}
                  >
                    {badgeMode === "combined" ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        key={combinedBadgePreviewUrl}
                        src={combinedBadgePreviewUrl}
                        alt={badgeAlt || "Tech Stack"}
                        className="max-w-full h-auto drop-shadow-md rounded-lg transition-all duration-200"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2 items-center justify-center max-w-full">
                        {selectedQueue.map((id) => (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            key={id}
                            src={`/api/icons?i=${id}&theme=${badgeTheme}&size=${iconSize}`}
                            alt={id}
                            className="h-auto drop-shadow-sm rounded"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* REDESIGNED MULTI-FORMAT SNIPPET EXPORTER */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-400">
                      Generated Code Snippet
                    </span>
                    <span className="text-[11px] font-mono text-neutral-500">
                      Click snippet or button to copy
                    </span>
                  </div>

                  {/* Code Card with Header Toolbar */}
                  <div
                    className={`rounded-xl border transition-all overflow-hidden shadow-sm ${
                      siteTheme === "dark"
                        ? "bg-neutral-950 border-neutral-800"
                        : "bg-neutral-900 border-neutral-800 text-neutral-100"
                    }`}
                  >
                    {/* Header Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2.5 bg-neutral-900/90 border-b border-neutral-800/80 text-xs font-mono">
                      {/* Format Switcher Pills */}
                      <div className="flex items-center gap-1">
                        <span className="text-neutral-400 text-[11px] uppercase tracking-wider font-semibold mr-1">
                          Format:
                        </span>
                        <button
                          onClick={() => setSnippetFormat("markdown")}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                            snippetFormat === "markdown"
                              ? "bg-cyan-500 text-neutral-950 font-bold shadow-xs"
                              : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60"
                          }`}
                        >
                          Markdown
                        </button>
                        <button
                          onClick={() => setSnippetFormat("html")}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                            snippetFormat === "html"
                              ? "bg-cyan-500 text-neutral-950 font-bold shadow-xs"
                              : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60"
                          }`}
                        >
                          HTML &lt;img&gt;
                        </button>
                        <button
                          onClick={() => setSnippetFormat("url")}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                            snippetFormat === "url"
                              ? "bg-cyan-500 text-neutral-950 font-bold shadow-xs"
                              : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60"
                          }`}
                        >
                          Direct URL
                        </button>
                      </div>

                      {/* Right Action Items */}
                      <div className="flex items-center gap-2.5 ml-auto">
                        {badgeMode === "combined" && (
                          <a
                            href={combinedBadgePreviewUrl || "/api/icons"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-neutral-400 hover:text-cyan-400 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-neutral-800/50"
                            title="Open raw SVG in a new tab"
                          >
                            <span>Open SVG</span>
                            <ExternalLinkIcon className="w-3 h-3" />
                          </a>
                        )}

                        {/* Proportional, Compact Copy Button */}
                        <button
                          onClick={copySnippet}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all duration-150 flex items-center gap-1.5 cursor-pointer select-none ${
                            copiedSnippet
                              ? "bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20"
                              : "bg-cyan-500 hover:bg-cyan-400 text-neutral-950 shadow-md shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98]"
                          }`}
                        >
                          {copiedSnippet ? (
                            <>
                              <CheckIcon className="w-3.5 h-3.5" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <ClipboardIcon className="w-3.5 h-3.5" />
                              <span>Copy Snippet</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Code Display Area (Dynamically growing, easily selectable & scrollable) */}
                    <div className="relative group">
                      <textarea
                        readOnly
                        rows={Math.min(8, Math.max(2, snippetLineCount))}
                        value={generatedSnippet}
                        onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                        className="w-full p-4 bg-transparent font-mono text-xs text-cyan-400/90 focus:text-cyan-300 focus:outline-none select-all resize-y min-h-[68px] max-h-[300px] leading-relaxed block overflow-y-auto"
                        placeholder="Snippet will appear here..."
                      />
                      <div className="absolute right-3 bottom-2.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-[10px] font-mono text-neutral-500 bg-neutral-900/90 px-2 py-0.5 rounded border border-neutral-800">
                        Drag bottom-right corner to expand
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty state banner when no icons are selected */
              <div
                className={`border border-dashed rounded-2xl p-8 text-center space-y-2 transition-colors ${
                  siteTheme === "dark"
                    ? "border-neutral-800 bg-neutral-900/30 text-neutral-400"
                    : "border-neutral-300 bg-neutral-100/60 text-neutral-600"
                }`}
              >
                <div className="text-2xl">✨</div>
                <h3 className="font-mono font-bold text-sm">Badge Studio is Waiting</h3>
                <p className="text-xs font-mono text-neutral-500 max-w-md mx-auto">
                  Click any icon from the catalog below to add it to your active badge generator queue.
                </p>
              </div>
            )}

            {/* ICONS GALLERY SECTION */}
            <div className="space-y-6">
              {/* Heading & Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2
                    className={`text-2xl md:text-3xl font-bold tracking-tight ${
                      siteTheme === "dark" ? "text-neutral-100" : "text-neutral-900"
                    }`}
                  >
                    Icon Catalog
                  </h2>
                  <p className="text-xs md:text-sm text-neutral-500 mt-1">
                    Click icons to toggle them in or out of your active badge generator queue.
                  </p>
                </div>
                <input
                  type="text"
                  placeholder={`Search ${iconsList.length}+ icons...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`border rounded-lg px-3.5 py-2 text-xs font-mono focus:outline-none w-full sm:w-64 ${
                    siteTheme === "dark"
                      ? "bg-neutral-950 border-neutral-800 text-neutral-200 focus:border-cyan-500"
                      : "bg-neutral-50 border-neutral-200 text-neutral-900 focus:border-cyan-600"
                  }`}
                />
              </div>

              {/* Icons Display */}
              <div className="flex flex-wrap gap-6 md:gap-8 items-center pt-2">
                {filteredIcons.map((icon) => {
                  const isSelected = selectedQueue.includes(icon.id);
                  return (
                    <button
                      key={icon.id}
                      onClick={() => toggleIcon(icon.id)}
                      className="flex flex-col items-center justify-center group relative p-2 transition-transform duration-200 hover:scale-110 select-none outline-none focus:outline-none cursor-pointer"
                      title={`${icon.name} (${isSelected ? "Selected - click to remove" : "Click to select"})`}
                    >
                      {/* Selection Indicator Badge */}
                      {isSelected && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-[11px] font-bold text-neutral-950 shadow-md font-mono z-10 animate-in zoom-in-50 duration-150">
                          ✓
                        </span>
                      )}

                      {/* Icon Image Display */}
                      <div
                        className={`relative flex items-center justify-center p-3.5 rounded-2xl transition-all duration-200 ${
                          isSelected
                            ? siteTheme === "dark"
                              ? "bg-cyan-500/15 ring-2 ring-cyan-500 shadow-lg shadow-cyan-500/10"
                              : "bg-cyan-50 ring-2 ring-cyan-500 shadow-sm"
                            : siteTheme === "dark"
                            ? "hover:bg-neutral-900/80"
                            : "hover:bg-neutral-200/50"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/api/icons?i=${icon.id}`}
                          alt={icon.name}
                          className="w-14 h-14 md:w-16 md:h-16 max-w-none max-h-none object-contain block transition-transform group-hover:scale-105"
                        />
                      </div>

                      {/* Label */}
                      <span
                        className={`text-xs font-mono mt-2 transition-colors text-center ${
                          isSelected
                            ? "text-cyan-500 font-semibold"
                            : siteTheme === "dark"
                            ? "text-neutral-400 group-hover:text-neutral-200"
                            : "text-neutral-600 group-hover:text-neutral-900"
                        }`}
                      >
                        {icon.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {filteredIcons.length === 0 && (
                <div className="text-center py-12 text-xs font-mono text-neutral-500 border border-dashed rounded-xl">
                  No icons found matching &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: USECASE & GUIDE */}
        {activeTab === "guide" && (
          <div
            className={`border rounded-xl p-8 space-y-8 font-sans ${
              siteTheme === "dark" ? "border-neutral-800 bg-neutral-900/20" : "border-neutral-200 bg-white"
            }`}
          >
            <div className="space-y-2">
              <h2 className={`text-xl font-bold ${siteTheme === "dark" ? "text-neutral-100" : "text-neutral-900"}`}>
                How to use StackGlow in your GitHub Profile README
              </h2>
              <p className="text-sm text-neutral-500">
                Follow these simple steps to embed clean, fast, dynamic technology stack badges in your Markdown files.
              </p>
            </div>

            <div className="space-y-6 text-sm">
              <div className="space-y-2">
                <h3 className="font-semibold font-mono text-cyan-500">
                  Option A: Combined Multi-Icon Grid Badge (Recommended)
                </h3>
                <p className="text-neutral-500">
                  Combine all your tech stack icons into a single compact SVG card. Customize theme, columns per row,
                  and icon sizing directly in the URL:
                </p>
                <pre
                  className={`p-4 rounded-lg font-mono text-xs overflow-x-auto ${
                    siteTheme === "dark"
                      ? "bg-neutral-950 border border-neutral-800 text-neutral-300"
                      : "bg-neutral-100 text-neutral-800"
                  }`}
                >
                  {`<div align="center">\n  <img src="https://stackglow.vercel.app/api/icons?i=javascript,typescript,react,nextjs&theme=dark&perline=12" height="70" alt="Tech Stack" />\n</div>`}
                </pre>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold font-mono text-cyan-500">Option B: Individual Shields</h3>
                <p className="text-neutral-500">
                  If you prefer standalone badges for each technology, you can embed individual SVG icon endpoints:
                </p>
                <pre
                  className={`p-4 rounded-lg font-mono text-xs overflow-x-auto ${
                    siteTheme === "dark"
                      ? "bg-neutral-950 border border-neutral-800 text-neutral-300"
                      : "bg-neutral-100 text-neutral-800"
                  }`}
                >
                  {`<p align="center">\n  <img src="https://stackglow.vercel.app/api/icons?i=react&theme=dark" height="70" alt="React" />\n  <img src="https://stackglow.vercel.app/api/icons?i=typescript&theme=dark" height="70" alt="TypeScript" />\n  <img src="https://stackglow.vercel.app/api/icons?i=aws&theme=dark" height="70" alt="AWS" />\n</p>`}
                </pre>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold font-mono text-cyan-500">Supported Query Parameters</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono text-left border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-800 text-neutral-400">
                        <th className="py-2 pr-4 font-semibold">Parameter</th>
                        <th className="py-2 pr-4 font-semibold">Type</th>
                        <th className="py-2 pr-4 font-semibold">Default</th>
                        <th className="py-2 font-semibold">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/30 text-neutral-400">
                      <tr>
                        <td className="py-2 pr-4 text-cyan-400 font-bold">i</td>
                        <td className="py-2 pr-4">string</td>
                        <td className="py-2 pr-4">required</td>
                        <td className="py-2">Comma-separated icon slugs (e.g. `javascript,typescript,react,nextjs`)</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 text-cyan-400 font-bold">perline</td>
                        <td className="py-2 pr-4">number</td>
                        <td className="py-2 pr-4">12</td>
                        <td className="py-2">Number of icons per row before wrapping to a new line (default 12)</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 text-cyan-400 font-bold">theme</td>
                        <td className="py-2 pr-4">&quot;dark&quot; | &quot;light&quot;</td>
                        <td className="py-2 pr-4">&quot;dark&quot;</td>
                        <td className="py-2">Background and fill color scheme (`dark` or `light`)</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 text-cyan-400 font-bold">size</td>
                        <td className="py-2 pr-4">number</td>
                        <td className="py-2 pr-4">70</td>
                        <td className="py-2">Icon dimensions in pixels (between 16 and 256, default 70)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}