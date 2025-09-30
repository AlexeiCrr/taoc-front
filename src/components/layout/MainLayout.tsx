import type { ReactNode } from 'react'

interface MainLayoutProps {
	children: ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {
	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<header className="bg-white shadow-sm border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="flex items-center">
							<h1 className="text-xl font-semibold text-gray-900">
								TAOC Platform
							</h1>
						</div>
						<nav className="flex space-x-8">
							<a
								href="/"
								className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
							>
								Home
							</a>
							<a
								href="/quiz"
								className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
							>
								Quiz
							</a>
						</nav>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{children}
			</main>

			{/* Footer */}
			<footer className="bg-white border-t mt-auto">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
					<div className="text-center text-sm text-gray-500">
						© 2024 TAOC Platform. All rights reserved.
					</div>
				</div>
			</footer>
		</div>
	)
}

export default MainLayout
