<div align="center">
  <img src="https://stackglow.vercel.app/api/icons?i=javascript,typescript,react,nextjs&theme=dark&perline=12" height="70" alt="StackGlow Tech Stack" />
  <h1>StackGlow</h1>
  <p><strong>Dynamic, High-Performance Tech Stack Badges for GitHub Profile READMEs</strong></p>
</div>

---

## ⚡ Overview

**StackGlow** is a fast, lightweight SVG icon generator designed for developer documentation and GitHub profile READMEs. Generate cohesive multi-icon grid badges or individual shield badges with zero latency and full theme customization.

- 🎨 **Unified SVG Grid Badges:** Combine multiple tools into a single sleek card.
- 🌓 **Dynamic Theme Adaptation:** Dark (`#0d1117`) and Light (`#ffffff`) background modes with automatic fill contrast adjustment.
- 📐 **Customizable Layouts:** Configurable icons-per-line (`perline`, default `12`), icon dimensions (`size`, default `70`), and alt descriptions.
- 🚀 **Zero Dependencies & High Cacheability:** Serves raw SVG directly with immutable caching headers.

---

## 🛠️ Usage in GitHub README

### 1. Combined Multi-Icon Badge (Recommended)

Embed a unified tech stack badge with custom height and layout:

```html
<div align="center">
  <img src="https://stackglow.vercel.app/api/icons?i=javascript,typescript,react,nextjs&theme=dark&perline=12" height="70" alt="Tech Stack" />
</div>
```

Or using Markdown:

```markdown
![Tech Stack](https://stackglow.vercel.app/api/icons?i=javascript,typescript,react,nextjs&theme=dark&perline=12&size=70)
```

---

### 2. Individual Shields

Embed individual standalone technology badges:

```html
<p align="center">
  <img src="https://stackglow.vercel.app/api/icons?i=react&theme=dark" height="70" alt="React" />
  <img src="https://stackglow.vercel.app/api/icons?i=typescript&theme=dark" height="70" alt="TypeScript" />
  <img src="https://stackglow.vercel.app/api/icons?i=aws&theme=dark" height="70" alt="AWS" />
</p>
```

---

## 📖 API Query Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `i` | `string` | **Required** | Comma-separated icon slugs (e.g. `javascript,typescript,react,nextjs`) |
| `perline` | `number` | `12` | Number of icons per row before wrapping to a new line (default `12`) |
| `theme` | `"dark" \| "light"` | `"dark"` | Background and fill color scheme (`dark` or `light`) |
| `size` | `number` | `70` | Icon dimensions in pixels (between `16` and `256`, default `70`) |

---

## 💻 Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SaadQasim19/stackglow.git
   cd stackglow
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
