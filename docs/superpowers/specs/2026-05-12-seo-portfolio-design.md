# SEO Portfolio — Design Spec

**Date:** 2026-05-12  
**Owner:** Jonathan Blakemore  
**Status:** Approved

---

## Overview

A personal portfolio website for Jonathan Blakemore (SEO Manager) to accompany CV/job applications. The site showcases SEO achievements through interactive data visualisations sourced from public AHREFS exports. Primary audience is prospective employers.

---

## Goals

- Demonstrate SEO impact with real, verifiable data (AHREFS public data)
- Provide a URL to include on a CV that employers can visit immediately
- Start with 1–3 case studies; scale to more over time without restructuring
- Be maintainable by someone with some technical familiarity (no complex ops)

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Astro | Content Collections for scalable case studies; already familiar |
| Styling | Tailwind CSS | Utility-first, dark theme straightforward |
| Charts | Chart.js + chartjs-plugin-annotation | Interactive, lightweight, no framework dependency |
| Hosting | GitHub Pages | Free, already in GitHub, simple deploy |
| Data format | Raw CSV committed; parsed at build time | AHREFS exports committed as-is, Astro reads + parses at build, inlines as JSON |

---

## Visual Design

**Style:** Dark & Data-Forward  
**Background:** `#0f172a` (slate-900)  
**Surface:** `#1e293b` (slate-800)  
**Border:** `#334155` (slate-700)  
**Primary accent:** `#38bdf8` (sky-400)  
**Secondary accent:** `#818cf8` (indigo-400)  
**Annotation amber:** `#f59e0b`  
**Annotation red:** `#f87171`  
**Body text:** `#94a3b8`  
**Heading text:** `#f1f5f9`

Typography: system sans-serif stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`)

---

## Site Structure

```
/                          Homepage
/about                     About + CV download
/case-studies/[slug]       Individual case study pages (dynamic)
```

### Navigation (all pages)

- Left: **JB** monogram (links to `/`)
- Right: Work · About · **LinkedIn ↗** button
- Sticky, dark background

---

## Page Designs

### Homepage (`/`)

1. **Hero section**
   - Label: `SEO Manager`
   - H1: `Jonathan Blakemore`
   - One-line pitch: e.g. "I grow organic search traffic through technical SEO, content strategy, and data-driven optimisation."
   - 3 headline stat badges, hardcoded in `index.astro` (not computed dynamically — keeps build simple, updated manually when adding case studies): e.g. `+851% Non-Brand Traffic`, `968k Visits/mo`, `3 Case Studies`

2. **Case Studies list**
   - Section label: `Work`
   - One card per case study — client name, industry tag, duration, headline metric, arrow link
   - Cards link to `/case-studies/[slug]`

3. **Footer strip**
   - Location + availability note
   - `About me →` link

---

### About (`/about`)

- Brief professional bio (drawn from CV summary)
- Work history timeline (Corsair, We Influence/Velstar, Aqueous Digital)
- CV download button (links to `/assets/cv.pdf`)
- Link back to case studies

---

### Case Study (`/case-studies/[slug]`)

1. **Back link** — `← Back to all case studies`

2. **Hero**
   - Label: `Case Study · [Industry] · [Date range]`
   - H1: `[Client] — [Subtitle]`
   - Context blurb: 2–3 sentences explaining the situation and mandate
   - 4 stat badges (from case study JSON): value + label

3. **Performance Data section**
   - Source note: `Source: Ahrefs (public data)`
   - **Chart 1 — Non-Brand Organic Traffic** (line): monthly non-branded visits over time; amber dashed annotation at start date
   - **Chart 2 — Total Organic Traffic** (line): all organic visits; red dashed annotation at migration/notable event; amber dashed annotation at start date
   - **Chart 3 — Keyword Ranking Distribution** (line, 2 series): positions 1–3 and 4–10 over time; amber annotation at start date
   - All charts: hover tooltips with exact monthly figures, dark theme

4. **What I Did section**
   - 4–6 bullet points: bold lead phrase + explanatory sentence

5. **Page footer strip**
   - `Jonathan Blakemore · SEO Manager` on left
   - `← Back to all case studies` on right

---

## Data Architecture

### Content Collections

Astro Content Collections manage case studies. Each case study lives at:

```
src/content/case-studies/
  corsair/
    config.json       ← metadata, stat badges, and bullet points
    data.csv          ← AHREFS export (committed as-is, never manually edited)
