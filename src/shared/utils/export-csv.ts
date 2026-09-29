/** Escape a CSV cell per RFC 4180-ish rules. */
export function escapeCsvValue(
  value: string | number | boolean | null | undefined,
): string {
  if (value === null || value === undefined) return '';
  const text = String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export type CsvColumn<T> = {
  header: string;
  accessor: (row: T) => string | number | boolean | null | undefined;
};

/** Build a CSV string from rows and column accessors. */
export function rowsToCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((column) => escapeCsvValue(column.header)).join(',');
  const body = rows.map((row) =>
    columns.map((column) => escapeCsvValue(column.accessor(row))).join(','),
  );
  return [header, ...body].join('\n');
}

/** Trigger a browser download for a CSV string. */
export function downloadCsv(filename: string, csv: string): void {
  const safeName = filename.toLowerCase().endsWith('.csv')
    ? filename
    : `${filename}.csv`;
  const blob = new Blob([`\uFEFF${csv}`], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = safeName;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Convert rows to CSV and download in one step. */
export function exportRowsAsCsv<T>(
  filename: string,
  rows: T[],
  columns: CsvColumn<T>[],
): void {
  downloadCsv(filename, rowsToCsv(rows, columns));
}
