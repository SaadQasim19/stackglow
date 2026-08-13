"use client";

import { useEffect, useState } from "react";

interface NavbarProps {
  siteTheme: "light" | "dark";
  setSiteTheme: (theme: "light" | "dark") => void;
}

function MoonIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M11.017 2.802a9.25 9.25 0 1 0 10.181 10.181A7.25 7.25 0 1 1 11.017 2.802M1.25 12C1.25 6.063 6.063 1.25 12 1.25c.717 0 1.075.571 1.137 1.026c.059.438-.103.995-.606 1.299a5.75 5.75 0 1 0 7.894 7.894c.304-.503.861-.665 1.299-.606c.455.062 1.026.42 1.026 1.137c0 5.937-4.813 10.75-10.75 10.75S1.25 17.937 1.25 12" />
    </svg>
  );
}

function SunIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 6.99a5.01 5.01 0 1 0 0 10.02a5.01 5.01 0 1 0 0-10.02M13 19h-2v3h2zm0-17h-2v3h2zM2 11h3v2H2zm17 0h3v2h-3zM4.22 18.36l.71.71l.71.71l1.06-1.06l1.06-1.06l-.71-.71l-.71-.71l-1.06 1.06zM19.78 5.64l-.71-.71l-.71-.71l-1.06 1.06l-1.06 1.06l.71.71l.71.71l1.06-1.06zm-12.02.7L6.7 5.28L5.64 4.22l-.71.71l-.71.71L5.28 6.7l1.06 1.06l.71-.71zm8.48 11.32l1.06 1.06l1.06 1.06l.71-.71l.71-.71l-1.06-1.06l-1.06-1.06l-.71.71z" />
    </svg>
  );
}

function GitHubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function StarIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="currentColor">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

export default function Navbar({ siteTheme, setSiteTheme }: NavbarProps) {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    fetch("https://api.github.com/repos/SaadQasim19/stackglow")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.stargazers_count === "number") {
          setStars(data.stargazers_count);
        }
      })
      .catch(() => {
        // Silent fallback if offline or rate-limited
      });
  }, []);

  return (
    <nav className={`border-b px-6 py-4 flex justify-between items-center transition-colors ${
      siteTheme === "dark" ? "border-neutral-800 bg-neutral-950" : "border-neutral-200 bg-white"
    }`}>
      <div className="flex items-center gap-2">
        <span className={`font-bold font-mono text-sm ${siteTheme === "dark" ? "text-neutral-100" : "text-neutral-900"}`}>
          StackGlow <span className="text-xs px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 font-normal">v1.0</span>
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs font-mono">
        <button
          onClick={() => setSiteTheme(siteTheme === "light" ? "dark" : "light")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded border transition ${
            siteTheme === "dark" 
              ? "border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800" 
              : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
          }`}
          aria-label="Toggle Theme"
        >
          {siteTheme === "light" ? (
            <>
              <MoonIcon className="w-3.5 h-3.5 text-neutral-600" />
              <span>Dark</span>
            </>
          ) : (
            <>
              <SunIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Light</span>
            </>
          )}
        </button>

        <a 
          href="https://github.com/SaadQasim19/stackglow" 
          target="_blank" 
          rel="noopener noreferrer"
          className={`flex items-center gap-2 px-3 py-1.5 rounded border transition ${
            siteTheme === "dark"
              ? "border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white"
              : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100 hover:text-black"
          }`}
        >
          <GitHubIcon className="w-4 h-4" />
          <span>GitHub</span>
          <div className="flex items-center gap-1 pl-1.5 border-l border-neutral-700/30">
            <StarIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>{stars !== null ? stars : "—"}</span>
          </div>
        </a>
      </div>
    </nav>
  );
}