<div align="center">
  <a href="https://stackglow.vercel.app" target="_blank" rel="noopener noreferrer">
    <img src="https://stackglow.vercel.app/api/icons?i=javascript,typescript,react,nextjs,nodejs,python,rust,docker,kubernetes,aws,postgresql,redis&theme=dark&perline=12" height="70" alt="StackGlow Tech Stack Banner" />
  </a>

  <br /><br />

  <h1>✨ StackGlow</h1>
  <p><strong>Dynamic, High-Performance Tech Stack Badges for GitHub Profile READMEs & Developer Portfolios</strong></p>

  <p>
    <a href="https://stackglow.vercel.app"><img src="https://img.shields.io/badge/Live%20Studio-stackglow.vercel.app-00d8ff?style=flat-square&logo=vercel" alt="Live Demo" /></a>
    <a href="#-supported-icons-catalog"><img src="https://img.shields.io/badge/Icons-120%2B%20Stacks-f59e0b?style=flat-square" alt="120+ Icons" /></a>
    <a href="#-security-architecture"><img src="https://img.shields.io/badge/Security-Hardened%20%26%20Sanitized-10b981?style=flat-square" alt="Security Hardened" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="MIT License" /></a>
  </p>
</div>

---

## ⚡ Overview

**StackGlow** is a blazingly fast, modern SVG tech stack badge generator built for GitHub profile READMEs, project documentation, and developer portfolios.

Unlike traditional shield services that generate cluttered individual badges, StackGlow aggregates your entire technology stack into **sleek, cohesive, multi-icon SVG grid cards** with customizable dimensions, wrapping, and theme contrast.

