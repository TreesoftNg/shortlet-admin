import type { ReactNode } from 'react';
import { RequireSession } from '@/features/auth/components/require-session';
import { AdminShell } from '@/shared/components/layout/admin-shell';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RequireSession>
      <AdminShell>{children}</AdminShell>
    </RequireSession>
  );
}
