import type { Metadata } from 'next';
import { AppProviders } from '@/shared/providers/app-providers';
import '@/shared/styles/globals.css';

export const metadata: Metadata = {
  title: 'Sunmade Admin',
  description: 'Sunmade Luxury Shortlets & Suites — shortlet booking admin dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
