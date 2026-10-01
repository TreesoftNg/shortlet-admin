'use client';

import { Flex, Spinner } from '@chakra-ui/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { onSessionExpired } from '@/shared/api/session';
import { ErrorState } from '@/shared/components/ui';
import { useHasSession, useMe } from '../hooks/use-auth';

function loginUrl(pathname: string, expired: boolean): string {
  const params = new URLSearchParams({ next: pathname });
  if (expired) params.set('expired', '1');
  return `/login?${params.toString()}`;
}

/** Renders its children only for a signed-in admin; otherwise sends them to /login. */
export function RequireSession({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { ready, signedIn } = useHasSession();
  const me = useMe();

  useEffect(() => {
    if (ready && !signedIn) router.replace(loginUrl(pathname, false));
  }, [ready, signedIn, pathname, router]);

  useEffect(() => onSessionExpired(() => router.replace(loginUrl(pathname, true))), [pathname, router]);

  if (me.isError && signedIn) {
    return (
      <ErrorState
        minH="100vh"
        title="Could not load your account"
        message="Check your connection and try again."
        onRetry={() => void me.refetch()}
      />
    );
  }
  if (!ready || !signedIn || !me.data) {
    return (
      <Flex minH="100vh" align="center" justify="center" aria-label="Loading">
        <Spinner color="brand.500" />
      </Flex>
    );
  }
  return <>{children}</>;
}
