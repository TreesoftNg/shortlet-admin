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
  Stack,
  Text,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { acceptStaffInvite, fetchStaffInvite, type StaffInvitePreview } from '../api/auth-api';
import { SunmadeLogo } from '@/shared/components/brand';
import { ApiClientError } from '@/shared/api/types';

const inputProps = {
  borderColor: 'line.500',
  borderRadius: '12px',
  h: '44px',
  bg: 'white',
} as const;

const PASSWORD_HINT =
  'At least 12 characters, with an uppercase letter and a special character.';

export function AcceptInvitePage() {
  const router = useRouter();
  const token = useSearchParams().get('token') ?? '';
  const [invite, setInvite] = useState<StaffInvitePreview | null>(null);
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoadError('This invite link is invalid or has expired');
      return;
    }
    let cancelled = false;
    fetchStaffInvite(token)
      .then((response) => {
        if (!cancelled) setInvite(response.data);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoadError(error instanceof ApiClientError ? error.message : 'This invite link is invalid or has expired');
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError('');
    if (password !== confirm) {
      setFormError('The two passwords do not match.');
      return;
    }
    setSaving(true);
    try {
      await acceptStaffInvite({ token, password });
      router.replace('/login');
    } catch (error) {
      setFormError(error instanceof ApiClientError ? error.message : 'Could not save that password.');
      setSaving(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="bg.400" px="16px">
      <Box w="100%" maxW="400px" bg="white" borderRadius="20px" p={{ base: '28px', md: '36px' }} boxShadow="sm">
        <Flex justify="center" mb="28px">
          <SunmadeLogo size="20px" />
        </Flex>
        <Heading as="h1" fontSize="22px" mb="6px">
          Set your password
        </Heading>
        {loadError ? (
          <Alert status="error" borderRadius="12px" fontSize="14px" mt="16px">
            <AlertIcon />
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
        ) : null}
        {!invite && !loadError ? (
          <Text color="ink.400" fontSize="14px" mt="12px">
            Loading your invitation…
          </Text>
        ) : null}
        {invite ? (
          <Stack as="form" spacing="16px" mt="16px" onSubmit={submit} noValidate>
            <Text color="ink.400" fontSize="14px">
              {invite.firstName}, you are joining {invite.tenantName} as {invite.roleName}. Sign in later with{' '}
              {invite.email}.
            </Text>
            {formError ? (
              <Alert status="error" borderRadius="12px" fontSize="14px">
                <AlertIcon />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            ) : null}
            <FormControl isRequired>
              <FormLabel fontSize="13px">Password</FormLabel>
              <Input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                {...inputProps}
              />
              <Text color="ink.400" fontSize="12px" mt="6px">
                {PASSWORD_HINT}
              </Text>
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize="13px">Confirm password</FormLabel>
              <Input
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                {...inputProps}
              />
            </FormControl>
            <Button type="submit" isLoading={saving} isDisabled={!password || !confirm}>
              Save password
            </Button>
            <Text fontSize="13px" color="ink.400">
              Already accepted? <Link href="/login">Sign in</Link>
            </Text>
          </Stack>
        ) : null}
      </Box>
    </Flex>
  );
}
