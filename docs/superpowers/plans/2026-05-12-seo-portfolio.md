# SEO Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Jonathan Blakemore's SEO portfolio site — Astro + Tailwind + Chart.js, deployed to GitHub Pages, with interactive AHREFS data on case study pages.

**Architecture:** Fully static Astro site. Case studies live in `src/content/case-studies/[slug]/` as a `config.json` + raw AHREFS `data.csv`. At build time, `[slug].astro` reads and parses the CSV via Node `fs`, serialises the data into a `<script type="application/json">` tag, and a vanilla `<script>` initialises Chart.js client-side from that embedded payload — no runtime fetching.

**Tech Stack:** Astro 5, Tailwind CSS 4, Chart.js 4, chartjs-plugin-annotation 3, Vitest, GitHub Pages (static output + GitHub Actions)

---

## File Map

| File | Responsibility |
|---|---|
| `src/utils/parseAhrefsCSV.ts` | Pure function: CSV text → typed `DataPoint[]` |
| `src/utils/getCaseStudies.ts` | Read `config.json` and list slugs from `src/content/case-studies/` |
| `src/utils/formatDate.ts` | Format `"2023-08"` → `"Aug 2023"` |
| `src/content/case-studies/corsair/config.json` | CORSAIR metadata, stats, bullets |
| `src/content/case-studies/corsair/data.csv` | AHREFS export (committed as-is) |
| `src/layouts/Base.astro` | HTML shell, Tailwind globals, `<head>` |
| `src/components/Header.astro` | Sticky nav: JB logo · Work · About · LinkedIn |
| `src/components/StatBadge.astro` | Single stat card: value + label + period |
| `src/components/CaseStudyCard.astro` | Homepage list card: client · industry · metric · link |
| `src/components/ChartLoader.astro` | Embeds chart data; `<script>` initialises Chart.js |
| `src/pages/index.astro` | Homepage: hero, case study list, footer strip |
| `src/pages/about.astro` | About: bio, work history, CV download |
| `src/pages/case-studies/[slug].astro` | Dynamic case study page |
| `tailwind.config.mjs` | Extend theme with portfolio colour tokens |
| `astro.config.mjs` | Site URL, Tailwind integration |
| `.github/workflows/deploy.yml` | Build + deploy to GitHub Pages |

---

## Task 1: Scaffold Project

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tailwind.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`

- [ ] **Step 1: Initialise Astro in the existing directory**

Run from `jb-portfolio/`:
```bash
npm create astro@latest . -- --template minimal --no-git
```
When prompted: TypeScript → Yes (strict), install dependencies → Yes.

- [ ] **Step 2: Add Tailwind**

```bash
npx astro add tailwind
```
Accept all prompts.

- [ ] **Step 3: Install chart and test dependencies**

```bash
npm install chart.js@4.4.0 chartjs-plugin-annotation@3.0.1
npm install -D vitest@2
```

- [ ] **Step 4: Add test script to package.json**

Open `package.json`. Add `"test"` to the `scripts` block:
```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "astro": "astro",
  "test": "vitest run"
}
```

- [ ] **Step 5: Create vitest.config.ts**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
```

- [ ] **Step 6: Update .gitignore**

Ensure `.gitignore` contains:
```
# Astro
dist/
.astro/
node_modules/

# Superpowers brainstorming
.superpowers/
```

- [ ] **Step 7: Verify dev server starts**

```bash
npm run dev
```
Expected: `astro v5.x.x started` with a localhost URL. Open it — should show the default Astro minimal page.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tailwind.config.mjs tsconfig.json vitest.config.ts .gitignore src/
git commit -m "feat: scaffold Astro project with Tailwind and Chart.js"
```

---

## Task 2: Utility Functions + Tests

**Files:**
- Create: `src/utils/parseAhrefsCSV.ts`
- Create: `src/utils/parseAhrefsCSV.test.ts`
- Create: `src/utils/getCaseStudies.ts`
- Create: `src/utils/formatDate.ts`

- [ ] **Step 1: Write the failing tests for parseAhrefsCSV**

```typescript
// src/utils/parseAhrefsCSV.test.ts
import { describe, it, expect } from 'vitest';
import { parseAhrefsCSV } from './parseAhrefsCSV';

const SAMPLE_CSV = `Metric, Referring domains, Avg. organic traffic, Organic positions: 1–3, Organic positions: 4–10, Organic positions: 11–20, Organic entities (traffic): Corsair, Organic entities (traffic): Corsair International, Organic entities (traffic): NVIDIA, Organic entities (traffic): Steam, Organic entities (traffic): Corsair Gaming, Organic traffic: Non-branded
Volume, -, Monthly volume, -, -, -, Monthly volume, Monthly volume, Monthly volume, Monthly volume, Monthly volume, Monthly volume
Location, -, All locations, All locations, All locations, All locations, All locations, All locations, All locations, All locations, All locations, All locations
2021-06, 10731, 1527469, 52050, 29923, 31815, 815662, 2037, 36, 0, 3356, 67791
2021-07, 10977, 1571535, 53906, 32545, 35940, 807057, 4137, 31, 0, 3675, 80879`;

