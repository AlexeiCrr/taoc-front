import { Button } from '@/components/ui/button'
import useAuthStore from '../stores/authStore'

export default function Dashboard() {
	const { user, logout } = useAuthStore()

	const handleLogout = async () => {
		try {
			await logout()
		} catch (error) {
			console.error('Logout failed:', error)
		}
	}

	return (
		<div className="min-h-screen bg-off-white">
			{/* Header */}
			<header className="bg-white shadow-sm border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<div className="flex justify-between items-center">
						<div>
							<h1 className="text-3xl font-bold text-main mt-4">
								Admin Dashboard
							</h1>
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

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				Test content
			</main>
		</div>
	)
}
