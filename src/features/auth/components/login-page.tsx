'use client';

import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { SunmadeLogo } from '@/shared/components/brand';
import { useHasSession, useLogin } from '../hooks/use-auth';
import { loginErrorMessage, safeNextPath, tenantChoicesFrom } from '../utils/auth-helpers';

const inputProps = {
  borderColor: 'line.500',
  borderRadius: '12px',
  h: '44px',
  bg: 'white',
} as const;

export function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get('next'));
  const sessionEnded = searchParams.get('expired') === '1';
  const { ready, signedIn } = useHasSession();
  const signIn = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const tenantChoices = tenantChoicesFrom(signIn.error);

  useEffect(() => {
    if (ready && signedIn) router.replace(next);
  }, [ready, signedIn, next, router]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    signIn.mutate({ email, password, tenantSlug: tenantSlug || undefined });
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="bg.400" px="16px">
      <Box w="100%" maxW="400px" bg="white" borderRadius="20px" p={{ base: '28px', md: '36px' }} boxShadow="sm">
        <Flex justify="center" mb="28px">
          <SunmadeLogo size="20px" />
        </Flex>
        <Heading as="h1" fontSize="22px" mb="6px">
          Sign in
        </Heading>
        <Text color="ink.400" fontSize="14px" mb="24px">
          Use your Sunmade admin account.
        </Text>

        <Stack as="form" spacing="16px" onSubmit={submit} noValidate>
          {sessionEnded && !signIn.isError ? (
            <Alert status="info" borderRadius="12px" fontSize="14px">
              <AlertIcon />
              <AlertDescription>Your session ended. Please sign in again.</AlertDescription>
            </Alert>
          ) : null}
          {signIn.isError && !tenantChoices.length ? (
            <Alert status="error" borderRadius="12px" fontSize="14px">
              <AlertIcon />
              <AlertDescription>{loginErrorMessage(signIn.error)}</AlertDescription>
            </Alert>
          ) : null}

          <FormControl isRequired>
            <FormLabel fontSize="13px">Email</FormLabel>
            <Input
              type="email"
              autoComplete="username"
              autoFocus
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              {...inputProps}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel fontSize="13px">Password</FormLabel>
            <Input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              {...inputProps}
            />
          </FormControl>
          {tenantChoices.length ? (
            <FormControl isRequired>
              <FormLabel fontSize="13px">Business</FormLabel>
              <Select
                placeholder="Choose a business"
                value={tenantSlug}
                onChange={(event) => setTenantSlug(event.target.value)}
                {...inputProps}
              >
                {tenantChoices.map((tenant) => (
                  <option key={tenant.slug} value={tenant.slug}>
                    {tenant.name}
                  </option>
                ))}
              </Select>
            </FormControl>
          ) : null}

          <Button type="submit" isLoading={signIn.isPending} isDisabled={!email || !password} mt="4px">
            Sign in
          </Button>
        </Stack>
      </Box>
    </Flex>
  );
}
