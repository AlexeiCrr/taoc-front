import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import useAuthStore from '../stores/authStore'
import LoadingSpinner from './common/LoadingSpinner'

interface ProtectedRouteProps {
	children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
	const { isAuthenticated, isLoading } = useAuthStore()

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<LoadingSpinner />
			</div>
		)
	}

	if (!isAuthenticated) {
		return <Navigate to="/" replace />
	}

	return <>{children}</>
}
