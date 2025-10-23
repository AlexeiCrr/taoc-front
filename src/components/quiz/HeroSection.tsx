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
			<h1 className="text-off-white max-md:!text-5xl">{title}</h1>
			{subtitle && (
				<h4 className="text-off-white max-lg:text-xl mb-12 font-family-helvetica">
					{subtitle}
				</h4>
			)}
			{/* Additional Content */}
			{children}
		</div>
	)
}

export default HeroSection
