import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import { AuthProvider } from '@/lib/AuthContext'
import { OfflineProvider } from '@/lib/OfflineContext'
import Navbar from '@/components/Navbar'
import { Footer } from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: 'Tape Head',
	description: 'Your VHS collection manager',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<AuthProvider>
					<OfflineProvider>
						<div className="min-h-screen flex flex-col">
							<Navbar />
							<main className="flex-grow">
								{children}
							</main>
							<Footer />
						</div>
					</OfflineProvider>
				</AuthProvider>
			</body>
		</html>
	)
}