Visit the live interactive studio at **[stackglow.vercel.app](https://stackglow.vercel.app)** to visually customize, preview, and generate badges in one click!

---

## ✨ Features

- 🎨 **Unified SVG Grid Badges:** Pack your entire tech stack into a single, clean, high-DPI vector card.
- 📐 **Intelligent Wrapping (`perline`):** Set custom icons-per-line (default `12`, range `1-30`) with automatic row calculation.
- 🌓 **Adaptive Theme Modes:** High-contrast Dark (`#0d1117`) and Light (`#ffffff`) badge themes with automatic fill adaptation for monochrome icons while preserving authentic brand colors (e.g. Linux Tux, React, Python, Postman).
- 📏 **Custom Dimensions (`size`):** Fine-tune icon dimensions from compact (48px) to default (70px) and large (96px).
- 🛡️ **Enterprise-Grade Security:**
  - **Path Traversal / LFI Defense:** Canonical directory boundary checks (`isPathSafe`) and slug regex validation (`isValidIconSlug`).
  - **SVG XSS Sanitizer:** Multi-pass sanitizer stripping `<script>`, `<foreignObject>`, inline event listeners (`onload=`), and `javascript:` protocols.
  - **XXE Protection:** Neutralizes DTD and XML Entity Expansion attacks.
  - **Rate Limiting:** Built-in sliding-window rate limiter (180 requests/minute per client IP) to prevent scraping and abuse.
  - **Strict CSP:** Standardized `Content-Security-Policy` and `nosniff` headers.
- 🎛️ **Interactive Web Studio:** Real-time canvas preview, category search, visual queue reordering, and multi-format exporters (Markdown, HTML, Direct URL).
- 📦 **120+ Tech Stack Icons:** Curated vectors spanning AI/ML, Cloud, Databases, Cyber Security, Backend, and Frontend ecosystems.

---

## 🚀 Quick Start & Usage Examples

### 1. Unified Multi-Icon Grid Badge (Recommended)

Embed a responsive, centered badge in your GitHub README:

#### HTML Embed (With custom height)
```html
<div align="center">
  <img src="https://stackglow.vercel.app/api/icons?i=javascript,typescript,react,nextjs,nodejs,python,rust,docker,kubernetes,aws,postgresql,redis&theme=dark&perline=12" height="70" alt="My Tech Stack" />
</div>
```

#### Markdown Embed
```markdown
![My Tech Stack](https://stackglow.vercel.app/api/icons?i=javascript,typescript,react,nextjs,nodejs,python,rust,docker,kubernetes,aws,postgresql,redis&theme=dark)
```

---

### 2. Multi-Row Categorized Badges

Organize different tiers of your stack across multiple rows:

```html
<div align="center">
  <!-- Frontend & Frameworks -->
  <img src="https://stackglow.vercel.app/api/icons?i=react,nextjs,typescript,tailwind,solidjs,astro&theme=dark&perline=6" height="70" alt="Frontend Stack" />
  <br /><br />
  <!-- Backend & Data -->
  <img src="https://stackglow.vercel.app/api/icons?i=nodejs,fastapi,python,rust,postgresql,redis,mongodb,dynamodb&theme=dark&perline=8" height="70" alt="Backend Stack" />
  <br /><br />
  <!-- DevOps & Cloud -->
  <img src="https://stackglow.vercel.app/api/icons?i=docker,kubernetes,aws,azure,cloudflare,git,linux&theme=dark&perline=7" height="70" alt="DevOps Stack" />
</div>
```

---

### 3. Individual Technology Shields

Embed standalone badges side-by-side:

```html
<p align="center">
  <img src="https://stackglow.vercel.app/api/icons?i=react&theme=dark" height="70" alt="React" />
  <img src="https://stackglow.vercel.app/api/icons?i=typescript&theme=dark" height="70" alt="TypeScript" />
  <img src="https://stackglow.vercel.app/api/icons?i=python&theme=dark" height="70" alt="Python" />
  <img src="https://stackglow.vercel.app/api/icons?i=aws&theme=dark" height="70" alt="AWS" />
  <img src="https://stackglow.vercel.app/api/icons?i=linux&theme=dark" height="70" alt="Linux" />
</p>
```

---

## 📖 API Reference & Query Parameters

Endpoint: `GET https://stackglow.vercel.app/api/icons`

| Parameter | Type | Default | Constraints | Description |
|---|---|---|---|---|
| `i` | `string` | **Required** | Max 50 icons, max 64 chars/slug | Comma-separated icon slugs (e.g. `react,typescript,aws`) |
| `perline` | `number` | `12` | Clamped `1` – `30` | Maximum number of icons per row before wrapping |
| `theme` | `string` | `"dark"` | `"dark"` \| `"light"` | Card background and fill scheme (`dark`: `#0d1117`, `light`: `#ffffff`) |
| `size` | `number` | `70` | Clamped `16` – `256` | Dimension (width/height in px) of individual icons |

### Utility Endpoint: Icon Registry
`GET https://stackglow.vercel.app/api/icons/list`  
Returns the full JSON catalog of available icons and display names:
```json
[
  { "id": "react", "name": "React" },
  { "id": "typescript", "name": "TypeScript" },
  { "id": "python", "name": "Python" }
]
```

---

## 🗂️ Supported Icons Catalog (120+ Stacks)

StackGlow supports over 120+ popular developer technologies with canonical slugs and shorthands:

| Domain | Popular Supported Slugs |
|---|---|
| **Languages** | `javascript` (`js`), `typescript` (`ts`), `python`, `rust`, `go` (`golang`), `java`, `csharp`, `cpp`, `php`, `ruby`, `kotlin`, `swift`, `julia`, `elixir`, `solidity`, `html5`, `css` |
| **Frontend & UI** | `react`, `nextjs`, `vue`, `svelte`, `solidjs`, `astro`, `alpinejs`, `preact`, `htmx`, `lit`, `stencil`, `backbone`, `tailwind`, `sass`, `figma` |
| **Backend & APIs** | `nodejs`, `express`, `fastapi`, `django`, `spring` (`springboot`), `nestjs`, `laravel`, `symfony`, `fastify`, `gin`, `phoenix`, `graphql`, `postman`, `cakephp`, `codeigniter`, `hapi`, `tornado` |
| **AI, ML & Data Science** | `pytorch`, `tensorflow` (`tf`), `keras`, `scikitlearn` (`sklearn`), `pandas`, `numpy`, `seaborn`, `polars`, `jupyter`, `streamlit`, `opencv`, `langchain`, `tableau`, `openai`, `claude` |
| **Databases & Caching** | `postgresql` (`postgres`), `mongodb` (`mongo`), `redis`, `mysql`, `dynamodb`, `cassandra`, `couchbase`, `couchdb`, `influxdb`, `neo4j`, `dgraph`, `memcached`, `prisma` |
| **DevOps & Cloud** | `docker`, `kubernetes` (`k8s`), `aws`, `azure`, `cloudflare`, `git`, `gitlab`, `linux`, `ubuntu`, `redhat`, `arch`, `hadoop`, `flink`, `jenkins`, `openstack`, `rabbitmq` |
| **Cyber Security & Tooling** | `burpsuite` (`burp`), `wireshark`, `ghidra`, `hashcat`, `zap` (`owaspzap`), `shodan`, `hydra`, `hardhat`, `foundry` |

---

## 🛡️ Security Architecture

StackGlow is engineered with a strict **defense-in-depth security model**:

1. **Path Traversal & LFI Defense:**
   - Slugs are validated against `/^[a-zA-Z0-9_-]{1,64}$/`.
   - File reads are verified via `path.resolve` boundary confinement.
2. **Multi-Pass SVG Sanitization:**
   - Strips dangerous tags: `<script>`, `<foreignObject>`, `<embed>`, `<object>`, `<iframe>`, `<meta>`, `<link>`.
   - Strips inline DOM listeners (`onload=`, `onerror=`, `onclick=`) and `javascript:` / `data:text/html` URI protocols.
   - Neutralizes XML Entity Expansion (XXE) and Billion Laughs vulnerabilities.
3. **Abuse & DoS Mitigation:**
   - In-memory sliding-window rate limiting (180 requests/minute per client IP).
   - Hard limits on icon count (max 50) and URI length (max 4096 bytes).
   - Numeric parameter clamping (`size` ∈ `[16, 256]`, `perline` ∈ `[1, 30]`).
4. **HTTP Security Headers:**
   - `Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; sandbox` on SVG outputs.
   - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (HSTS).
   - `X-Content-Type-Options: nosniff` & `X-Frame-Options: SAMEORIGIN`.

---

## 💻 Local Development & Testing

### Prerequisites
- Node.js `20.x` or higher
- npm `10.x` or higher

### 1. Clone & Install
```bash
git clone https://github.com/SaadQasim19/stackglow.git
cd stackglow
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Automated Security Test Suite
```bash
npm test
```
Executes the recursive security test suite covering path traversal, SVG injection, parameter clamping, and rate limiting.

### 4. Linting & Type Checking
```bash
npm run lint       # Run ESLint checks
npx tsc --noEmit   # Validate TypeScript types
npm run build      # Create optimized production bundle
```

---

## 🤝 Adding New Icons

To contribute or add a new icon:

1. Place your clean, vector `.svg` file into the [`icons/`](icons/) directory (e.g. `skill-icons--mytool.svg`).
2. Add aliases/shorthands in [`src/config/aliases.ts`](src/config/aliases.ts):
   ```typescript
   export const ICON_ALIASES: Record<string, string> = {
     mytool: "skill-icons--mytool",
   };
   ```
3. Add a human-readable title in [`src/app/api/icons/list/route.ts`](src/app/api/icons/list/route.ts):
   ```typescript
   const CUSTOM_NAMES = {
     mytool: "My Tool",
   };
   ```
4. Verify by running `npm test` and checking [http://localhost:3000](http://localhost:3000).

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

<div align="center">
  <sub>Built with Next.js 16, React 19, and Tailwind CSS. Maintained by <a href="https://github.com/SaadQasim19">Saad Qasim</a>.</sub>
</div>