describe('parseAhrefsCSV', () => {
  it('skips the 3 header rows and returns one entry per data row', () => {
    expect(parseAhrefsCSV(SAMPLE_CSV)).toHaveLength(2);
  });

  it('parses date correctly', () => {
    expect(parseAhrefsCSV(SAMPLE_CSV)[0].date).toBe('2021-06');
  });

  it('parses organicTraffic from column 2', () => {
    expect(parseAhrefsCSV(SAMPLE_CSV)[0].organicTraffic).toBe(1527469);
  });

  it('parses pos1to3 from column 3', () => {
    expect(parseAhrefsCSV(SAMPLE_CSV)[0].pos1to3).toBe(52050);
  });

  it('parses pos4to10 from column 4', () => {
    expect(parseAhrefsCSV(SAMPLE_CSV)[0].pos4to10).toBe(29923);
  });

  it('parses nonBranded from column 11', () => {
    expect(parseAhrefsCSV(SAMPLE_CSV)[0].nonBranded).toBe(67791);
  });

  it('handles trailing whitespace in cells', () => {
    const result = parseAhrefsCSV(SAMPLE_CSV);
    expect(result[1].date).toBe('2021-07');
    expect(result[1].nonBranded).toBe(80879);
  });

  it('returns empty array for CSV with only header rows', () => {
    const headersOnly = SAMPLE_CSV.split('\n').slice(0, 3).join('\n');
    expect(parseAhrefsCSV(headersOnly)).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```
Expected: 8 failures — `parseAhrefsCSV` is not defined.

- [ ] **Step 3: Implement parseAhrefsCSV**

```typescript
// src/utils/parseAhrefsCSV.ts
export interface DataPoint {
  date: string;
  organicTraffic: number;
  pos1to3: number;
  pos4to10: number;
  nonBranded: number;
}

export function parseAhrefsCSV(csvText: string): DataPoint[] {
  const lines = csvText
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);
  // First 3 lines are Metric/Volume/Location headers
  return lines.slice(3).map(line => {
    const cols = line.split(',').map(c => c.trim());
    return {
      date: cols[0],
      organicTraffic: parseInt(cols[2]) || 0,
      pos1to3: parseInt(cols[3]) || 0,
      pos4to10: parseInt(cols[4]) || 0,
      nonBranded: parseInt(cols[11]) || 0,
    };
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```
Expected: 8 passing.

- [ ] **Step 5: Create getCaseStudies utility**

```typescript
// src/utils/getCaseStudies.ts
import fs from 'node:fs';
import path from 'node:path';

export interface CaseStudyStat {
  value: string;
  label: string;
  period: string;
}

export interface CaseStudyBullet {
  lead: string;
  body: string;
}

export interface CaseStudyConfig {
  slug: string;
  client: string;
  domain: string;
  industry: string;
  role: string;
  startDate: string;
  endDate: string | null;
  migrationDate?: string;
  headline: string;
  intro: string;
  stats: CaseStudyStat[];
  bullets: CaseStudyBullet[];
}

const STUDIES_DIR = path.join(process.cwd(), 'src/content/case-studies');

export function getCaseStudySlugs(): string[] {
  return fs
    .readdirSync(STUDIES_DIR)
    .filter(entry => fs.statSync(path.join(STUDIES_DIR, entry)).isDirectory());
}

export function getCaseStudyConfig(slug: string): CaseStudyConfig {
  const configPath = path.join(STUDIES_DIR, slug, 'config.json');
  return JSON.parse(fs.readFileSync(configPath, 'utf-8')) as CaseStudyConfig;
}

export function getCaseStudyCSV(slug: string): string {
  const csvPath = path.join(STUDIES_DIR, slug, 'data.csv');
  return fs.readFileSync(csvPath, 'utf-8');
}
```

- [ ] **Step 6: Create formatDate utility**

```typescript
// src/utils/formatDate.ts
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/** Converts "2023-08" → "Aug 2023" */
export function formatYearMonth(ym: string): string {
  const [year, month] = ym.split('-');
  return `${MONTHS[parseInt(month) - 1]} ${year}`;
}

/** Formats a date range: startDate + optional endDate → "Aug 2023 – Present" */
export function formatDateRange(startDate: string, endDate: string | null): string {
  return `${formatYearMonth(startDate)} – ${endDate ? formatYearMonth(endDate) : 'Present'}`;
}
```

- [ ] **Step 7: Commit**

```bash
git add src/utils/
git commit -m "feat: add CSV parser, case study reader, and date format utilities"
```

---

## Task 3: Case Study Content Data

**Files:**
- Create: `src/content/case-studies/corsair/config.json`
- Create: `src/content/case-studies/corsair/data.csv` (copy from `assets/`)

- [ ] **Step 1: Create the content directory**

```bash
mkdir -p src/content/case-studies/corsair
```

- [ ] **Step 2: Create config.json**

```json
// src/content/case-studies/corsair/config.json
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
  "intro": "Following a major site migration in May 2023, organic non-brand traffic had dropped significantly. Taking over as SEO Manager in August 2023, the mandate was to recover lost ground then grow — through technical SEO, international expansion across 20 regions and 12 languages, and a content strategy for the CORSAIR Explorer blog.",
  "stats": [
    { "value": "+851%", "label": "Non-Brand Traffic", "period": "Aug 2023 → May 2026" },
    { "value": "+313%", "label": "Page 1 Keywords", "period": "Positions 4–10" },
    { "value": "968k",  "label": "Non-Brand Visits/mo", "period": "May 2026" },
    { "value": "20,394","label": "Referring Domains", "period": "+42% from baseline" }
  ],
  "bullets": [
    {
      "lead": "Post-migration recovery",
      "body": "Diagnosed and resolved crawl and indexation issues caused by the May 2023 site migration, stabilising rankings within the first quarter."
    },
    {
      "lead": "International SEO strategy",
      "body": "Implemented technical and hreflang infrastructure across 20 regions and 12 languages for CORSAIR, Elgato, SCUF, and Fanatec."
    },
    {
      "lead": "Content strategy & optimisation",
      "body": "Grew the CORSAIR Explorer blog from 1.1k/mo to 510k/mo through content ideation, optimisation, and SEO training for the editorial team."
    },
    {
      "lead": "Core Web Vitals",
      "body": "Achieved \"Good\" rating on all desktop metrics and 2 of 3 mobile metrics."
    },
    {
      "lead": "Reporting infrastructure",
      "body": "Built custom Looker Studio dashboards for organic search reporting across all brands and regions."
    }
  ]
}
```

- [ ] **Step 3: Copy the AHREFS CSV into the content directory**

```bash
cp assets/corsair.com_perf_*.csv src/content/case-studies/corsair/data.csv
```

- [ ] **Step 4: Verify the parser reads it correctly**

```bash
node -e "
const fs = require('fs');
const csv = fs.readFileSync('src/content/case-studies/corsair/data.csv', 'utf-8');
const lines = csv.split('\n').filter(l => l.trim()).slice(3);
console.log('Data rows:', lines.length);
console.log('First row:', lines[0].split(',').slice(0,5).map(s=>s.trim()));
console.log('Last row:', lines.at(-1).split(',').slice(0,5).map(s=>s.trim()));
"
```
Expected output:
```
Data rows: 60
First row: [ '2021-06', '10731', '1527469', '52050', '29923' ]
Last row: [ '2026-05', '20394', '2837959', '83763', '146115' ]
```

- [ ] **Step 5: Commit**

```bash
git add src/content/
git commit -m "feat: add CORSAIR case study content data"
```

---

## Task 4: Base Layout + Tailwind Config

**Files:**
- Modify: `tailwind.config.mjs`
- Modify: `astro.config.mjs`
- Create: `src/styles/global.css`
- Create: `src/layouts/Base.astro`

- [ ] **Step 1: Configure Tailwind with portfolio colour tokens**

```javascript
// tailwind.config.mjs
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:       '#0f172a',
        surface:  '#1e293b',
        border:   '#334155',
        accent:   '#38bdf8',
        accent2:  '#818cf8',
        muted:    '#94a3b8',
        subtle:   '#64748b',
        heading:  '#f1f5f9',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 2: Create global CSS**

```css
/* src/styles/global.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

*, *::before, *::after {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: #0f172a;
  color: #f1f5f9;
  min-height: 100vh;
}
```

- [ ] **Step 3: Update astro.config.mjs**

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://YOUR-GITHUB-USERNAME.github.io',
  integrations: [
    tailwind({ applyBaseStyles: false }),
  ],
});
```
> Replace `YOUR-GITHUB-USERNAME` with your actual GitHub username when you know the repo URL.

- [ ] **Step 4: Create Base.astro layout**

```astro
---
// src/layouts/Base.astro
export interface Props {
  title: string;
  description?: string;
}

const {
  title,
  description = 'Jonathan Blakemore — SEO Manager. Case studies and portfolio.',
} = Astro.props;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <title>{title}</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="stylesheet" href="/src/styles/global.css" />
  </head>
  <body class="font-sans antialiased">
    <slot />
  </body>
</html>
```

> Note: Astro handles the Tailwind import via the integration — the explicit `<link>` to `global.css` is only needed if `applyBaseStyles: false` is set. If the dev server throws a 404 for `global.css`, remove that `<link>` tag and add `import '../styles/global.css'` to the frontmatter of each page instead.

- [ ] **Step 5: Verify dev server still starts**

```bash
npm run dev
```
Expected: no errors in the terminal.

- [ ] **Step 6: Commit**

```bash
git add src/styles/ src/layouts/ tailwind.config.mjs astro.config.mjs
git commit -m "feat: add base layout, Tailwind tokens, and global styles"
```

---

## Task 5: Header Component

**Files:**
- Create: `src/components/Header.astro`

- [ ] **Step 1: Create Header.astro**

```astro
---
// src/components/Header.astro
---

<header class="sticky top-0 z-10 border-b border-border bg-bg">
  <div class="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
    <a href="/" class="text-base font-extrabold tracking-tight text-accent">
      JB
    </a>
    <nav class="flex items-center gap-6">
      <a href="/#work" class="text-sm text-subtle transition-colors hover:text-muted">
        Work
      </a>
      <a href="/about" class="text-sm text-subtle transition-colors hover:text-muted">
        About
      </a>
      <a
        href="https://www.linkedin.com/in/jonathan-blakemore"
        target="_blank"
        rel="noopener noreferrer"
        class="rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-accent transition-colors hover:border-accent"
      >
        LinkedIn ↗
      </a>
    </nav>
  </div>
</header>
```

> Update the LinkedIn URL to the correct profile URL before deploying.

- [ ] **Step 2: Add Header to a test page to verify it renders**

Temporarily add to `src/pages/index.astro`:
```astro
---
import Header from '../components/Header.astro';
---
<Header />
<main class="p-8 text-heading">Hello world</main>
```
Open the dev server. Expected: dark sticky nav with JB logo and LinkedIn button.

- [ ] **Step 3: Commit**

```bash
git add src/components/Header.astro src/pages/index.astro
git commit -m "feat: add sticky header component"
```

---

## Task 6: StatBadge + CaseStudyCard Components

**Files:**
- Create: `src/components/StatBadge.astro`
- Create: `src/components/CaseStudyCard.astro`

- [ ] **Step 1: Create StatBadge.astro**

```astro
---
// src/components/StatBadge.astro
export interface Props {
  value: string;
  label: string;
  period: string;
}

const { value, label, period } = Astro.props;
---

<div class="rounded-lg border border-border bg-surface px-5 py-4 min-w-[120px]">
  <div class="text-2xl font-extrabold leading-none text-accent">{value}</div>
  <div class="mt-1.5 text-[10px] leading-relaxed text-subtle">
    {label}<br />{period}
  </div>
</div>
```

- [ ] **Step 2: Create CaseStudyCard.astro**

```astro
---
// src/components/CaseStudyCard.astro
import type { CaseStudyConfig } from '../utils/getCaseStudies';
import { formatDateRange } from '../utils/formatDate';

export interface Props {
  config: CaseStudyConfig;
}

const { config } = Astro.props;
const dateRange = formatDateRange(config.startDate, config.endDate);
const headlineStat = config.stats[0];
---

<a
  href={`/case-studies/${config.slug}`}
  class="group flex items-center justify-between rounded-lg border border-border bg-surface px-5 py-4 transition-colors hover:border-accent"
>
  <div>
    <div class="text-sm font-semibold text-heading">{config.client}</div>
    <div class="mt-0.5 text-[11px] text-subtle">
      {config.industry} · {dateRange}
    </div>
  </div>
  <div class="flex items-center gap-3">
    <div class="text-sm font-semibold text-accent">{headlineStat.value} {headlineStat.label}</div>
    <div class="text-border transition-colors group-hover:text-accent">→</div>
  </div>
</a>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/StatBadge.astro src/components/CaseStudyCard.astro
git commit -m "feat: add StatBadge and CaseStudyCard components"
```

---

## Task 7: ChartLoader Component

**Files:**
- Create: `src/components/ChartLoader.astro`

- [ ] **Step 1: Create ChartLoader.astro**

```astro
---
// src/components/ChartLoader.astro
import type { DataPoint } from '../utils/parseAhrefsCSV';
import { formatYearMonth } from '../utils/formatDate';

export interface Props {
  data: DataPoint[];
  startDate: string;
  migrationDate?: string;
}

const { data, startDate, migrationDate } = Astro.props;

const startIndex = data.findIndex(d => d.date === startDate);
const migrationIndex = migrationDate
  ? data.findIndex(d => d.date === migrationDate)
  : -1;

const startLabel = formatYearMonth(startDate);
const migrationLabel = migrationDate ? formatYearMonth(migrationDate) : '';

const chartPayload = JSON.stringify({ data, startIndex, migrationIndex, startLabel, migrationLabel });
---

<div class="space-y-4">
  <!-- Embedded data payload for client-side script -->
  <script type="application/json" id="chart-payload" set:html={chartPayload}></script>

  <!-- Chart 1: Non-brand traffic -->
  <div class="rounded-lg border border-border bg-surface p-5">
    <div class="mb-0.5 text-sm font-semibold text-heading">Non-Brand Organic Traffic</div>
    <div class="mb-4 text-[11px] text-subtle">Monthly visits from non-branded keywords</div>
    <canvas id="chart-nb"></canvas>
    <div class="mt-3 flex flex-wrap gap-4">
      <div class="flex items-center gap-1.5 text-[10px] text-subtle">
        <span class="inline-block h-0.5 w-3 rounded bg-accent"></span>Non-brand traffic
      </div>
      <div class="flex items-center gap-1.5 text-[10px] text-[#f59e0b]">
        <span class="inline-block h-0.5 w-3 border-t-2 border-dashed border-[#f59e0b]"></span>Joined {startLabel}
      </div>
    </div>
    <div class="mt-2 text-[9px] text-border">Source: Ahrefs (public data)</div>
  </div>

  <!-- Chart 2: Total organic traffic -->
  <div class="rounded-lg border border-border bg-surface p-5">
    <div class="mb-0.5 text-sm font-semibold text-heading">Total Organic Traffic</div>
    <div class="mb-4 text-[11px] text-subtle">All organic visits including branded keywords</div>
    <canvas id="chart-total"></canvas>
    <div class="mt-3 flex flex-wrap gap-4">
      <div class="flex items-center gap-1.5 text-[10px] text-subtle">
        <span class="inline-block h-0.5 w-3 rounded bg-accent2"></span>Total organic traffic
      </div>
      {migrationLabel && (
        <div class="flex items-center gap-1.5 text-[10px] text-[#f87171]">
          <span class="inline-block h-0.5 w-3 border-t-2 border-dashed border-[#f87171]"></span>Migration {migrationLabel}
        </div>
      )}
      <div class="flex items-center gap-1.5 text-[10px] text-[#f59e0b]">
        <span class="inline-block h-0.5 w-3 border-t-2 border-dashed border-[#f59e0b]"></span>Joined {startLabel}
      </div>
    </div>
    <div class="mt-2 text-[9px] text-border">Source: Ahrefs (public data)</div>
  </div>

  <!-- Chart 3: Keyword rankings -->
  <div class="rounded-lg border border-border bg-surface p-5">
    <div class="mb-0.5 text-sm font-semibold text-heading">Keyword Ranking Distribution</div>
    <div class="mb-4 text-[11px] text-subtle">Monthly count of keywords ranked in positions 1–3 and 4–10</div>
    <canvas id="chart-kw"></canvas>
    <div class="mt-3 flex flex-wrap gap-4">
      <div class="flex items-center gap-1.5 text-[10px] text-subtle">
        <span class="inline-block h-0.5 w-3 rounded bg-accent"></span>Positions 1–3
      </div>
      <div class="flex items-center gap-1.5 text-[10px] text-subtle">
        <span class="inline-block h-0.5 w-3 rounded bg-accent2"></span>Positions 4–10
      </div>
      <div class="flex items-center gap-1.5 text-[10px] text-[#f59e0b]">
        <span class="inline-block h-0.5 w-3 border-t-2 border-dashed border-[#f59e0b]"></span>Joined {startLabel}
      </div>
    </div>
    <div class="mt-2 text-[9px] text-border">Source: Ahrefs (public data)</div>
  </div>
</div>

<script>
  import Chart from 'chart.js/auto';
  import annotationPlugin from 'chartjs-plugin-annotation';

  Chart.register(annotationPlugin);

  const payload = JSON.parse(
    document.getElementById('chart-payload')!.textContent!
  );
  const { data, startIndex, migrationIndex, startLabel, migrationLabel } = payload;

  const labels: string[] = data.map((d: { date: string }) => {
    const [year, month] = d.date.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[parseInt(month) - 1]} ${year.slice(2)}`;
  });

  const fmtK = (v: number) =>
    v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M`
    : v >= 1_000   ? `${Math.round(v / 1_000)}k`
    : String(v);

  const TOOLTIP = {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    borderWidth: 1,
    titleColor: '#94a3b8',
    bodyColor: '#f1f5f9',
    padding: 10,
  };

  const SCALES = {
    x: {
      ticks: { color: '#475569', font: { size: 10 }, maxTicksLimit: 10, maxRotation: 0 },
      grid: { color: '#ffffff08' },
    },
    y: {
      ticks: { color: '#475569', font: { size: 10 }, callback: fmtK },
      grid: { color: '#ffffff08' },
    },
  };

  function joinAnnotation(label: string) {
    return {
      type: 'line' as const,
      xMin: startIndex,
      xMax: startIndex,
      borderColor: '#f59e0b',
      borderWidth: 2,
      borderDash: [5, 4],
      label: {
        display: true,
        content: `Joined ${label}`,
        color: '#f59e0b',
        backgroundColor: 'rgba(15,23,42,0.9)',
        font: { size: 10, weight: '600' as const },
        position: 'start' as const,
        yAdjust: 8,
      },
    };
  }

  function migrationAnnotation(label: string) {
    return {
      type: 'line' as const,
      xMin: migrationIndex,
      xMax: migrationIndex,
      borderColor: '#f87171',
      borderWidth: 1,
      borderDash: [4, 4],
      label: {
        display: true,
        content: `Migration ${label}`,
        color: '#f87171',
        backgroundColor: 'rgba(15,23,42,0.9)',
        font: { size: 10 },
        position: 'start' as const,
        yAdjust: 32,
      },
    };
  }

  function lineDataset(values: number[], color: string) {
    return {
      data: values,
      borderColor: color,
      backgroundColor: `${color}15`,
      fill: true,
      tension: 0.35,
      pointRadius: 0,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: color,
      borderWidth: 2,
    };
  }

  // Chart 1 — Non-brand traffic
  new Chart(document.getElementById('chart-nb') as HTMLCanvasElement, {
    type: 'line',
    data: {
      labels,
      datasets: [lineDataset(data.map((d: any) => d.nonBranded), '#38bdf8')],
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: { ...TOOLTIP, callbacks: { label: ctx => `  ${ctx.parsed.y.toLocaleString()} visits` } },
        annotation: { annotations: { joinLine: joinAnnotation(startLabel) } },
      },
      scales: SCALES,
    },
  });

  // Chart 2 — Total organic traffic
  const totalAnnotations: Record<string, object> = { joinLine: joinAnnotation(startLabel) };
  if (migrationIndex >= 0) totalAnnotations.migLine = migrationAnnotation(migrationLabel);

  new Chart(document.getElementById('chart-total') as HTMLCanvasElement, {
    type: 'line',
    data: {
      labels,
      datasets: [{ ...lineDataset(data.map((d: any) => d.organicTraffic), '#818cf8'), fill: false }],
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: { ...TOOLTIP, callbacks: { label: ctx => `  ${ctx.parsed.y.toLocaleString()} visits` } },
        annotation: { annotations: totalAnnotations },
      },
      scales: SCALES,
    },
  });

  // Chart 3 — Keyword ranking distribution
  new Chart(document.getElementById('chart-kw') as HTMLCanvasElement, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { ...lineDataset(data.map((d: any) => d.pos1to3),  '#38bdf8'), fill: false, label: 'Pos 1–3' },
        { ...lineDataset(data.map((d: any) => d.pos4to10), '#818cf8'), fill: false, label: 'Pos 4–10' },
      ],
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          ...TOOLTIP,
          callbacks: { label: ctx => `  ${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()}` },
        },
        annotation: { annotations: { joinLine: joinAnnotation(startLabel) } },
      },
      scales: SCALES,
    },
  });
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ChartLoader.astro
git commit -m "feat: add ChartLoader component with Chart.js line charts and annotations"
```

---

## Task 8: Case Study Page

**Files:**
- Create: `src/pages/case-studies/[slug].astro`

- [ ] **Step 1: Create the dynamic case study page**

```astro
---
// src/pages/case-studies/[slug].astro
import Base from '../../layouts/Base.astro';
import Header from '../../components/Header.astro';
import StatBadge from '../../components/StatBadge.astro';
import ChartLoader from '../../components/ChartLoader.astro';
import { getCaseStudySlugs, getCaseStudyConfig, getCaseStudyCSV } from '../../utils/getCaseStudies';
import { parseAhrefsCSV } from '../../utils/parseAhrefsCSV';
import { formatDateRange } from '../../utils/formatDate';

