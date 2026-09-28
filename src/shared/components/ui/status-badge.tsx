import { Badge as ChakraBadge, type BadgeProps } from '@chakra-ui/react';

export type StatusTone = 'ok' | 'warn' | 'danger' | 'info' | 'mute' | 'brand';

const toneStyles: Record<StatusTone, BadgeProps> = {
  ok: { bg: '#E6F6EC', color: 'status.ok' },
  warn: { bg: '#FDF3E1', color: '#B7750B' },
  danger: { bg: '#FCE9E7', color: 'status.danger' },
  info: { bg: '#E9EFFE', color: 'status.info' },
  mute: { bg: 'line.400', color: 'ink.400' },
  brand: { bg: 'brand.50', color: 'brand.600' },
};

export type StatusBadgeProps = BadgeProps & {
  tone?: StatusTone;
};

export function StatusBadge({ tone = 'mute', children, ...rest }: StatusBadgeProps) {
  return (
    <ChakraBadge {...toneStyles[tone]} {...rest}>
      {children}
    </ChakraBadge>
  );
}
