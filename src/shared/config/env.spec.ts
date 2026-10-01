import { env } from './env';

describe('env.apiUrl', () => {
  const original = process.env.NEXT_PUBLIC_API_URL;
  afterEach(() => {
    process.env.NEXT_PUBLIC_API_URL = original;
  });

  it('returns the URL without a trailing slash', () => {
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:4000/api/v1/';
    expect(env.apiUrl).toBe('http://localhost:4000/api/v1');
  });

  it('explains a missing value', () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    expect(() => env.apiUrl).toThrow(/Copy .env.example to .env/);
  });

  it('rejects relative URLs', () => {
    process.env.NEXT_PUBLIC_API_URL = '/api/v1';
    expect(() => env.apiUrl).toThrow(/absolute URL/);
  });
});