export async function getStaticPaths() {
  return getCaseStudySlugs().map(slug => ({ params: { slug } }));
}

const { slug } = Astro.params;
const config = getCaseStudyConfig(slug!);
const data = parseAhrefsCSV(getCaseStudyCSV(slug!));
const dateRange = formatDateRange(config.startDate, config.endDate);
---

<Base title={`${config.client} — ${config.headline} | Jonathan Blakemore`} description={config.intro}>
  <Header />

  <main class="mx-auto max-w-4xl px-6 pb-20 pt-12">

    <!-- Breadcrumb -->
    <a href="/#work" class="mb-8 inline-block text-sm text-accent hover:underline">
      ← Back to all case studies
    </a>

    <!-- Hero -->
    <div class="mb-12">
      <div class="mb-3 text-[10px] uppercase tracking-widest text-subtle">
        Case Study · {config.industry} · {dateRange}
      </div>
      <h1 class="mb-4 text-4xl font-extrabold leading-tight tracking-tight text-heading">
        {config.client}<br />
        <span class="text-muted">{config.headline}</span>
      </h1>
      <p class="mb-8 max-w-2xl text-base leading-relaxed text-muted">
        {config.intro}
      </p>
      <div class="flex flex-wrap gap-3">
        {config.stats.map(stat => (
          <StatBadge value={stat.value} label={stat.label} period={stat.period} />
        ))}
      </div>
    </div>

    <!-- Charts -->
    <section class="mb-12">
      <div class="mb-4 border-b border-border pb-2 text-[10px] uppercase tracking-widest text-subtle">
        Performance Data
      </div>
      <ChartLoader
        data={data}
        startDate={config.startDate}
        migrationDate={config.migrationDate}
      />
    </section>

    <!-- What I Did -->
    <section class="mb-12">
      <div class="mb-4 border-b border-border pb-2 text-[10px] uppercase tracking-widest text-subtle">
        What I Did
      </div>
      <ul class="space-y-4">
        {config.bullets.map(bullet => (
          <li class="flex gap-3">
            <span class="mt-1 shrink-0 text-sm text-accent">▸</span>
            <span class="text-sm leading-relaxed text-muted">
              <strong class="font-semibold text-heading">{bullet.lead}</strong>
              {' — '}{bullet.body}
            </span>
          </li>
        ))}
      </ul>
    </section>

    <!-- Page footer strip -->
    <div class="flex items-center justify-between border-t border-border pt-6">
      <span class="text-sm text-subtle">Jonathan Blakemore · SEO Manager</span>
      <a href="/#work" class="text-sm text-accent hover:underline">← Back to all case studies</a>
    </div>

  </main>
