import { createEmptyPropertyForm } from '../utils/property-form';
import * as uploadProgress from '@/features/unit-media/api/upload-with-progress';
import * as client from '@/shared/api/client';
import {
  createProperty,
  updateProperty,
  uploadPropertyCover,
} from './properties-service';

jest.mock('@/shared/api/client');
jest.mock('@/features/unit-media/api/upload-with-progress');

const apiClient = jest.mocked(client.apiClient);
const uploadApi = jest.mocked(uploadProgress.uploadApiWithProgress);

const apiProperty = {
  id: 'prop-1',
  name: 'Azure',
  street: '12 Admiralty',
  city: 'Lekki',
  country: 'NG',
  pictureUrl: 'https://cdn.test/cover.webp',
};

describe('properties-service cover upload', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    apiClient.mockResolvedValue({ success: true, data: apiProperty } as never);
    uploadApi.mockResolvedValue({
      success: true,
      data: { ...apiProperty, pictureUrl: 'https://cdn.test/new.webp' },
    } as never);
  });

  it('uploads a pending cover file after create', async () => {
    const file = new File(['x'], 'cover.png', { type: 'image/png' });
    await createProperty({
      ...createEmptyPropertyForm(),
      name: 'Azure',
      line1: '12 Admiralty',
      city: 'Lekki',
      country: 'NG',
      images: [
        {
          id: 'local-1',
          url: 'data:image/png;base64,AAAA',
          caption: 'cover',
          sort_order: 0,
          file,
        },
      ],
    });

    expect(apiClient).toHaveBeenCalledWith(
      expect.stringContaining('/properties'),
      expect.objectContaining({
        method: 'POST',
        body: expect.objectContaining({ pictureUrl: null }),
      }),
    );
    expect(uploadApi).toHaveBeenCalledWith(
      expect.stringContaining('/properties/prop-1/cover'),
      expect.any(FormData),
    );
  });

  it('uploads a pending cover file after update', async () => {
    const file = new File(['x'], 'cover.png', { type: 'image/png' });
    await updateProperty('prop-1', {
      ...createEmptyPropertyForm(),
      name: 'Azure',
      line1: '12 Admiralty',
      city: 'Lekki',
      country: 'NG',
      images: [
        {
          id: 'local-1',
          url: 'data:image/png;base64,AAAA',
          caption: 'cover',
          sort_order: 0,
          file,
        },
      ],
    });

    const patchBody = apiClient.mock.calls[0]?.[1]?.body as Record<
      string,
      unknown
    >;
    expect(patchBody).not.toHaveProperty('pictureUrl');
    expect(uploadApi).toHaveBeenCalled();
  });

  it('uploadPropertyCover posts multipart form data', async () => {
    const file = new File(['x'], 'cover.png', { type: 'image/png' });
    await uploadPropertyCover('prop-1', file);
    const form = uploadApi.mock.calls[0]?.[1] as FormData;
    expect(form.get('file')).toBe(file);
  });
});
