import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { ICON_ALIASES } from "@/config/aliases";

const ICON_DIR = path.join(process.cwd(), "icons");

export async function GET() {
  try {
    if (!fs.existsSync(ICON_DIR)) {
      return NextResponse.json([]);
    }

    const files = fs.readdirSync(ICON_DIR);
    const svgFiles = files.filter((file) => file.endsWith(".svg"));

    const CUSTOM_NAMES: Record<string, string> = {
      gdg: "GDG Logo",
      gdg_logo: "GDG Logo",
      hardhat: "Hardhat",
      mongodb: "MongoDB",
      nestjs: "NestJS",
      sun: "Sun",
      moon: "Moon",
      html5: "HTML5",
      css: "CSS3",
      java: "Java",
      laravel: "Laravel",
      postgresql: "PostgreSQL",
      julia: "Julia",
      php: "PHP",
      prisma: "Prisma",
      python: "Python",
      ruby: "Ruby",
      "asp-net-core": "ASP.NET Core",
      openai: "OpenAI",
      kubernetes: "Kubernetes",
      linux: "Linux",
      nextjs: "Next.js",
      redis: "Redis",
      django: "Django",
      "django-icon": "Django",
      graphql: "GraphQL",
      nodejs: "Node.js",
      react: "React",
      ubuntu: "Ubuntu",
      claude: "Claude",
      kotlin: "Kotlin",
      express: "Express.js",
      "expressjs-light": "Express.js",
      fastapi: "FastAPI",
      rust: "Rust",
      figma: "Figma",
      firebase: "Firebase",
      svelte: "Svelte",
      typescript: "TypeScript",
      foundry: "Foundry",
      "foundry-bucket-svgrepo-com": "Foundry",
      "foundry-bucket": "Foundry",
      flutter: "Flutter",
      javascript: "JavaScript",
      gitlab: "GitLab",
      nuxt: "Nuxt.js",
      docker: "Docker",
      jest: "Jest",
      solidity: "Solidity",
      ethereum: "Ethereum",
      leetcode: "LeetCode",
    };

    const iconsList: { id: string; name: string }[] = [];
    const processedIds = new Set<string>();

    for (const file of svgFiles) {
      const baseName = file.replace(/\.svg$/i, "");
      const lowerBase = baseName.toLowerCase();

      // Extract clean ID by stripping common prefixes/suffixes
      let cleanId = lowerBase.replace(/^.*--/, "").replace(/-svgrepo-com$/, "");

      // Check if there is an explicit alias pointing to this file
      for (const [aliasKey, targetFile] of Object.entries(ICON_ALIASES)) {
        if (targetFile.toLowerCase() === lowerBase) {
          cleanId = aliasKey;
          break;
        }
      }

      if (!processedIds.has(cleanId)) {
        processedIds.add(cleanId);

        const displayName =
          CUSTOM_NAMES[cleanId] ||
          CUSTOM_NAMES[lowerBase] ||
          cleanId
            .replace(/[_-]/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());

        iconsList.push({ id: cleanId, name: displayName });
      }
    }

    iconsList.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json(iconsList);
  } catch (error) {
    console.error("Error listing icons:", error);
    return NextResponse.json([]);
  }
}