</Base>
```

- [ ] **Step 2: Visit the page in dev**

```bash
npm run dev
```
Open `http://localhost:4321/case-studies/corsair`. Expected:
- Dark page with sticky header
- Hero with +851%, +313%, 968k, 20,394 stat badges
- Three interactive line charts with real data
- Hover tooltips working on all charts
- "Joined Aug 2023" amber annotation visible on all charts
- "Migration May 2023" red annotation on total organic chart
- "What I Did" bullets below

- [ ] **Step 3: Run build to verify no type errors**

```bash
npm run build
```
Expected: `dist/` generated with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/case-studies/
git commit -m "feat: add dynamic case study page with charts and content"
```

---

## Task 9: Homepage

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Build the homepage**

```astro
---
// src/pages/index.astro
import Base from '../layouts/Base.astro';
import Header from '../components/Header.astro';
import CaseStudyCard from '../components/CaseStudyCard.astro';
import { getCaseStudySlugs, getCaseStudyConfig } from '../utils/getCaseStudies';

const slugs = getCaseStudySlugs();
const studies = slugs.map(slug => getCaseStudyConfig(slug));
---

<Base title="Jonathan Blakemore — SEO Manager">
  <Header />

  <main class="mx-auto max-w-4xl px-6 pb-20 pt-16">

    <!-- Hero -->
    <section class="mb-16 border-b border-border pb-14">
      <div class="mb-3 text-[10px] uppercase tracking-widest text-accent">SEO Manager</div>
      <h1 class="mb-4 text-5xl font-extrabold leading-tight tracking-tight text-heading">
        Jonathan Blakemore
      </h1>
      <p class="mb-8 max-w-xl text-base leading-relaxed text-muted">
        I grow organic search traffic through technical SEO, content strategy, and data-driven
        optimisation. Here&apos;s the proof.
      </p>
      <!-- Hardcoded headline stats — update when adding case studies -->
      <div class="flex flex-wrap gap-3">
        <div class="rounded-lg border border-border bg-surface px-5 py-4">
          <div class="text-2xl font-extrabold text-accent">+851%</div>
          <div class="mt-1 text-[10px] text-subtle">Non-Brand Traffic</div>
        </div>
        <div class="rounded-lg border border-border bg-surface px-5 py-4">
          <div class="text-2xl font-extrabold text-accent">968k</div>
          <div class="mt-1 text-[10px] text-subtle">Non-Brand Visits/mo</div>
        </div>
        <div class="rounded-lg border border-border bg-surface px-5 py-4">
          <div class="text-2xl font-extrabold text-accent">{studies.length}</div>
          <div class="mt-1 text-[10px] text-subtle">Case {studies.length === 1 ? 'Study' : 'Studies'}</div>
        </div>
      </div>
    </section>

    <!-- Case studies list -->
    <section id="work" class="mb-16">
      <div class="mb-4 text-[10px] uppercase tracking-widest text-subtle">Work</div>
      <div class="flex flex-col gap-3">
        {studies.map(config => (
          <CaseStudyCard config={config} />
        ))}
      </div>
    </section>

    <!-- Footer strip -->
    <div class="flex items-center justify-between border-t border-border pt-6">
      <span class="text-sm text-subtle">Based in Chester, UK · Open to opportunities</span>
      <a href="/about" class="text-sm text-accent hover:underline">About me →</a>
    </div>

  </main>
