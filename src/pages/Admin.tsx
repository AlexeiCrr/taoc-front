import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/auth'
import useAuthStore from '../stores/authStore'
import LoadingSpinner from '../components/common/LoadingSpinner'

const IN_PROGRESS_KEY = 'cognito_auth_in_progress'

export default function AdminCallback() {
	const navigate = useNavigate()

	useEffect(() => {
		const run = async () => {
			useAuthStore.setState({ isLoading: true })
			const params = new URLSearchParams(window.location.search)
			const error = params.get('error')
			const code = params.get('code')
			const { isAuthenticated } = useAuthStore.getState()

			// If Cognito returned an error, stop loops and show app/home
			if (error) {
				sessionStorage.removeItem(IN_PROGRESS_KEY)
				useAuthStore.setState({ isLoading: false })
				navigate('/', { replace: true })
				return
			}

			// If Cognito redirected back with a code, handle token exchange
			if (code) {
				sessionStorage.removeItem(IN_PROGRESS_KEY)
				const user = await authService.handleCallback()
				useAuthStore.setState({
					user,
					isAuthenticated: !!user,
					isLoading: false,
				})
				// Navigate to dashboard after successful login
				navigate('/dashboard', { replace: true })
				return
			}

			// No code present: if already authenticated, go to app; otherwise start login
			if (isAuthenticated) {
				useAuthStore.setState({ isLoading: false })
				navigate('/dashboard', { replace: true })
				return
			}

			// Throttle login attempts to avoid loops (React strict/effect double-run or errors)
			const inProgress = sessionStorage.getItem(IN_PROGRESS_KEY)
			if (!inProgress) {
				sessionStorage.setItem(IN_PROGRESS_KEY, '1')
				await authService.signIn() // will redirect to Cognito
				return
			}

			// Already tried; stop spinner and stay on home
			useAuthStore.setState({ isLoading: false })
			navigate('/', { replace: true })
		}
		run()
	}, [navigate])

	return (
		<div className="min-h-screen flex items-center justify-center">
			<LoadingSpinner />
		</div>
	)
}
