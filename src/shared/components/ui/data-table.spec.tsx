import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { DataTable, type DataTableColumn } from '@/shared/components/ui/data-table';
import { theme } from '@/shared/theme';

type Row = { id: string; name: string; amount: number };

const rows: Row[] = [
  { id: '1', name: 'Alpha', amount: 100 },
  { id: '2', name: 'Beta', amount: 200 },
];

const columns: DataTableColumn<Row>[] = [
  { id: 'name', header: 'Name', cell: (row) => row.name },
  { id: 'amount', header: 'Amount', cell: (row) => row.amount, isNumeric: true },
];

function renderWithChakra(ui: ReactNode) {
  return render(<ChakraProvider theme={theme}>{ui}</ChakraProvider>);
}

describe('DataTable', () => {
  it('renders headers and row cells', () => {
    renderWithChakra(
      <DataTable columns={columns} data={rows} getRowId={(row) => row.id} />,
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('shows empty message when there is no data', () => {
    renderWithChakra(
      <DataTable
        columns={columns}
        data={[]}
        getRowId={(row) => row.id}
        emptyMessage="Nothing here"
      />,
    );

    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('calls onRowClick when a row is clicked', async () => {
    const user = userEvent.setup();
    const onRowClick = jest.fn();

    renderWithChakra(
      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        onRowClick={onRowClick}
      />,
    );

    await user.click(screen.getByText('Alpha'));
    expect(onRowClick).toHaveBeenCalledWith(rows[0]);
  });

  it('keeps plain headers when the table cannot be sorted', () => {
    renderWithChakra(
      <DataTable
        columns={columns.map((column) => ({ ...column, sortable: true }))}
        data={rows}
        getRowId={(row) => row.id}
      />,
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Name' })).not.toHaveAttribute('aria-sort');
  });

  it('turns sortable headers into sort buttons', async () => {
    const user = userEvent.setup();
    const onSortChange = jest.fn();
    const sortableColumns: DataTableColumn<Row, 'name' | 'amount'>[] = [
      { id: 'name', header: 'Name', cell: (row) => row.name, sortable: true },
      { id: 'amount', header: 'Amount', cell: (row) => row.amount, isNumeric: true, sortable: true },
    ];

    renderWithChakra(
      <DataTable
        label="Totals"
        columns={sortableColumns}
        data={rows}
        getRowId={(row) => row.id}
        sort={{ columnId: 'name', direction: 'asc' }}
        onSortChange={onSortChange}
      />,
    );

    expect(screen.getByRole('table', { name: 'Totals' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveAttribute('aria-sort', 'ascending');
    expect(screen.getByRole('columnheader', { name: 'Amount' })).toHaveAttribute('aria-sort', 'none');

    await user.click(screen.getByRole('button', { name: 'Name' }));
    expect(onSortChange).toHaveBeenLastCalledWith({ columnId: 'name', direction: 'desc' });

    // A new column starts with the largest numbers first.
    await user.click(screen.getByRole('button', { name: 'Amount' }));
    expect(onSortChange).toHaveBeenLastCalledWith({ columnId: 'amount', direction: 'desc' });
  });

  it('starts a new text column A–Z', async () => {
    const user = userEvent.setup();
    const onSortChange = jest.fn();

    renderWithChakra(
      <DataTable
        columns={columns.map((column) => ({ ...column, sortable: true }))}
        data={rows}
        getRowId={(row) => row.id}
        sort={{ columnId: 'amount', direction: 'desc' }}
        onSortChange={onSortChange}
      />,
    );

    expect(screen.getByRole('columnheader', { name: 'Amount' })).toHaveAttribute('aria-sort', 'descending');
    await user.click(screen.getByRole('button', { name: 'Name' }));
    expect(onSortChange).toHaveBeenCalledWith({ columnId: 'name', direction: 'asc' });
  });

  it('adds a totals row when columns have footers', () => {
    renderWithChakra(
      <DataTable
        columns={[
          { ...columns[0], footer: 'Total' },
          { ...columns[1], footer: 300 },
        ]}
        data={rows}
        getRowId={(row) => row.id}
      />,
    );

    const totals = screen.getAllByRole('row').at(-1)!;
    expect(totals).toHaveTextContent('Total300');
  });

  it('has no totals row without footers', () => {
    renderWithChakra(
      <DataTable columns={columns} data={rows} getRowId={(row) => row.id} />,
    );

    expect(screen.getAllByRole('row')).toHaveLength(3);
  });
});
