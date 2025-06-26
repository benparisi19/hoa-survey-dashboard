import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/auth-context';
import Navigation from '@/components/Navigation';
import ProtectedFooter from '@/components/ProtectedFooter';
import './globals.css';

export const metadata: Metadata = {
  title: 'HOA Survey Analysis Dashboard',
  description: 'Comprehensive analysis of HOA landscaping survey responses',
  keywords: ['HOA', 'survey', 'landscaping', 'analysis', 'dashboard'],
  authors: [{ name: 'HOA Board' }],
  robots: 'noindex, nofollow', // Private dashboard
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex flex-col">
        <AuthProvider>
          <Navigation />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <ProtectedFooter />
        </AuthProvider>
      </body>
    </html>
  );
}