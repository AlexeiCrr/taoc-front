import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import useAuthStore from '../stores/authStore'

interface ProtectedRouteProps {
	children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
	const { isAuthenticated, isLoading } = useAuthStore()

	// Show loading spinner while checking auth
	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-off-white font-roboto">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-main mx-auto mb-4"></div>
					<p className="text-main">Authenticating...</p>
				</div>
			</div>
		)
	}

	// If not authenticated, redirect to /admin which will handle the sign-in
	if (!isAuthenticated) {
		return <Navigate to="/admin" replace />
	}

	// User is authenticated, render protected content
	return <>{children}</>
}
