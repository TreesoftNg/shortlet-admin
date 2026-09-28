import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { StatusBadge } from '@/shared/components/ui/status-badge';
import { KpiCard } from '@/shared/components/ui/kpi-card';
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
  it('renders value and positive delta', () => {
    renderWithChakra(
      <KpiCard label="Revenue" value="₦18.4M" deltaPercent={12.5} />,
    );

    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('₦18.4M')).toBeInTheDocument();
    expect(screen.getByText('+12.5%')).toBeInTheDocument();
  });

  it('renders negative delta without plus sign', () => {
    renderWithChakra(
      <KpiCard label="Avg. nightly rate" value="₦92k" deltaPercent={-1.8} />,
    );

    expect(screen.getByText('-1.8%')).toBeInTheDocument();
  });
});
