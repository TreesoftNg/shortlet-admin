'use client';

import { Heading, Text } from '@chakra-ui/react';

type PlaceholderPageProps = {
  title: string;
};

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <>
      <Heading as="h1" fontSize="26px" fontWeight={800} mb="8px">
        {title}
      </Heading>
      <Text color="ink.400">This section will be built next.</Text>
    </>
  );
}
