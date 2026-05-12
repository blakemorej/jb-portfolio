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
