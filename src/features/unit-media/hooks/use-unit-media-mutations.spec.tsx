import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { queryKeys } from '@/shared/api/query-keys';
import { ApiClientError } from '@/shared/api/types';
import { createTestQueryClient } from '@/test-utils/render-with-providers';
import * as mediaApi from '../api/unit-media-api';
import { mediaItem } from '../test-fixtures';
import { useReorderMedia } from './use-unit-media-mutations';

jest.mock('../api/unit-media-api');
const api = jest.mocked(mediaApi);

describe('useReorderMedia', () => {
  it('rolls the gallery back when reorder fails', async () => {
    const first = mediaItem({ id: 'a', sortOrder: 0, caption: 'A' });
    const second = mediaItem({ id: 'b', sortOrder: 1, caption: 'B' });
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(queryKeys.unitMedia.list('unit-1'), [first, second]);
    api.reorderMedia.mockRejectedValue(new ApiClientError('Busy', { code: 'INTERNAL_ERROR', status: 500 }));

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useReorderMedia('unit-1'), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(['b', 'a']).catch(() => undefined);
    });

    expect(queryClient.getQueryData(queryKeys.unitMedia.list('unit-1'))).toEqual([first, second]);
  });
});
