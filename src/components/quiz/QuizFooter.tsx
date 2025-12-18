import type { FC } from 'react'

interface QuizFooterProps {
	inverted?: boolean
}

const QuizFooter: FC<QuizFooterProps> = ({ inverted = false }) => {
	const logoSrc = inverted ? '/images/logo-green.png' : '/images/logo-white.png'
	const arenaLogoSrc = inverted
		? '/images/arena-logo-green.png'
		: '/images/arena-logo-white.png'
	const textColor = inverted ? 'text-main' : 'text-off-white'

	return (
		<footer className="quiz-footer w-full p-4 lg:p-6 flex max-lg:flex-col max-lg:gap-3 items-center justify-between backdrop-blur-sm">
			{/* Mobile Logos Container - visible on mobile */}
			<div className="mobile-logos flex items-center gap-4 md:hidden">
				<img src={logoSrc} alt="Logo" className="logo-footer h-8 w-auto" />
				<img
					src={arenaLogoSrc}
					alt="Arena Logo"
					className="logo-footer h-8 w-auto"
				/>
			</div>

			{/* Desktop Left Logo - visible on desktop */}
			<img
				src={logoSrc}
				alt="Logo"
				className="logo-footer h-10 w-auto hidden md:block"
			/>

			{/* Center Text */}
			<p
				className={`footer-text ${textColor} text-xs font-helvetica uppercase tracking-wider`}
			>
				By Erwin Raphael McManus
			</p>

			{/* Desktop Right Logo - visible on desktop */}
			<img
				src={arenaLogoSrc}
				alt="Arena Logo"
				className="logo-footer h-10 w-auto hidden md:block"
			/>
		</footer>
	)
}

export default QuizFooter
