import { Suspense } from 'react';
import { SettingsPage } from '@/features/settings/components/settings-page';
import { PageSkeleton } from '@/shared/components/ui';

export default function SettingsRoute() {
  return (
    <Suspense fallback={<PageSkeleton variant="form" />}>
      <SettingsPage />
    </Suspense>
  );
}
