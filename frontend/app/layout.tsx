import './globals.css';
import { AuthProvider } from '@/lib/AuthContext';

export const metadata = {
  title: 'Tape Head',
  description: 'Your VHS collection manager',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
