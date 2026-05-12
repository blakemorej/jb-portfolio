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
