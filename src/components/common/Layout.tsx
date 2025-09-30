import type { ReactNode } from 'react'

interface LayoutProps {
	children: ReactNode
	className?: string
}

export default function Layout({ children, className = '' }: LayoutProps) {
	return (
		<div className="min-h-screen bg-off-white flex items-center justify-center">
			<div className={`container mx-auto px-4 py-8 ${className}`}>
				{children}
			</div>
		</div>
	)
}