```

At build time, `[slug].astro` reads `data.csv` via Node's `fs`, parses it into a typed array, and passes it as a serialised JSON prop to `ChartLoader.astro`. Chart.js renders client-side from the inlined data — no client-side CSV fetch required.

### `config.json` schema

```json
{
  "slug": "corsair",
  "client": "CORSAIR",
  "domain": "corsair.com",
  "industry": "Consumer Electronics",
  "role": "SEO Manager",
  "startDate": "2023-08",
  "endDate": null,
  "migrationDate": "2023-05",
  "headline": "SEO Recovery & Growth",
  "intro": "Following a major site migration...",
  "stats": [
    { "value": "+851%", "label": "Non-Brand Traffic", "period": "Aug 2023 → May 2026" },
    { "value": "+313%", "label": "Page 1 Keywords", "period": "Positions 4–10" },
    { "value": "968k",  "label": "Non-Brand Visits/mo", "period": "May 2026" },
    { "value": "20,394","label": "Referring Domains", "period": "+42% from baseline" }
  ],
  "bullets": [
    { "lead": "Post-migration recovery", "body": "Diagnosed and resolved crawl and indexation issues caused by the May 2023 site migration, stabilising rankings within the first quarter." },
    { "lead": "International SEO strategy", "body": "Implemented technical and hreflang infrastructure across 20 regions and 12 languages for CORSAIR, Elgato, SCUF, and Fanatec." },
    { "lead": "Content strategy & optimisation", "body": "Grew the CORSAIR Explorer blog from 1.1k/mo to 510k/mo through content ideation, optimisation, and SEO training for the editorial team." },
    { "lead": "Core Web Vitals", "body": "Achieved \"Good\" rating on all desktop metrics and 2 of 3 mobile metrics." },
    { "lead": "Reporting infrastructure", "body": "Built custom Looker Studio dashboards for organic search reporting across all brands and regions." }
  ]
}
```

### CSV columns used from AHREFS export

| Column | Chart |
|---|---|
| `Avg. organic traffic` | Total Organic Traffic |
| `Organic traffic: Non-branded` | Non-Brand Traffic |
| `Organic positions: 1–3` | Keyword Distribution |
| `Organic positions: 4–10` | Keyword Distribution |

> **Note:** Positions 11–20 column is excluded — data became unreliable due to changes in how Ahrefs tracks extended ranking positions.

---

## Charts

All charts built with Chart.js 4.x + chartjs-plugin-annotation 3.x.

**Shared config:**
- Dark background (`#1e293b`)
- Grid lines: `#ffffff08`
- Tick labels: `#475569`
- Tooltip: dark popover, `#1e293b` background
- Points: hidden at rest, 5px radius on hover
- `tension: 0.35` for smooth curves

**Annotations:**
- Start date (amber `#f59e0b`, dashed, labelled "Joined [Mon YYYY]")
- Migration/notable event (red `#f87171`, dashed, labelled per context)

**Colours:**
- Non-brand line: `#38bdf8`
- Total organic line: `#818cf8`
- Pos 1–3: `#38bdf8`
- Pos 4–10: `#818cf8`

---

## File Structure

```
jb-portfolio/
├── src/
│   ├── content/
│   │   └── case-studies/
│   │       └── corsair/
│   │           ├── config.json
│   │           └── data.csv
│   ├── components/
│   │   ├── Header.astro
│   │   ├── StatBadge.astro
│   │   ├── CaseStudyCard.astro
│   │   └── ChartLoader.astro      ← Chart.js wrapper, uses client:only="vanilla"
│   ├── layouts/
│   │   └── Base.astro
│   └── pages/
│       ├── index.astro
│       ├── about.astro
│       └── case-studies/
│           └── [slug].astro
├── public/
│   └── assets/
│       └── cv.pdf
├── assets/                        ← raw source files (not served)
│   ├── JBlakemoreCV-2025-01.pdf
│   └── corsair.com_perf_*.csv
├── docs/
│   └── superpowers/
│       └── specs/
│           └── 2026-05-12-seo-portfolio-design.md
└── .gitignore
```

---

## Deployment

- GitHub Pages via Astro's `@astrojs/github-pages` adapter (or static output + `gh-pages` branch)
- Domain: TBD (GitHub Pages subdomain initially; custom domain optional later)
- No server-side rendering required — fully static build

---

## Constraints & Notes

- No first-party company data — all metrics sourced from public AHREFS data only
- Positions 11–20 excluded from charts (unreliable tracking changes)
- CV PDF committed to `public/assets/` for direct download link
- `.superpowers/` added to `.gitignore`
- Case studies are intentionally client-named (CORSAIR is public knowledge per role on CV)