</Base>
```

- [ ] **Step 2: Verify homepage in dev**

Open `http://localhost:4321`. Expected:
- Hero with headline stats
- One CORSAIR card with "+851% Non-Brand Traffic" and arrow link
- Footer strip with location and "About me →"
- Clicking the card navigates to `/case-studies/corsair`

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: add homepage with hero, case study list, and footer strip"
```

---

## Task 10: About Page

**Files:**
- Create: `src/pages/about.astro`
- Create: `public/assets/cv.pdf` (copy from `assets/`)

- [ ] **Step 1: Copy CV to public directory**

```bash
mkdir -p public/assets
cp "assets/JBlakemoreCV-2025-01 - AI Supported.pdf" public/assets/cv.pdf
```

- [ ] **Step 2: Create about.astro**

```astro
---
// src/pages/about.astro
import Base from '../layouts/Base.astro';
import Header from '../components/Header.astro';
---

<Base
  title="About — Jonathan Blakemore"
  description="Jonathan Blakemore is an SEO Manager with 10 years of experience in technical SEO, content strategy, and performance reporting."
>
  <Header />

  <main class="mx-auto max-w-3xl px-6 pb-20 pt-12">

    <a href="/" class="mb-8 inline-block text-sm text-accent hover:underline">← Back</a>

    <!-- Bio -->
    <section class="mb-12">
      <div class="mb-3 text-[10px] uppercase tracking-widest text-subtle">About</div>
      <h1 class="mb-4 text-4xl font-extrabold tracking-tight text-heading">Jonathan Blakemore</h1>
      <div class="mb-6 text-sm font-semibold uppercase tracking-widest text-accent">SEO Manager</div>
      <div class="space-y-4 text-base leading-relaxed text-muted">
        <p>
          SEO Manager with 10 years of experience across technical SEO, content strategy, and
          performance reporting. Currently directing the organic search strategy for CORSAIR, Elgato,
          SCUF, and Fanatec at Corsair Components Limited.
        </p>
        <p>
          Specialisms include post-migration recovery, international SEO (hreflang, multiregional
          architecture), Core Web Vitals, and building reporting infrastructure in Looker Studio.
          Comfortable working across large-scale e-commerce and SaaS environments.
        </p>
        <p>
          Previously spent six years as a Technical SEO Executive at We Influence / Velstar, managing
          SEO audits, keyword research, migrations, and client reporting across a diverse portfolio.
          Earlier career covered the full digital marketing mix at Aqueous Digital.
        </p>
      </div>
    </section>

    <!-- CV download -->
    <section class="mb-12">
      <a
        href="/assets/cv.pdf"
        download
        class="inline-flex items-center gap-2 rounded-lg border border-accent bg-surface px-5 py-3 text-sm font-semibold text-accent transition-colors hover:bg-accent hover:text-bg"
      >
        Download CV (PDF) ↓
      </a>
    </section>

    <!-- Work history -->
    <section class="mb-12">
      <div class="mb-6 text-[10px] uppercase tracking-widest text-subtle">Work History</div>
      <div class="space-y-8">

        <div class="flex gap-5">
          <div class="w-28 shrink-0 text-[11px] text-subtle">Aug 2023 – Present</div>
          <div>
            <div class="text-sm font-semibold text-heading">SEO Manager</div>
            <div class="mb-2 text-sm text-muted">Corsair Components Limited</div>
            <p class="text-sm leading-relaxed text-subtle">
              Directing technical SEO strategy across CORSAIR, Elgato, SCUF, and Fanatec.
              20 regions, 12 languages. Post-migration recovery, international SEO, blog growth,
              Core Web Vitals, Looker Studio dashboards.
            </p>
          </div>
        </div>

        <div class="flex gap-5">
          <div class="w-28 shrink-0 text-[11px] text-subtle">Nov 2017 – Jul 2023</div>
          <div>
            <div class="text-sm font-semibold text-heading">Technical SEO Executive</div>
            <div class="mb-2 text-sm text-muted">We Influence / Velstar</div>
            <p class="text-sm leading-relaxed text-subtle">
              Technical SEO for a portfolio of diverse clients. Audits, keyword research,
              competitor analysis, CMS migrations, client reporting. Managed junior
              executive workflow and training.
            </p>
          </div>
        </div>

        <div class="flex gap-5">
          <div class="w-28 shrink-0 text-[11px] text-subtle">Jun 2015 – Nov 2017</div>
          <div>
            <div class="text-sm font-semibold text-heading">Senior Digital Marketing Executive</div>
            <div class="mb-2 text-sm text-muted">Aqueous Digital</div>
            <p class="text-sm leading-relaxed text-subtle">
              Full digital marketing mix — SEO, content, paid search (Google & Bing), CRO,
              link building, and online reputation management.
            </p>
          </div>
        </div>

      </div>
    </section>

    <!-- Education -->
    <section class="mb-12">
      <div class="mb-6 text-[10px] uppercase tracking-widest text-subtle">Education</div>
      <div class="space-y-4">
        <div class="flex gap-5">
          <div class="w-28 shrink-0 text-[11px] text-subtle">2011 – 2014</div>
          <div>
            <div class="text-sm font-semibold text-heading">University of Chester</div>
            <div class="text-sm text-muted">Information Systems Management, 2:1</div>
          </div>
        </div>
        <div class="flex gap-5">
          <div class="w-28 shrink-0 text-[11px] text-subtle">2022</div>
          <div>
            <div class="text-sm font-semibold text-heading">Zero to Mastery</div>
            <div class="text-sm text-muted">Complete Python Developer — Certificate of Completion</div>
          </div>
        </div>
      </div>
    </section>

    <div class="border-t border-border pt-6">
      <a href="/" class="text-sm text-accent hover:underline">← View case studies</a>
    </div>

  </main>
