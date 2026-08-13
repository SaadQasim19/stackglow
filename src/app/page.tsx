"use client";

import { useState, useMemo, useEffect } from "react";
import Navbar from "@/components/Navbar";

const DEFAULT_ICONS = [
  { id: "gdg", name: "GDG Logo" },
  { id: "hardhat", name: "Hardhat" },
  { id: "mongodb", name: "MongoDB" },
  { id: "nestjs", name: "NestJS" },
  { id: "sun", name: "Sun" },
  { id: "moon", name: "Moon" },
];

export default function Home() {
  const [iconsList, setIconsList] = useState<{ id: string; name: string }[]>(DEFAULT_ICONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [siteTheme, setSiteTheme] = useState<"light" | "dark">("light");
  const [activeTab, setActiveTab] = useState<"all-icons" | "guide">("all-icons");
  const [selectedQueue, setSelectedQueue] = useState<string[]>([]);
  const [copiedQueue, setCopiedQueue] = useState(false);

  useEffect(() => {
    // Dynamically fetch grows & scans icon directory
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

  const origin = typeof window !== "undefined" ? window.location.origin : "https://stackglow.dev";

  const toggleIcon = (id: string) => {
    if (selectedQueue.includes(id)) {
      setSelectedQueue(selectedQueue.filter((item) => item !== id));
    } else {
      setSelectedQueue([...selectedQueue, id]);
    }
  };

  const queueSnippet = selectedQueue
    .map((id) => `![${id}](${origin}/api/icons?i=${id})`)
    .join(" ");

  const copyQueueSnippet = () => {
    if (selectedQueue.length === 0) return;
    navigator.clipboard.writeText(queueSnippet);
    setCopiedQueue(true);
    setTimeout(() => setCopiedQueue(false), 2000);
  };

  const clearQueue = () => {
    setSelectedQueue([]);
  };

  return (
    <div className={`min-h-screen font-sans transition-colors ${siteTheme === "dark" ? "bg-neutral-950 text-neutral-300" : "bg-neutral-50 text-neutral-800"}`}>

      <Navbar siteTheme={siteTheme} setSiteTheme={setSiteTheme} />

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-10">

        {/* Hero Section */}
        <section className="space-y-4 pt-2">
          <div className="text-xs font-mono tracking-wide text-neutral-500 uppercase">
            {"// Open-source developer utilities"}
          </div>
          <h1 className={`text-4xl md:text-5xl font-bold tracking-tight ${siteTheme === "dark" ? "text-neutral-100" : "text-neutral-900"}`}>
            Generate dynamic <span className="text-cyan-500">tech stack badges</span> for your <span className="text-purple-500">GitHub README</span>.
          </h1>
          <p className="text-sm md:text-base max-w-2xl leading-relaxed text-neutral-500">
            A fast, local SVG icon generator built for developers. High performance, zero latency, and fully customizable for clean profile documentation.
          </p>

          <div className="flex gap-2 pt-4 border-b border-neutral-800/20">
            <button
              onClick={() => setActiveTab("all-icons")}
              className={`pb-3 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors px-1 ${activeTab === "all-icons"
                ? "border-cyan-500 text-cyan-500 font-semibold"
                : "border-transparent text-neutral-500 hover:text-neutral-300"
                }`}
            >
              All Icons
            </button>
            <button
              onClick={() => setActiveTab("guide")}
              className={`pb-3 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors px-1 ${activeTab === "guide"
                ? "border-cyan-500 text-cyan-500 font-semibold"
                : "border-transparent text-neutral-500 hover:text-neutral-300"
                }`}
            >
              Usecase & Guide
            </button>
          </div>
        </section>

        {/* TAB 1: ALL ICONS MODULE */}
        {activeTab === "all-icons" && (
          <div className="space-y-8">

            {/* Heading & Search Bar (Kept exactly as requested) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className={`text-2xl md:text-3xl font-bold tracking-tight ${siteTheme === "dark" ? "text-neutral-100" : "text-neutral-900"
                  }`}>
                  All Icons
                </h2>
                <p className="text-xs md:text-sm text-neutral-500 mt-1">
                  Click any icon to toggle it in your active selection queue.
                </p>
              </div>
              <input
                type="text"
                placeholder="Search icons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`border rounded-lg px-3.5 py-2 text-xs font-mono focus:outline-none w-full sm:w-64 ${siteTheme === "dark"
                  ? "bg-neutral-950 border-neutral-800 text-neutral-200 focus:border-cyan-500"
                  : "bg-neutral-50 border-neutral-200 text-neutral-900 focus:border-cyan-600"
                  }`}
              />
            </div>

            {/* Icons Display: Flexible, Growable, Free from Square Boxes / Grid */}
            <div className="flex flex-wrap gap-8 md:gap-10 items-center pt-2">
              {filteredIcons.map((icon) => {
                const isSelected = selectedQueue.includes(icon.id);
                return (
                  <button
                    key={icon.id}
                    onClick={() => toggleIcon(icon.id)}
                    className="flex flex-col items-center justify-center group relative p-3 transition-transform duration-200 hover:scale-110 select-none outline-none focus:outline-none"
                    title={`${icon.name} (${isSelected ? "Selected" : "Click to select"})`}
                  >
                    {/* Selection Indicator Badge */}
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500 text-xs font-bold text-black shadow-md font-mono z-10 animate-in zoom-in-50 duration-150">
                        ✓
                      </span>
                    )}

                    {/* Icon Image displayed in original properties & natural size without square borders */}
                    <div className={`relative flex items-center justify-center p-4 rounded-2xl transition-all duration-200 ${
                      isSelected 
                        ? siteTheme === "dark"
                          ? "bg-cyan-500/15 ring-2 ring-cyan-500 shadow-lg shadow-cyan-500/10"
                          : "bg-cyan-50 ring-2 ring-cyan-500 shadow-sm"
                        : siteTheme === "dark"
                          ? "hover:bg-neutral-900/80"
                          : "hover:bg-neutral-200/50"
                    }`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/api/icons?i=${icon.id}`}
                        alt={icon.name}
                        className="w-16 h-16 md:w-20 md:h-20 max-w-none max-h-none object-contain block transition-transform group-hover:scale-105"
                      />
                    </div>

                    {/* Clean Label below */}
                    <span
                      className={`text-xs md:text-sm font-mono mt-2.5 transition-colors ${
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
              <div className="text-center py-12 text-xs font-mono text-neutral-500">
                No icons found matching &quot;{searchQuery}&quot;
              </div>
            )}

            {/* Active Selection Queue Output Bar - Appears ONLY when icon(s) are selected */}
            {selectedQueue.length > 0 && (
              <div
                className={`border rounded-xl p-5 space-y-3 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
                  siteTheme === "dark" ? "border-cyan-500/40 bg-neutral-900/70 shadow-lg shadow-cyan-950/20" : "border-cyan-500/40 bg-cyan-50/50 shadow-sm"
                }`}
              >
                <div className="flex justify-between items-center text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                    <span className="text-neutral-400 uppercase tracking-wider font-semibold">Active Selection Queue</span>
                    <span className="text-cyan-500 font-bold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                      {selectedQueue.length} selected
                    </span>
                  </div>
                  <button
                    onClick={clearQueue}
                    className="text-neutral-500 hover:text-red-400 transition-colors text-[11px] underline"
                  >
                    Clear Queue
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <input
                    type="text"
                    readOnly
                    value={queueSnippet}
                    className={`flex-1 border rounded-lg px-3.5 py-2 text-xs font-mono select-all truncate ${
                      siteTheme === "dark" ? "bg-neutral-950 border-neutral-800 text-neutral-300" : "bg-white border-neutral-200 text-neutral-800"
                    }`}
                  />
                  <button
                    onClick={copyQueueSnippet}
                    className={`px-5 py-2 rounded-lg text-xs font-mono font-medium transition shrink-0 ${
                      copiedQueue
                        ? "bg-emerald-500 text-white"
                        : siteTheme === "dark"
                          ? "bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold"
                          : "bg-neutral-900 hover:bg-neutral-800 text-white"
                    }`}
                  >
                    {copiedQueue ? "Copied Markdown ✓" : "Copy Active Queue"}
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: USECASE & GUIDE */}
        {activeTab === "guide" && (
          <div className={`border rounded-xl p-8 space-y-8 font-sans ${siteTheme === "dark" ? "border-neutral-800 bg-neutral-900/20" : "border-neutral-200 bg-white"
            }`}>
            <div className="space-y-2">
              <h2 className={`text-xl font-bold ${siteTheme === "dark" ? "text-neutral-100" : "text-neutral-900"}`}>
                How to use StackGlow in your GitHub Profile
              </h2>
              <p className="text-sm text-neutral-500">
                Follow these simple steps to embed clean technology stacks in your personal Markdown files.
              </p>
            </div>

            <div className="space-y-6 text-sm">
              <div className="space-y-2">
                <h3 className="font-semibold font-mono text-cyan-500">Step 1: Build your badge</h3>
                <p className="text-neutral-500">
                  Select your languages, frameworks, and developer tools using the Badge Generator tab. Adjust theme and row parameters.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold font-mono text-cyan-500">Step 2: Copy the Markdown snippet</h3>
                <p className="text-neutral-500">
                  Click the copy button to capture the generated URL wrapped in Markdown image tags.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold font-mono text-cyan-500">Step 3: Paste into your README.md</h3>
                <p className="text-neutral-500">
                  Open your repository&apos;s profile README file and paste the snippet inside your Tech Stack section:
                </p>
                <pre className={`p-4 rounded-lg font-mono text-xs overflow-x-auto ${siteTheme === "dark" ? "bg-neutral-950 border border-neutral-800 text-neutral-300" : "bg-neutral-100 text-neutral-800"
                  }`}>
                  {`## 🛠️ Tech Stack\n\n![react](${origin}/api/icons?i=react) ![nextjs](${origin}/api/icons?i=nestjs)`}
                </pre>
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}