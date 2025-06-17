
import type { Metadata } from 'next';
import './globals.css';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/AuthContext';
import { PT_Sans } from 'next/font/google';

export const metadata: Metadata = {
  title: 'MediShare - Redistribute Unused Medicine',
  description: 'Connecting donors with NGOs to redistribute unused medicines for a healthier community.',
};

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-pt-sans',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${ptSans.variable}`}>
      <head>
        {/* Google Font links removed, handled by next/font */}
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <AuthProvider>
          <AppHeader />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <AppFooter />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
