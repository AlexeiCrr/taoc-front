import type { ReactNode } from 'react'
import { useEffect } from 'react'
import useAuthStore from '../stores/authStore'
import LoadingSpinner from './common/LoadingSpinner'

interface ProtectedRouteProps {
	children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
	const { isAuthenticated, isLoading, login } = useAuthStore()

	useEffect(() => {
		if (!isAuthenticated && !isLoading) {
			login()
		}
	}, [isAuthenticated, isLoading, login])

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<LoadingSpinner />
			</div>
		)
	}

	if (!isAuthenticated) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<LoadingSpinner />
			</div>
		)
	}

	return <>{children}</>
}
