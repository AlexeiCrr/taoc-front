import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../stores/authStore'

export default function Admin() {
	const navigate = useNavigate()
	const { isAuthenticated, checkAuth, handleCallback, login, isLoading } =
		useAuthStore()
	const hasProcessedAuthRef = useRef(false)

	useEffect(() => {
		if (isAuthenticated) {
			navigate('/dashboard', { replace: true })
			return
		}

		if (hasProcessedAuthRef.current) return

		const processAuth = async () => {
			const urlParams = new URLSearchParams(window.location.search)
			const hasCode = urlParams.has('code')

			if (hasCode) {
				hasProcessedAuthRef.current = true
				try {
					await handleCallback()
				} catch (error) {
					console.error('OAuth callback failed:', error)
					hasProcessedAuthRef.current = false
					login()
				}
			} else {
				const accessToken = localStorage.getItem('access-token')

				if (accessToken && !isLoading) {
					hasProcessedAuthRef.current = true
					await checkAuth()
				} else if (!accessToken && !isLoading) {
					hasProcessedAuthRef.current = true
					login()
				}
			}
		}

		processAuth()
	}, [isAuthenticated, isLoading, handleCallback, checkAuth, login, navigate])

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
