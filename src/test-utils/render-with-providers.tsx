import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { theme } from '@/shared/theme';

/** Renders with the app theme and a fresh, retry-free React Query client. */
export function renderWithProviders(ui: ReactElement, queryClient = createTestQueryClient()) {
  return {
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>
        <ChakraProvider theme={theme}>{ui}</ChakraProvider>
      </QueryClientProvider>,
    ),
  };
}

export function createTestQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
}
