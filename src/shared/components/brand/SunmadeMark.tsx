'use client';

import { colors } from '@/shared/theme/tokens';
import {
  MARK_HOUSE_PATH,
  MARK_ROOF_PATH,
  TILE_MARK_TRANSFORM,
  TILE_RADIUS,
} from './geometry';

export type SunmadeMarkTone = 'brand' | 'white';

type SunmadeMarkProps = {
  /** Any CSS length; defaults to 1.5em so it scales with the surrounding font size. */
  size?: string;
  /** `brand`: teal tile, white house. `white`: white tile, teal house (for teal backgrounds). */
  tone?: SunmadeMarkTone;
  title?: string;
};

/** The Sunmade app-icon tile: solid house with a gold roof. */
export function SunmadeMark({
  size = '1.5em',
  tone = 'brand',
  title,
}: SunmadeMarkProps) {
  const { brand, accent } = colors;
  const tile = tone === 'white' ? '#FFFFFF' : brand[500];
  const house = tone === 'white' ? brand[500] : '#FFFFFF';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      style={{ display: 'block', flexShrink: 0 }}
    >
      {title ? <title>{title}</title> : null}
      <rect width="512" height="512" rx={TILE_RADIUS} fill={tile} />
      <g transform={TILE_MARK_TRANSFORM}>
        <path d={MARK_ROOF_PATH} fill={accent[500]} />
        <path d={MARK_HOUSE_PATH} fill={house} />
      </g>
    </svg>
  );
}
