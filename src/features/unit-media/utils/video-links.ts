export type ParsedVideoLink = {
  provider: 'youtube' | 'vimeo';
  videoId: string;
  embedUrl: string;
  thumbnailUrl: string;
  watchUrl: string;
};

function youtubeId(url: URL): string | null {
  if (url.hostname === 'youtu.be') {
    return url.pathname.replace(/^\//, '').split('/')[0] || null;
  }
  if (url.hostname.includes('youtube.com')) {
    if (url.pathname === '/watch') return url.searchParams.get('v');
    const parts = url.pathname.split('/').filter(Boolean);
    if ((parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live') && parts[1]) {
      return parts[1];
    }
  }
  return null;
}

function vimeoId(url: URL): string | null {
  if (!url.hostname.includes('vimeo.com')) return null;
  const parts = url.pathname.split('/').filter(Boolean);
  const id = parts.find((part) => /^\d+$/.test(part));
  return id ?? null;
}

/** Recognises YouTube/Vimeo URLs for an instant preview before saving. */
export function parseVideoLink(raw: string): ParsedVideoLink | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;

  const yt = youtubeId(url);
  if (yt) {
    return {
      provider: 'youtube',
      videoId: yt,
      embedUrl: `https://www.youtube.com/embed/${yt}`,
      thumbnailUrl: `https://img.youtube.com/vi/${yt}/hqdefault.jpg`,
      watchUrl: `https://www.youtube.com/watch?v=${yt}`,
    };
  }

  const vimeo = vimeoId(url);
  if (vimeo) {
    return {
      provider: 'vimeo',
      videoId: vimeo,
      embedUrl: `https://player.vimeo.com/video/${vimeo}`,
      thumbnailUrl: `https://vumbnail.com/${vimeo}.jpg`,
      watchUrl: `https://vimeo.com/${vimeo}`,
    };
  }

  return null;
}
