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
