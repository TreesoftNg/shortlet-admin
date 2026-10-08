import { extendTheme, type ThemeConfig } from '@chakra-ui/react';
import { colors, fonts, radii, shadows } from './tokens';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

export const theme = extendTheme({
  config,
  fonts: {
    heading: fonts.heading,
    body: fonts.body,
    mono: fonts.mono,
  },
  colors: {
    brand: colors.brand,
    accent: colors.accent,
    ink: {
      500: colors.ink.DEFAULT,
      400: colors.ink[2],
      300: colors.ink[3],
    },
    line: {
      500: colors.line.DEFAULT,
      400: colors.line[2],
    },
    bg: {
      500: colors.bg.DEFAULT,
      400: colors.bg.soft,
    },
    status: colors.status,
  },
  radii: {
    sm: radii.sm,
    md: radii.md,
    lg: radii.lg,
    full: radii.full,
  },
  shadows: {
    card: shadows.sm,
    overlay: shadows.lg,
  },
  styles: {
    global: {
      'html, body': {
        bg: 'bg.400',
        color: 'ink.500',
        fontFamily: fonts.body,
        WebkitFontSmoothing: 'antialiased',
        fontSize: '15px',
        lineHeight: '1.5',
      },
      a: {
        color: 'inherit',
        textDecoration: 'none',
      },
      img: {
        display: 'block',
        objectFit: 'cover',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 700,
        borderRadius: '12px',
      },
      sizes: {
        md: {
          h: '48px',
          px: '22px',
          fontSize: '15px',
        },
        sm: {
          h: '38px',
          px: '14px',
          fontSize: '13px',
          borderRadius: '10px',
        },
      },
      variants: {
        solid: {
          bg: 'brand.500',
          color: 'white',
          _hover: { bg: 'brand.600' },
          _active: { bg: 'brand.700' },
        },
        secondary: {
          bg: 'white',
          color: 'ink.500',
          border: '1px solid',
          borderColor: 'line.500',
          _hover: { bg: 'bg.400' },
          _active: { bg: 'line.400' },
        },
        dark: {
          bg: 'ink.500',
          color: 'white',
          _hover: { bg: 'gray.700' },
        },
        ghostOutline: {
          bg: 'white',
          border: '1px solid',
          borderColor: 'line.500',
          color: 'ink.500',
          _hover: { bg: 'bg.400' },
        },
        soft: {
          bg: 'bg.400',
          color: 'ink.500',
          _hover: { bg: 'line.400' },
        },
        outline: {
          bg: 'white',
          border: '1px solid',
          borderColor: 'line.500',
          color: 'ink.500',
          _hover: { bg: 'bg.400' },
        },
      },
      defaultProps: {
        variant: 'solid',
      },
    },
    IconButton: {
      defaultProps: {
        variant: 'secondary',
      },
    },
    FormLabel: {
      baseStyle: {
        fontSize: '13px',
        fontWeight: 600,
        color: 'ink.500',
        mb: '6px',
      },
    },
    Input: {
      sizes: {
        md: {
          field: { h: '40px', fontSize: '14px', px: '12px', borderRadius: '10px' },
          addon: { h: '40px', fontSize: '13px', borderRadius: '10px' },
        },
      },
      variants: {
        outline: {
          field: {
            bg: 'white',
            borderColor: 'line.500',
            _hover: { borderColor: 'ink.300' },
            _focusVisible: { borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' },
          },
          addon: { bg: 'bg.400', borderColor: 'line.500', color: 'ink.300' },
        },
      },
    },
    Select: {
      sizes: {
        md: { field: { h: '40px', fontSize: '14px', borderRadius: '10px' } },
      },
      variants: {
        outline: {
          field: {
            bg: 'white',
            borderColor: 'line.500',
            _hover: { borderColor: 'ink.300' },
            _focusVisible: { borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' },
          },
        },
      },
    },
    Textarea: {
      sizes: {
        md: { fontSize: '14px', px: '12px', borderRadius: '10px' },
      },
      variants: {
        outline: {
          bg: 'white',
          borderColor: 'line.500',
          _hover: { borderColor: 'ink.300' },
          _focusVisible: { borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' },
        },
      },
    },
    Badge: {
      baseStyle: {
        borderRadius: 'full',
        px: '10px',
        py: '4px',
        fontSize: '12px',
        fontWeight: 700,
        textTransform: 'none',
      },
    },
  },
});
