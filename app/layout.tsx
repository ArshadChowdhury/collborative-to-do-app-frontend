import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TenantProvider } from '@/contexts/TenantContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'TaskFlow — Multi-Tenant Todo',
  description: 'Collaborative task management for teams',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-gray-950 text-gray-100 antialiased min-h-screen">
        <TenantProvider>{children}</TenantProvider>
      </body>
    </html>
  );
}