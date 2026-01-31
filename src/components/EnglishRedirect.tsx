import { Navigate, useLocation } from 'react-router-dom'

export default function EnglishRedirect() {
	const location = useLocation()
	const newPath = location.pathname.replace(/^\/en/, '') || '/'

	return <Navigate to={newPath + location.search + location.hash} replace />
}
