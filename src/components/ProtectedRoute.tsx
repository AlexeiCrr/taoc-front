import type { ReactNode } from 'react'
import { useEffect } from 'react'
import useAuthStore from '../stores/authStore'
import LoadingSpinner from './common/LoadingSpinner'

interface ProtectedRouteProps {
	children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
	const { isAuthenticated, isLoading, login, checkAuth } = useAuthStore()

	useEffect(() => {
		const token = localStorage.getItem('auth-token')

		if (!token) {
			login()
		} else if (!isAuthenticated && !isLoading) {
			checkAuth()
		}
	}, [isAuthenticated, isLoading, login, checkAuth])

	const token = localStorage.getItem('auth-token')

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<LoadingSpinner />
			</div>
		)
	}

	if (!isAuthenticated || !token) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<LoadingSpinner />
			</div>
		)
	}

	return <>{children}</>
}
