import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../stores/authStore'

export default function Admin() {
	const navigate = useNavigate()
	const { isAuthenticated, checkAuth, handleCallback, login, isLoading } =
		useAuthStore()

	useEffect(() => {
		const processAuth = async () => {
			const urlParams = new URLSearchParams(window.location.search)
			const hasCode = urlParams.has('code')

			if (hasCode) {
				// Handle OAuth callback - user is returning from Cognito
				try {
					await handleCallback()
					// After successful callback, redirect to dashboard
					navigate('/dashboard', { replace: true })
				} catch (error) {
					console.error('OAuth callback failed:', error)
					// If callback fails, trigger login again
					login()
				}
			} else if (isAuthenticated) {
				// Already authenticated, go to dashboard
				navigate('/dashboard', { replace: true })
			} else {
				// Not authenticated and no callback code, trigger login flow
				// This will redirect to Cognito hosted UI
				login()
			}
		}

		processAuth()
	}, [handleCallback, checkAuth, isAuthenticated, login, navigate])

	return (
		<div className="min-h-screen flex items-center justify-center bg-off-white font-roboto">
			<div className="text-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-main mx-auto mb-4"></div>
				<p className="text-main">
					{isLoading ? 'Authenticating...' : 'Redirecting...'}
				</p>
			</div>
		</div>
	)
}
