import type { ReactNode } from 'react'

interface HeroSectionProps {
	title: string
	subtitle?: string
	children?: ReactNode
	className?: string
}

const HeroSection = ({
	title,
	subtitle,
	children,
	className = '',
}: HeroSectionProps) => {
	return (
		<div className={`text-center max-w-4xl mx-auto ${className}`}>
			<h1 className="text-off-white">{title}</h1>
			{subtitle && <h3 className="text-off-white mb-12">{subtitle}</h3>}
			{/* Additional Content */}
			{children}
		</div>
	)
}

export default HeroSection
