import fs from 'node:fs';
import path from 'node:path';

export interface CaseStudyStat {
  value: string;
  label: string;
  period: string;
}

export interface CaseStudyBullet {
  lead: string;
  body: string | string[];
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

export function getCaseStudyAICSV(slug: string): string | null {
  const csvPath = path.join(STUDIES_DIR, slug, 'ai-data.csv');
  return fs.existsSync(csvPath) ? fs.readFileSync(csvPath, 'utf-8') : null;
}
