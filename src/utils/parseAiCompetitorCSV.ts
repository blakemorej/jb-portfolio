export interface AiDataPoint {
  site: string;
  platform: string;
  responses: number;
  pages: number;
}

export function parseAiCompetitorCSV(csv: string): AiDataPoint[] {
  return csv
    .trim()
    .split('\n')
    .slice(1)
    .map(line => {
      const [site, platform, responses, pages] = line.split(',');
      return {
        site: site.trim(),
        platform: platform.trim(),
        responses: parseInt(responses.trim(), 10),
        pages: parseInt(pages.trim(), 10),
      };
    });
}
