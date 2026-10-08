import { ApiClientError } from '@/shared/api/types';
import { ok } from '@/mocks/utils';
import { mockApi } from '@/mocks/api';

describe('api envelope helpers', () => {
  it('builds a success envelope', () => {
    const response = ok({ id: '1' }, 'Done', { page: 1 });
    expect(response).toEqual({
      success: true,
      data: { id: '1' },
      message: 'Done',
      meta: { page: 1 },
    });
  });

  it('creates typed ApiClientError', () => {
    const error = new ApiClientError('Not found', {
      code: 'RESOURCE_NOT_FOUND',
      status: 404,
    });

    expect(error).toBeInstanceOf(Error);
    expect(error.code).toBe('RESOURCE_NOT_FOUND');
    expect(error.status).toBe(404);
  });
});

describe('mockApi', () => {
  it('returns reservations with pagination meta', async () => {
    const response = await mockApi.getReservations();
    expect(response.success).toBe(true);
    expect(response.meta?.total).toBe(response.data.length);
    expect(response.data[0]).toHaveProperty('platform_id');
    expect(response.data[0]).toHaveProperty('reservation_status');
  });
});
