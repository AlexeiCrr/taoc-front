import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../stores/authStore'

export default function Admin() {
	const navigate = useNavigate()
	const { isAuthenticated, checkAuth, handleCallback, isLoading } =
		useAuthStore()

	useEffect(() => {
		const processAuth = async () => {
			const urlParams = new URLSearchParams(window.location.search)
			const hasCode = urlParams.has('code')

			if (hasCode) {
				await handleCallback()
				navigate('/dashboard', { replace: true })
			} else if (isAuthenticated) {
				navigate('/dashboard', { replace: true })
			} else {
				await checkAuth()
				if (isAuthenticated) {
					navigate('/dashboard', { replace: true })
				}
			}
		}

		processAuth()
	}, [handleCallback, checkAuth, isAuthenticated, navigate])

	return (
		<div className="min-h-screen flex items-center justify-center bg-off-white">
			<div className="text-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-main mx-auto mb-4"></div>
				<p className="text-main">
					{isLoading ? 'Authenticating...' : 'Redirecting...'}
				</p>
			</div>
		</div>
	)
}
