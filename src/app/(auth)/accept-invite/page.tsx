import { Suspense } from 'react';
import { AcceptInvitePage } from '@/features/auth/components/accept-invite-page';

export default function AcceptInviteRoute() {
  return (
    <Suspense>
      <AcceptInvitePage />
    </Suspense>
  );
}
