import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import useAuthStore from '../stores/authStore'
import LoadingSpinner from './common/LoadingSpinner'

interface ProtectedRouteProps {
	children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
	const { isAuthenticated, isLoading, login, checkAuth } = useAuthStore()
	const authCheckInitiatedRef = useRef(false)

	useEffect(() => {
		if (authCheckInitiatedRef.current) return

		const accessToken = localStorage.getItem('access-token')

		if (!accessToken) {
			authCheckInitiatedRef.current = true
			login()
		} else if (!isAuthenticated && !isLoading) {
			authCheckInitiatedRef.current = true
			checkAuth()
		}
	}, [isAuthenticated, isLoading, login, checkAuth])

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<LoadingSpinner />
			</div>
		)
	}

	const accessToken = localStorage.getItem('access-token')

	if (!isAuthenticated || !accessToken) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<LoadingSpinner />
			</div>
		)
	}

	return <>{children}</>
}
