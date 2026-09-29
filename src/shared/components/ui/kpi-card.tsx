import { Box, Flex, Text, type BoxProps } from '@chakra-ui/react';
import type { ReactNode } from 'react';

export type KpiCardProps = BoxProps & {
  label: string;
  value: string;
  icon?: ReactNode;
};

export function KpiCard({
  label,
  value,
  icon,
  ...rest
}: KpiCardProps) {

  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor="line.500"
      borderRadius="20px"
      px="22px"
      py="20px"
      {...rest}
    >
      <Flex justify="space-between" align="center" color="ink.400" fontSize="14px" fontWeight={600}>
        <Text as="span">{label}</Text>
        {icon ? (
          <Flex
            w="38px"
            h="38px"
            borderRadius="11px"
            align="center"
            justify="center"
            bg="brand.50"
            color="brand.500"
          >
            {icon}
          </Flex>
        ) : null}
      </Flex>

      <Text fontSize="30px" fontWeight={800} letterSpacing="-0.02em" mt="10px" mb="4px">
        {value}
      </Text>
    </Box>
  );
}
