/**
 * Design tokens. Brand colours come from the Sunmade logo (design/brand);
 * layout and surfaces mirror design/src/styles.css.
 */
export const colors = {
  brand: {
    50: '#E7F1EE',
    100: '#C8E0D9',
    200: '#9AD7C9',
    300: '#67C3AE',
    400: '#3AAF96',
    500: '#10695B',
    600: '#0C574B',
    700: '#09584C',
    800: '#07463C',
    900: '#05342D',
  },
  accent: {
    500: '#F8A42F',
  },
  ink: {
    DEFAULT: '#1B1D1F',
    2: '#4A4F55',
    3: '#80868C',
  },
  line: {
    DEFAULT: '#EAEAE6',
    2: '#F2F2EF',
  },
  bg: {
    DEFAULT: '#FFFFFF',
    soft: '#F8F7F4',
  },
  status: {
    danger: '#D9463B',
    warn: '#E69A1A',
    ok: '#1F9D55',
    info: '#3A6FF0',
  },
} as const;

export const fonts = {
  heading: `'Plus Jakarta Sans', system-ui, sans-serif`,
  body: `'Plus Jakarta Sans', system-ui, sans-serif`,
  mono: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`,
} as const;

export const radii = {
  sm: '10px',
  md: '14px',
  lg: '22px',
  full: '999px',
} as const;

export const shadows = {
  sm: '0 6px 24px rgba(20, 24, 28, 0.08)',
  lg: '0 18px 50px rgba(20, 24, 28, 0.14)',
} as const;

export const space = {
  sidebarWidth: '260px',
} as const;