</Base>
```

- [ ] **Step 3: Verify about page in dev**

Open `http://localhost:4321/about`. Expected:
- Bio section with three paragraphs
- "Download CV (PDF) ↓" button — clicking downloads `/assets/cv.pdf`
- Work history timeline with all three roles
- Education section

- [ ] **Step 4: Commit**

```bash
git add src/pages/about.astro public/assets/cv.pdf
git commit -m "feat: add about page with bio, work history, and CV download"
```

---

## Task 11: GitHub Pages Deployment

**Files:**
- Modify: `astro.config.mjs`
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Update astro.config.mjs with your GitHub Pages site URL**

You need your GitHub username. The repo is `jb-portfolio`. Replace `YOUR-GITHUB-USERNAME` below with your actual username:

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://YOUR-GITHUB-USERNAME.github.io',
  base: '/jb-portfolio',
  integrations: [
    tailwind({ applyBaseStyles: false }),
  ],
});
```

> If you plan to use a custom domain (e.g. `jonblakemore.co.uk`), set `site` to that domain and remove `base`.

- [ ] **Step 2: Update Header links to account for the base path**

In `src/components/Header.astro`, the `href="/"` links will 404 under a base path. Update:

```astro
<a href={import.meta.env.BASE_URL} class="text-base font-extrabold tracking-tight text-accent">
  JB
