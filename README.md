<div align="center">

# Aayushmaan Soni — Blog

A minimal, fast, and beautiful personal blog — built for clarity, not clutter.

Deep-dives on backend engineering, distributed systems, and how things actually work under the hood.

[![Built with Astro](https://astro.badg.es/v2/built-with-astro/tiny.svg)](https://astro.build)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

### 🚀 Performance
![Lighthouse Scores](./public/readme-assets/lighthouse-score.png)

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| ⚡ **Blazing Fast** | Static site generation with Astro for near-instant page loads |
| 🔍 **Client-Side Search** | Full-text search powered by Pagefind — no backend required |
| 🖼️ **Dynamic OG Images** | Auto-generated Open Graph images for every post using Satori + resvg |
| 📡 **RSS & Sitemap** | Automatically generated feeds for subscribers and SEO |
| 🤖 **LLM-Friendly** | Dynamic `llms.txt` and `llms-full.txt` generation |
| 🎨 **Dark / Light Mode** | No-flash theme toggle with dynamic `theme-color` meta |
| ♿ **Accessible & SEO-First** | Semantic HTML, full OG/Twitter tags, and JSON-LD (`BlogPosting`, `WebSite`, `BreadcrumbList`) |
| ✍️ **MDX Support** | Write posts in Markdown with custom components — `Callout`, `Tooltip`, optimized images |
| 💻 **Rich Code Blocks** | Shiki highlighting with filenames, line/word highlight, diff notation, and copy buttons |
| 📝 **Drafts** | Hide work-in-progress with `draft: true`, or exclude whole folders with a `_` prefix |
| 📄 **Pagination** | Clean, numbered pagination for listings |
| 🔒 **Type-Safe** | End-to-end TypeScript with Zod-validated frontmatter |
| ⚙️ **Configurable** | Central `src/config/` for site, content, and social settings |
| 📋 **Definition Lists** | Native Markdown definition list support |
| 📈 **Analytics** | Privacy-friendly analytics via Databuddy |

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|--------------|
| **Framework** | [Astro](https://astro.build) (static output) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) + [`@tailwindcss/typography`](https://github.com/tailwindlabs/tailwindcss-typography) |
| **Content** | [MDX](https://mdxjs.com), Remark (TOC, collapse, definition lists), Rehype (external links) |
| **Search** | [Pagefind](https://pagefind.app) |
| **OG Images** | [Satori](https://github.com/vercel/satori) + [`satori-html`](https://github.com/natemoo-re/satori-html) + [`@resvg/resvg-js`](https://github.com/yisibl/resvg-js) |
| **Syntax Highlighting** | [Shiki](https://shiki.style) with dual light/dark themes, [`@shikijs/transformers`](https://shiki.style/packages/transformers), and a custom filename transformer |
| **Fonts** | [Geist & Geist Mono](https://vercel.com/font) via Fontsource (variable) |
| **Dates** | [Day.js](https://day.js.org) |
| **Analytics** | [Databuddy](https://www.databuddy.cc) |
| **Tooling** | ESLint, Prettier, `astro check` |

---

## 📁 Project Structure

```text
blog/
├── public/                       # Static assets (favicon.ico, og.png) + Pagefind index after build
├── src/
│   ├── components/               # UI components
│   │   └── mdx/                  # MDX components: Callout, Tooltip, MDXImage (+ index.ts mapping)
│   ├── config/                   # site.config.ts, content.config.ts, socials.config.ts
│   ├── content/
│   │   └── writing/
│   │       ├── blogs/            # Long-form posts (.md/.mdx)
│   │       └── short-reads/      # Quick notes and thoughts
│   ├── content.config.ts         # Re-exports collections from config/ (Astro's required discovery path)
│   ├── layouts/                  # BaseLayout (SEO/head), ContentLayout
│   ├── pages/                    # File-based routes + rss.xml / robots.txt / llms.txt / og.png endpoints
│   ├── plugins/                  # Custom Shiki transformer (filename)
│   ├── scripts/                  # Client-side scripts (theme toggle)
│   ├── styles/                   # global.css (theme tokens) + typography.css (prose)
│   ├── templates/                # Satori OG image template
│   └── utils/                    # content / date / seo / text helpers
├── astro.config.mjs              # Astro + Markdown + Shiki + fonts + image config
├── pagefind.yml                  # Search index config
├── tsconfig.json
└── package.json
```

> **Note:** Tailwind v4 is configured in CSS (`@theme` in `src/styles/global.css`) — there is no `tailwind.config.js`.

---

## 🚀 Getting Started

```bash
# Dev server with search index built first (so search works locally)
npm run dev:index

# Plain dev server (search UI shows a dev-mode notice)
npm run dev

# Build for production (astro check + build + pagefind index)
npm run build

# Preview the production build
npm run preview

# Sync content collection types
npm run sync

# Format / lint
npm run format        # write
npm run format:check  # check
npm run lint
```

Copy `.env.example` to `.env` and fill it in. The environment schema is defined in `astro.config.mjs` — `PUBLIC_SITE_URL` and `PORTFOLIO_URL` are required; `DATABUDDY_CLIENT_ID` and `PUBLIC_GOOGLE_SITE_VERIFICATION` are optional.

---

## ⚙️ Configuration

Site-wide settings live in **`src/config/`**:

- **`site.config.ts`** — author, title, description, pagination sizes, timezone, storage keys, Twitter handle.
- **`content.config.ts`** — content collection schemas (Zod) and the `blogs` / `short-reads` glob patterns.
- **`socials.config.ts`** — social links.

```typescript
// src/config/site.config.ts
export const SITE = {
  website: PUBLIC_SITE_URL,
  author: 'Aayushmaan Soni',
  title: 'Aayushmaan Soni',
  description: '…',
  postPerPage: { blogs: 4, shortReads: 4, tags: 4 },
  // …more options
} as const;
```

---

## 📝 Writing Posts

Create a new `.md` / `.mdx` file in `src/content/writing/blogs/` or `src/content/writing/short-reads/` and add frontmatter. New MDX components go in `src/components/mdx/` and are registered in `src/components/mdx/index.ts`.

### Frontmatter

Validated against the Zod schema in `src/config/content.config.ts`.

| Field | Type | Required | Notes |
|-------|------|:--------:|-------|
| `title` | string | ✅ | |
| `pubDatetime` | date | ✅ | Publish date (ISO, e.g. `2026-04-28T10:00:00+05:30`) |
| `description` | string | ✅ *(blogs)* | Used for SEO / social cards |
| `author` | string | — | Defaults to the site author |
| `modDatetime` | date | — | Last-updated date |
| `draft` | boolean | — | Default `false` — see below |
| `featured` | boolean | — | *(blogs only)* pins the post to the **Featured** section on the home page |
| `tags` | string[] | — | Default `['others']` *(blogs only)* |
| `slug` | string | — | Override the auto-generated URL slug |
| `ogImage` | image \| string | — | *(blogs only)* custom social image; otherwise one is auto-generated |
| `canonicalURL` | string | — | Override the canonical URL |
| `timezone` | string | — | Override the site timezone for this post's dates |

*Short-reads* use the same core fields but **without** `featured`, `description`, `tags`, or `ogImage`.

### Hiding & scheduling content

- **`draft: true`** → hidden in production (no page, and absent from listings, RSS, sitemap, and `llms.txt`), but still visible in `npm run dev` so you can preview it.
- **`_` prefix on a file or folder** (e.g. `_wip/`, `_scratch.mdx`) → excluded from the build **entirely**, in dev too. Use it for scratch work you don't even want in local listings.
- **Scheduled posts** → a future `pubDatetime` keeps the post hidden until that time passes (with a small `scheduledPostMargin` from `site.config.ts`).

### Code blocks

Powered by Shiki + transformers. All notations are written as comments in the code's own language (`//`, `#`, etc.).

**Filename tab** — add `file="…"` to the fence's meta:

`````md
```ts file="server.ts"
const port = 3000;
```
`````

**Highlight lines** — `[!code highlight]` marks its line; add `:N` to cover the next N lines:

`````md
```ts
const a = 1; // [!code highlight]
// [!code highlight:2]
const b = 2;
const c = 3;
```
`````

**Highlight a word** — `[!code word:TERM]` highlights every occurrence of `TERM` on the next line (`:N` for N lines):

`````md
```ts
// [!code word:client]
client.set("key", client.get("other"));
```
`````

**Diff (added / removed lines)** — `[!code ++]` / `[!code --]` (ranges with `:N`):

`````md
```ts
function greet() {
  console.log("hi");        // [!code --]
  console.log("hello 👋");  // [!code ++]
}
```
`````

> 🔎 **Copy behavior:** the copy button copies the **added (`++`) and unchanged** lines but **skips removed (`--`) lines** — so readers always copy the correct "after" state, not the old code.

### MDX components

**Callout** — `type` is `note` | `tip` | `warning` | `info`; `title` is optional. The body accepts full markdown (lists, links, `inline code`, multiple paragraphs):

```mdx
<Callout type="tip" title="Pro tip">
  Use **connection pooling** and see the [docs](https://example.com).
</Callout>
```

**Tooltip** — inline hover/focus explanation:

```mdx
The algorithm is <Tooltip note="Quadratic time complexity">O(n²)</Tooltip> here.
```

### Images & captions

Use the Markdown *title* (the quoted text) to add a centered caption:

```md
![Architecture diagram](./assets/arch.png "Figure 1: request flow")
```

- **Local images** (imported from the post's folder) are optimized and made responsive automatically.
- **Remote `https` images** are allowed, and their dimensions are inferred at build time to prevent layout shift (CLS).

### Other Markdown features

- **Definition lists:**
  ```md
  Term
  : Definition
  ```
- **Footnotes:** `Some claim.[^1]` … `[^1]: The reference.`
- **Table of contents:** add a `## Table of Contents` heading — it's auto-filled and rendered as a collapsible block.
- **External links** automatically open in a new tab, get a `↗` marker, and `rel="noopener noreferrer"`.

### Automatic reading extras

Every post gets these for free: estimated **reading time**, a top **reading-progress bar**, hover **heading anchor links**, **copy-code buttons**, and a **back-to-top** button.

---

## License

MIT © 2026 Aayushmaan Soni

---

<div align="center">

**Made with ☕ and [Astro](https://astro.build)**

</div>
