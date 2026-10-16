import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import { StatusBadge } from '@/shared/components/ui/status-badge';
import { KpiCard } from '@/shared/components/ui/kpi-card';
import { PanelHeader } from '@/shared/components/ui/panel-header';
import { SegmentedControl } from '@/shared/components/ui/segmented-control';
import { theme } from '@/shared/theme';
import type { ReactNode } from 'react';

function renderWithChakra(ui: ReactNode) {
  return render(<ChakraProvider theme={theme}>{ui}</ChakraProvider>);
}

describe('StatusBadge', () => {
  it('renders label text', () => {
    renderWithChakra(<StatusBadge tone="ok">Paid</StatusBadge>);
    expect(screen.getByText('Paid')).toBeInTheDocument();
  });
});

describe('KpiCard', () => {
  it('renders label and value', () => {
    renderWithChakra(<KpiCard label="Revenue" value="₦18.4M" />);

    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('₦18.4M')).toBeInTheDocument();
  });
});

describe('PanelHeader', () => {
  it('renders the title, an optional description and actions', () => {
    renderWithChakra(
      <PanelHeader title="Top units" description="4 units · Last 30 days" actions={<button type="button">View all</button>} />,
    );

    expect(screen.getByRole('heading', { name: 'Top units' })).toBeInTheDocument();
    expect(screen.getByText('4 units · Last 30 days')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View all' })).toBeInTheDocument();
  });
});

describe('SegmentedControl', () => {
  const options = [
    { value: 'revenue', label: 'Revenue' },
    { value: 'bookings', label: 'Bookings' },
  ] as const;

  it('announces the options as a radio group and reports the choice', async () => {
    const onChange = jest.fn();
    renderWithChakra(
      <SegmentedControl label="Rank units by" options={options} value="revenue" onChange={onChange} />,
    );

    expect(screen.getByRole('radiogroup', { name: 'Rank units by' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Revenue' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Bookings' })).toHaveAttribute('aria-checked', 'false');

    await userEvent.click(screen.getByRole('radio', { name: 'Bookings' }));
    expect(onChange).toHaveBeenCalledWith('bookings');
  });
});
