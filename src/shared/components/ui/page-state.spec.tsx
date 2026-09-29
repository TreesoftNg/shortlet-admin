import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { ErrorState } from '@/shared/components/ui/error-state';
import { PageSkeleton } from '@/shared/components/ui/page-skeleton';
import { theme } from '@/shared/theme';

function renderWithChakra(ui: ReactNode) {
  return render(<ChakraProvider theme={theme}>{ui}</ChakraProvider>);
}

describe('EmptyState', () => {
  it('renders title and description', () => {
    renderWithChakra(
      <EmptyState title="No bookings" description="Create your first booking." />,
    );
    expect(screen.getByText('No bookings')).toBeInTheDocument();
    expect(screen.getByText('Create your first booking.')).toBeInTheDocument();
  });
});

describe('ErrorState', () => {
  it('renders error message and retry', () => {
    const onRetry = jest.fn();
    renderWithChakra(
      <ErrorState message="Failed to load" onRetry={onRetry} />,
    );
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });
});

describe('PageSkeleton', () => {
  it('renders without crashing for table variant', () => {
    const { container } = renderWithChakra(<PageSkeleton variant="table" />);
    expect(container.querySelectorAll('.chakra-skeleton').length).toBeGreaterThan(
      0,
    );
  });
});
