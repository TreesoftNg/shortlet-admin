import { parseVideoLink } from './video-links';

describe('parseVideoLink', () => {
  it('parses YouTube watch, short, and youtu.be URLs', () => {
    expect(parseVideoLink('https://www.youtube.com/watch?v=abc123XYZ_-')).toMatchObject({
      provider: 'youtube',
      videoId: 'abc123XYZ_-',
      embedUrl: 'https://www.youtube.com/embed/abc123XYZ_-',
    });
    expect(parseVideoLink('https://youtu.be/abc123XYZ_-')?.videoId).toBe('abc123XYZ_-');
    expect(parseVideoLink('https://www.youtube.com/shorts/abc123XYZ_-')?.videoId).toBe('abc123XYZ_-');
  });

  it('parses Vimeo URLs', () => {
    expect(parseVideoLink('https://vimeo.com/123456789')).toMatchObject({
      provider: 'vimeo',
      videoId: '123456789',
      embedUrl: 'https://player.vimeo.com/video/123456789',
    });
  });

  it('returns null for unrelated URLs', () => {
    expect(parseVideoLink('not a url')).toBeNull();
    expect(parseVideoLink('https://example.com/watch?v=abc')).toBeNull();
  });
});