</a>
```
And:
```astro
<a href={`${import.meta.env.BASE_URL}#work`} ...>Work</a>
<a href={`${import.meta.env.BASE_URL}about`} ...>About</a>
```

- [ ] **Step 3: Create GitHub Actions workflow**

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

- [ ] **Step 4: Enable GitHub Pages in your repo settings**

1. Push this repo to GitHub: `git remote add origin https://github.com/YOUR-USERNAME/jb-portfolio.git && git push -u origin main`
2. In GitHub → Settings → Pages → Source: select **GitHub Actions**

- [ ] **Step 5: Run a final local build to confirm no errors**

```bash
npm run build && npm run preview
```
Open `http://localhost:4321/jb-portfolio`. Expected: full site loads, all three pages work, charts render.

- [ ] **Step 6: Commit and push**

```bash
git add astro.config.mjs src/components/Header.astro .github/
git commit -m "feat: add GitHub Pages deployment workflow"
git push origin main
```
Expected: GitHub Actions runs, site deploys to `https://YOUR-USERNAME.github.io/jb-portfolio`.

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
|---|---|
| Dark & data-forward visual style with defined colour tokens | Task 4 |
| Sticky header: JB logo, Work, About, LinkedIn button | Task 5 |
| Homepage hero with stat badges (hardcoded) | Task 9 |
| Homepage case study list (dynamic from fs) | Task 9 |
| Homepage footer strip | Task 9 |
| About page: bio, work history, CV download | Task 10 |
| Case study page: hero, label, stat badges | Task 8 |
| Chart 1: Non-brand traffic line chart + annotation | Task 7 |
| Chart 2: Total organic line chart + join + migration annotation | Task 7 |
| Chart 3: Keyword positions 1–3 and 4–10 (11–20 excluded) | Task 7 |
| Hover tooltips with exact figures | Task 7 |
| CSV parsed at build time, no client-side fetch | Tasks 2, 7, 8 |
| `config.json` schema with stats + bullets | Task 3 |
| CORSAIR data committed as raw CSV | Task 3 |
| GitHub Pages deployment with GH Actions | Task 11 |
| `.superpowers/` in `.gitignore` | Task 1 |
| CV PDF downloadable from About page | Task 10 |

All spec requirements covered. No gaps found.
