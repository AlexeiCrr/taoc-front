import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Admin() {
	const navigate = useNavigate()

	useEffect(() => {
		// TODO: Implement authentication logic
		// For now, redirect to dashboard
		navigate('/dashboard', { replace: true })
	}, [navigate])

	return (
		<div className="min-h-screen flex items-center justify-center bg-off-white font-roboto">
			<div className="text-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-main mx-auto mb-4"></div>
				<p className="text-main">Loading...</p>
			</div>
		</div>
	)
}
