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
  it('renders label and value', () => {
    renderWithChakra(<KpiCard label="Revenue" value="₦18.4M" />);

    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('₦18.4M')).toBeInTheDocument();
  });
});
