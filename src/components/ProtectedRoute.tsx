import type { ReactNode } from 'react'

interface ProtectedRouteProps {
	children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
	// TODO: Implement authentication check
	// For now, allow all access
	return <>{children}</>
}
