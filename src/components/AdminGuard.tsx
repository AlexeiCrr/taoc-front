import { useEffect, useRef } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import useAuthStore from '@/stores/authStore'

interface AdminGuardProps {
	children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
	const { isAuthenticated, isAdmin, isLoading, checkAuth, signOut, accessToken } =
		useAuthStore()
	const location = useLocation()
	const hasChecked = useRef(false)
	const hasLoggedOut = useRef(false)

	useEffect(() => {
		if (!isAuthenticated && !accessToken && !hasChecked.current) {
			hasChecked.current = true
			checkAuth()
		}
	}, [isAuthenticated, accessToken, checkAuth])

	// Logout non-admin users - this is an admin-only app
	useEffect(() => {
		if (!isLoading && isAuthenticated && !isAdmin && !hasLoggedOut.current) {
			hasLoggedOut.current = true
			toast.error('Access denied. Admin privileges required.')
			signOut()
		}
	}, [isLoading, isAuthenticated, isAdmin, signOut])

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		)
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" state={{ from: location }} replace />
	}

	if (!isAdmin) {
		// Will redirect to login after signOut completes
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		)
	}

	return <>{children}</>
}
