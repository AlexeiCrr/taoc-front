import AdminDataGrid from '@/components/admin/AdminDataGrid'
import AdminFilters from '@/components/admin/AdminFilters'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import useAdminStore from '@/stores/adminStore'
import { useEffect } from 'react'
import useAuthStore from '../stores/authStore'

export default function Dashboard() {
	const { user, logout } = useAuthStore()
	const { fetchResponses } = useAdminStore()

	useEffect(() => {
		const loadData = async () => {
			try {
				await fetchResponses(1)
			} catch (error) {
				console.error('Failed to load initial dashboard data:', error)
			}
		}
		loadData()
	}, [fetchResponses])

	const handleLogout = async () => {
		try {
			await logout()
		} catch (error) {
			console.error('Logout failed:', error)
		}
	}

	return (
		<div className="min-h-screen bg-off-white font-roboto">
			{/* Header */}
			<header className="bg-white shadow-sm border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<div className="flex justify-between items-center">
						<div>
							<h3 className="text-3xl font-bold text-main !mt-4 !mb-4">
								Admin Dashboard
							</h3>
							<p className="text-sm text-gray-600 mt-1">
								Welcome back, {user?.username || user?.email}
							</p>
						</div>
						<Button onClick={handleLogout} variant="outline">
							Sign Out
						</Button>
					</div>
				</div>
			</header>

			<main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<Card>
					<CardHeader>
						<CardTitle>Quiz Responses</CardTitle>
					</CardHeader>
					<CardContent>
						<AdminFilters />
						<AdminDataGrid />
					</CardContent>
				</Card>
			</main>
		</div>
	)
}
