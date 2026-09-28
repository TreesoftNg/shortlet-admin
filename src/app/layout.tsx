import type { Metadata } from 'next';
import { AppProviders } from '@/shared/providers/app-providers';
import { AdminShell } from '@/shared/components/layout/admin-shell';
import '@/shared/styles/globals.css';

export const metadata: Metadata = {
  title: 'Haven Admin',
  description: 'Shortlet apartment booking admin dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          <AdminShell>{children}</AdminShell>
        </AppProviders>
      </body>
    </html>
  );
}
