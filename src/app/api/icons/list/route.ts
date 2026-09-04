import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { ICON_ALIASES } from "@/config/aliases";
import { checkRateLimit } from "@/lib/rate-limiter";

export const dynamic = "force-dynamic";

const ICON_DIR = path.join(process.cwd(), "icons");

const LIST_SECURITY_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Cache-Control": "public, max-age=60, s-maxage=3600, stale-while-revalidate=86400",
};

export async function GET(req: NextRequest) {
  const rateLimit = checkRateLimit(req, 180, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too Many Requests" },
      {
        status: 429,
        headers: {
          ...LIST_SECURITY_HEADERS,
          "Retry-After": rateLimit.reset.toString(),
        },
      }
    );
  }

  try {
    if (!fs.existsSync(ICON_DIR)) {
      return NextResponse.json([], { headers: LIST_SECURITY_HEADERS });
    }

    const files = fs.readdirSync(ICON_DIR);
    const svgFiles = files.filter((file) => file.endsWith(".svg"));

    const CUSTOM_NAMES: Record<string, string> = {
      gdg: "GDG Logo",
      gdg_logo: "GDG Logo",
      hardhat: "Hardhat",
      mongodb: "MongoDB",
      nestjs: "NestJS",
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
      aws: "AWS",
      git: "Git",
      go: "Go",
      golang: "Go",
      google: "Google",
      cloudflare: "Cloudflare",
      matlab: "MATLAB",
      maven: "Maven",
      openstack: "OpenStack",
      rabbitmq: "RabbitMQ",
      sass: "Sass",
      scss: "Sass",
      blender: "Blender",
      ember: "Ember.js",
      emberjs: "Ember.js",
      "ember-tomster": "Ember.js",
      redhat: "Red Hat",
      "redhat-icon": "Red Hat",
      jenkins: "Jenkins",
      ocaml: "OCaml",
      replit: "Replit",
      swift: "Swift",
      fediverse: "Fediverse",
      ableton: "Ableton",
      arch: "Arch Linux",
      archlinux: "Arch Linux",
      "arch-linux": "Arch Linux",
      emotion: "Emotion",
      jquery: "jQuery",
      latex: "LaTeX",
      misskey: "Misskey",
      bevy: "Bevy",
      azure: "Azure",
      "file-type-azure": "Azure",
      postman: "Postman",
      cakephp: "CakePHP",
      couchbase: "Couchbase",
      couchdb: "CouchDB",
      elixir: "Elixir",
      ghidra: "Ghidra",
      hadoop: "Hadoop",
      htmx: "HTMX",
      keras: "Keras",
      memcached: "Memcached",
      neo4j: "Neo4j",
      numpy: "NumPy",
      pandas: "Pandas",
      phoenix: "Phoenix",
      pytorch: "PyTorch",
      scikitlearn: "Scikit-Learn",
      sklearn: "Scikit-Learn",
      seaborn: "Seaborn",
      solidjs: "SolidJS",
      solid: "SolidJS",
      spring: "Spring",
      springboot: "Spring",
      streamlit: "Streamlit",
      tornado: "Tornado",
      flink: "Apache Flink",
      apacheflink: "Apache Flink",
      "apache-flink-icon": "Apache Flink",
      backbone: "Backbone.js",
      backbonejs: "Backbone.js",
      "backbone-icon": "Backbone.js",
      codeigniter: "CodeIgniter",
      "codeigniter-icon": "CodeIgniter",
      dgraph: "Dgraph",
      "dgraph-icon": "Dgraph",
      gin: "Gin",
      hapi: "Hapi",
      lit: "Lit",
      "lit-icon": "Lit",
      preact: "Preact",
      symfony: "Symfony",
      jupyter: "Jupyter",
      jupyterlab: "Jupyter",
      stencil: "Stencil",
      stenciljs: "Stencil",
      influxdb: "InfluxDB",
      shodan: "Shodan",
      fastify: "Fastify",
      alpine: "Alpine.js",
      alpinejs: "Alpine.js",
      "alpinejs-dark": "Alpine.js",
      dynamodb: "DynamoDB",
      "dynamodb-dark": "DynamoDB",
      "dynamodb-light": "DynamoDB",
      opencv: "OpenCV",
      "opencv-dark": "OpenCV",
      "opencv-light": "OpenCV",
      tensorflow: "TensorFlow",
      tf: "TensorFlow",
      "tensorflow-dark": "TensorFlow",
      "tensorflow-light": "TensorFlow",
      cassandra: "Apache Cassandra",
      apachecassandra: "Apache Cassandra",
      "apache-cassandra": "Apache Cassandra",
      astro: "Astro",
      "astro-dark": "Astro",
      burp: "Burp Suite",
      burpsuite: "Burp Suite",
      "burp-suite": "Burp Suite",
      hashcat: "Hashcat",
      langchain: "LangChain",
      "langchain-corporate": "LangChain",
      polars: "Polars",
      tableau: "Tableau",
      wireshark: "Wireshark",
      zap: "OWASP ZAP",
      owaspzap: "OWASP ZAP",
      hydra: "Hydra",
      android: "Android",
      fedora: "Fedora",
      vscode: "VS Code",
      kali: "Kali Linux",
      "kali-linux": "Kali Linux",
      parrot: "Parrot Security",
      "parrot-security": "Parrot Security",
      linuxoriginal: "Linux",
      "linux-original": "Linux",
    };

    const iconsList: { id: string; name: string }[] = [];
    const processedIds = new Set<string>();

    for (const file of svgFiles) {
      const baseName = file.replace(/\.svg$/i, "");
      const lowerBase = baseName.toLowerCase();

      // Check if there is an explicit alias pointing to this file first
      let cleanId = "";
      for (const [aliasKey, targetFile] of Object.entries(ICON_ALIASES)) {
        if (targetFile.toLowerCase() === lowerBase) {
          cleanId = aliasKey;
          break;
        }
      }

      // If no explicit alias, extract clean ID by stripping prefixes/suffixes
      if (!cleanId) {
        cleanId = lowerBase
          .replace(/^.*--/, "")
          .replace(/^file-type-/, "")
          .replace(/-svgrepo-com$/, "")
          .replace(/-(light|dark)$/, "")
          .replace(/-icon$/, "");
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

    return NextResponse.json(iconsList, { headers: LIST_SECURITY_HEADERS });
  } catch (error) {
    console.error("Error listing icons:", error);
    return NextResponse.json([], { headers: LIST_SECURITY_HEADERS });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: LIST_SECURITY_HEADERS,
  });
}
