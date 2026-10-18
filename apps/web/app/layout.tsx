import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MCMS — Modern Clinic Management System',
  description:
    'Enterprise healthcare clinical management, scheduling, and offline-capable workflow system.',
};

import { AuthProvider } from '../lib/auth/auth-context';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
