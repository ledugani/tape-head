'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { CollectionView } from '@/app/components/CollectionView';
import { WantlistView } from '@/app/components/WantlistView';
import * as Tabs from '@radix-ui/react-tabs';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
	const { isAuthenticated, isLoading } = useAuth();
	const router = useRouter();

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
				<div className="relative py-3 sm:max-w-xl sm:mx-auto">
					<div className="text-center">Loading...</div>
				</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		router.replace('/login');
		return null;
	}

	return (
		<div className="min-h-screen bg-gray-100">
			<div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
				<div className="px-4 py-6 sm:px-0">
					<h1 className="text-3xl font-bold text-gray-900 mb-6" data-testid="dashboard-welcome">Dashboard</h1>
					
					<Tabs.Root defaultValue="collection" className="w-full">
						<Tabs.List className="flex border-b border-gray-200 mb-6">
							<Tabs.Trigger
								value="collection"
								className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300 focus:outline-none data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
							>
								Collection
							</Tabs.Trigger>
							<Tabs.Trigger
								value="wantlist"
								className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300 focus:outline-none data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
							>
								Wantlist
							</Tabs.Trigger>
						</Tabs.List>

						<Tabs.Content value="collection" className="focus:outline-none">
							<div data-testid="collection-list">
								<CollectionView />
							</div>
						</Tabs.Content>

						<Tabs.Content value="wantlist" className="focus:outline-none">
							<div data-testid="wantlist-list">
								<WantlistView />
							</div>
						</Tabs.Content>
					</Tabs.Root>
				</div>
			</div>
		</div>
	);
}
