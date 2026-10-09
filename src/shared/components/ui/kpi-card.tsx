import { Box, Flex, Text, type BoxProps } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { LuArrowDownRight, LuArrowUpRight } from 'react-icons/lu';

export type KpiCardProps = BoxProps & {
  label: string;
  value: string;
  icon?: ReactNode;
  /** Formatted change, e.g. "+12.5%"; null when there is nothing to compare with. */
  change?: string | null;
  /** Whether the value went up or down (colours the change). */
  trend?: 'up' | 'down' | 'flat';
  /** e.g. "vs previous 30 days". */
  caption?: string;
};

const TREND_STYLES = {
  up: { color: 'status.ok', bg: '#E6F6EC', icon: <LuArrowUpRight size={14} /> },
  down: { color: 'status.danger', bg: '#FDECEC', icon: <LuArrowDownRight size={14} /> },
  flat: { color: 'ink.400', bg: 'bg.400', icon: null },
} as const;

export function KpiCard({ label, value, icon, change, trend = 'flat', caption, ...rest }: KpiCardProps) {
  const style = TREND_STYLES[trend];
  return (
    <Box bg="white" border="1px solid" borderColor="line.500" borderRadius="20px" px="22px" py="20px" {...rest}>
      <Flex justify="space-between" align="center" color="ink.400" fontSize="14px" fontWeight={600}>
        <Text as="span">{label}</Text>
        {icon ? (
          <Flex w="38px" h="38px" borderRadius="11px" align="center" justify="center" bg="brand.50" color="brand.500">
            {icon}
          </Flex>
        ) : null}
      </Flex>

      <Text fontSize="30px" fontWeight={800} letterSpacing="-0.02em" mt="10px" mb="4px">
        {value}
      </Text>

      {change !== undefined || caption ? (
        <Flex align="center" gap="8px" fontSize="12px" wrap="wrap">
          {change ? (
            <Flex
              align="center"
              gap="2px"
              px="6px"
              py="2px"
              borderRadius="6px"
              fontWeight={700}
              color={style.color}
              bg={style.bg}
              data-testid="kpi-change"
            >
              {style.icon}
              {change}
            </Flex>
          ) : change === null ? (
            <Text color="ink.300" fontWeight={600}>
              No earlier data
            </Text>
          ) : null}
          {caption ? <Text color="ink.300">{caption}</Text> : null}
        </Flex>
      ) : null}
    </Box>
  );
}
