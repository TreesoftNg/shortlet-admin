'use client';

import { Box, Button, Flex, Text } from '@chakra-ui/react';

export type FilterTabItem<T extends string> = {
  id: T;
  label: string;
  count?: number;
};

type FilterTabsProps<T extends string> = {
  items: FilterTabItem<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function FilterTabs<T extends string>({
  items,
  value,
  onChange,
}: FilterTabsProps<T>) {
  return (
    <Flex
      gap={{ base: '14px', md: '22px' }}
      borderBottom="1px solid"
      borderColor="line.500"
      mb="16px"
      overflowX="auto"
      css={{
        '&::-webkit-scrollbar': { display: 'none' },
        scrollbarWidth: 'none',
      }}
    >
      {items.map((item) => {
        const active = item.id === value;

        return (
          <Button
            key={item.id}
            type="button"
            variant="unstyled"
            h="auto"
            minW="auto"
            px="2px"
            pb="12px"
            borderRadius="0"
            fontSize="14px"
            fontWeight={700}
            color={active ? 'ink.500' : 'ink.300'}
            borderBottom={active ? '2px solid' : '2px solid transparent'}
            borderColor={active ? 'brand.500' : 'transparent'}
            whiteSpace="nowrap"
            onClick={() => onChange(item.id)}
          >
            {item.label}
            {typeof item.count === 'number' ? (
              <Box
                as="span"
                ml="6px"
                bg="line.400"
                color="ink.400"
                fontSize="11px"
                px="7px"
                py="1px"
                borderRadius="full"
              >
                {item.count}
              </Box>
            ) : null}
          </Button>
        );
      })}
    </Flex>
  );
}

type FilterChipProps = {
  children: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
};

export function FilterChip({ children, onClick, isActive }: FilterChipProps) {
  return (
    <Flex
      as="button"
      type="button"
      align="center"
      gap="6px"
      h="40px"
      px="14px"
      border="1px solid"
      borderColor={isActive ? 'ink.500' : 'line.500'}
      borderRadius="10px"
      bg={isActive ? 'bg.400' : 'white'}
      color={isActive ? 'ink.500' : 'ink.400'}
      fontSize="13px"
      fontWeight={600}
      whiteSpace="nowrap"
      onClick={onClick}
      flexShrink={0}
    >
      {children}
    </Flex>
  );
}

type PaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: PaginationProps) {
  if (total === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const pages = buildPageNumbers(page, totalPages);

  return (
    <Flex
      justify="space-between"
      align="center"
      pt="14px"
      gap="12px"
      wrap="wrap"
      fontSize="13px"
      color="ink.400"
    >
      <Text>
        Showing {start}–{end} of {total}
      </Text>
      <Flex gap="6px" align="center">
        <PageButton
          label="Previous"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          ‹
        </PageButton>
        {pages.map((item, index) =>
          item === '…' ? (
            <Text key={`ellipsis-${index}`} px="4px">
              …
            </Text>
          ) : (
            <PageButton
              key={item}
              label={`Page ${item}`}
              isActive={item === page}
              onClick={() => onPageChange(item)}
            >
              {item}
            </PageButton>
          ),
        )}
        <PageButton
          label="Next"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          ›
        </PageButton>
      </Flex>
    </Flex>
  );
}

function PageButton({
  children,
  onClick,
  disabled,
  isActive,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  isActive?: boolean;
  label: string;
}) {
  return (
    <Button
      type="button"
      aria-label={label}
      h="32px"
      minW="32px"
      px="0"
      borderRadius="8px"
      border="1px solid"
      borderColor={isActive ? 'ink.500' : 'line.500'}
      bg={isActive ? 'ink.500' : 'white'}
      color={isActive ? 'white' : 'ink.400'}
      fontWeight={600}
      fontSize="13px"
      variant="unstyled"
      isDisabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export function buildPageNumbers(
  page: number,
  totalPages: number,
): Array<number | '…'> {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (page <= 3) {
    return [1, 2, 3, '…', totalPages];
  }

  if (page >= totalPages - 2) {
    return [1, '…', totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, '…', page, '…', totalPages];
}
