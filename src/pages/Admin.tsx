import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import useAuthStore from '../stores/authStore'

export default function Admin() {
	const navigate = useNavigate()
	const { isAuthenticated, isAdmin, isLoading, signOut } = useAuthStore()
	const hasLoggedOut = useRef(false)

	useEffect(() => {
		if (isLoading) {
			return
		}

		if (isAuthenticated) {
			if (isAdmin) {
				navigate('/dashboard', { replace: true })
			} else if (!hasLoggedOut.current) {
				// Non-admin user - logout and redirect to login
				hasLoggedOut.current = true
				toast.error('Access denied. Admin privileges required.')
				signOut()
			}
		} else {
			navigate('/login', { replace: true })
		}
	}, [isAuthenticated, isAdmin, isLoading, navigate, signOut])

	return (
		<div className="min-h-screen flex items-center justify-center bg-off-white font-roboto">
			<div className="text-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-main mx-auto mb-4"></div>
				<p className="text-main">Redirecting...</p>
			</div>
		</div>
	)
}
