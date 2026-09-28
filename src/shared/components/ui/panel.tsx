import { Box, type BoxProps } from '@chakra-ui/react';

export type PanelProps = BoxProps;

/** White bordered surface used across admin sections. */
export function Panel({ children, ...rest }: PanelProps) {
  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor="line.500"
      borderRadius="lg"
      p="22px"
      {...rest}
    >
      {children}
    </Box>
  );
}
