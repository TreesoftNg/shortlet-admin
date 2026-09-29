import {
  escapeCsvValue,
  rowsToCsv,
  type CsvColumn,
} from './export-csv';

describe('export-csv', () => {
  it('escapes commas, quotes, and newlines', () => {
    expect(escapeCsvValue('plain')).toBe('plain');
    expect(escapeCsvValue('a,b')).toBe('"a,b"');
    expect(escapeCsvValue('say "hi"')).toBe('"say ""hi"""');
    expect(escapeCsvValue('line\nbreak')).toBe('"line\nbreak"');
    expect(escapeCsvValue(null)).toBe('');
  });

  it('builds a csv with headers and rows', () => {
    type Row = { name: string; amount: number };
    const columns: CsvColumn<Row>[] = [
      { header: 'Name', accessor: (row) => row.name },
      { header: 'Amount', accessor: (row) => row.amount },
    ];
    const csv = rowsToCsv(
      [
        { name: 'Ada', amount: 10 },
        { name: 'Lee, Jr', amount: 20 },
      ],
      columns,
    );
    expect(csv).toBe('Name,Amount\nAda,10\n"Lee, Jr",20');
  });
});
