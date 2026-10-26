'use client';

import { Box, Flex, type FlexProps } from '@chakra-ui/react';
import { colors } from '@/shared/theme/tokens';
import { SunmadeMark } from './SunmadeMark';

export type SunmadeLogoVariant = 'color' | 'light' | 'onBrand';

type SunmadeLogoProps = {
  /** Wordmark font size; everything else scales from it. Accepts responsive values. */
  size?: FlexProps['fontSize'];
  /**
   * `color`: teal wordmark (light backgrounds).
   * `light`: white wordmark, teal tile (dark backgrounds and photos).
   * `onBrand`: white wordmark, white tile (teal backgrounds).
   */
  variant?: SunmadeLogoVariant;
  /** Show the "APARTMENTS & SUITES" line under the wordmark. */
  tagline?: boolean;
  /** Responsive display for the wordmark, e.g. hide it on small screens to show only the tile. */
  wordmarkDisplay?: FlexProps['display'];
};

const TAGLINE = 'APARTMENTS & SUITES'.split('');

/** The custom "A": no crossbar, with the gold triangle inside. Body uses currentColor. */
function GlyphA() {
  const gold = colors.accent[500];
  return (
    <svg
      width="0.734em"
      height="0.72em"
      viewBox="-1 -1 102 102"
      aria-hidden
      style={{ display: 'block', flexShrink: 0 }}
    >
      <path
        d="M40 0H60L100 100H77L50 29L23 100H0Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <path
        d="M50 52L64 99H36Z"
        fill={gold}
        stroke={gold}
        strokeWidth={5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CapText({ children }: { children: string }) {
  return (
    <Box as="span" display="block" lineHeight="0.72em" h="0.72em">
      {children}
    </Box>
  );
}

/** Sunmade Apartments & Suites logo: app-icon tile + wordmark. */
export function SunmadeLogo({
  size = '22px',
  variant = 'color',
  tagline = true,
  wordmarkDisplay = 'inline-grid',
}: SunmadeLogoProps) {
  const textColor = variant === 'color' ? 'brand.500' : 'white';

  return (
    <Flex
      role="img"
      aria-label="Sunmade Apartments & Suites"
      display="inline-flex"
      align="center"
      gap="0.42em"
      fontSize={size}
      flexShrink={0}
    >
      <SunmadeMark
        size={tagline ? '1.5em' : '1.3em'}
        tone={variant === 'onBrand' ? 'white' : 'brand'}
      />
      <Box display={wordmarkDisplay} aria-hidden color={textColor}>
        <Flex align="flex-end" gap="0.05em" fontWeight="800" letterSpacing="0.05em">
          <CapText>SUNM</CapText>
          <GlyphA />
          <CapText>DE</CapText>
        </Flex>
        {tagline ? (
          <Flex
            mt="0.3em"
            justify="space-between"
            fontSize="max(8px, 0.26em)"
            fontWeight="700"
            lineHeight="1"
          >
            {TAGLINE.map((char, i) => (
              <Box as="span" key={i} whiteSpace="pre">
                {char}
              </Box>
            ))}
          </Flex>
        ) : null}
      </Box>
    </Flex>
  );
}
