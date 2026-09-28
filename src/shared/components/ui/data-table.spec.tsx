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
});
