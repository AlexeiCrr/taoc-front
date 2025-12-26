import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../stores/authStore'

export default function Admin() {
	const navigate = useNavigate()
	const location = useLocation()
	const { isAuthenticated, isLoading, signIn } = useAuthStore()
	const [hasTriggeredSignIn, setHasTriggeredSignIn] = useState(false)

	useEffect(() => {
		const handleAuth = async () => {
			// If already authenticated, redirect to dashboard
			if (isAuthenticated) {
				navigate('/dashboard', { replace: true })
				return
			}

			// Check if we're returning from OAuth callback
			const isCallback = location.search.includes('code=')

			// If callback is present, wait for auth to initialize (don't trigger signIn again)
			if (isCallback) {
				// OAuth callback - Amplify will process it automatically
				// Just wait for initializeAuth to complete
				return
			}

			// If not loading, not authenticated, and haven't triggered sign in yet, do it now
			if (!isLoading && !isAuthenticated && !hasTriggeredSignIn) {
				setHasTriggeredSignIn(true)
				await signIn()
			}
		}

		handleAuth()
	}, [isAuthenticated, isLoading, signIn, navigate, location.search, hasTriggeredSignIn])

	return (
		<div className="min-h-screen flex items-center justify-center bg-off-white font-roboto">
			<div className="text-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-main mx-auto mb-4"></div>
				<p className="text-main">
					{isAuthenticated ? 'Redirecting to dashboard...' : 'Signing in...'}
				</p>
			</div>
		</div>
	)
}
