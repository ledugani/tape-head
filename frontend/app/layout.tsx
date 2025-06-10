import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/AuthContext';
import { OfflineProvider } from '@/src/lib/OfflineContext';
import { ClientLayout } from './components/ClientLayout';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tape Head',
  description: 'Your music collection, organized.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <OfflineProvider>
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <ClientLayout>{children}</ClientLayout>
              </main>
              <Footer />
            </div>
          </AuthProvider>
        </OfflineProvider>
      </body>
    </html>
  );
}
