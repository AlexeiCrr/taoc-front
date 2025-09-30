const QuizFooter = () => {
	return (
		<footer className="quiz-footer w-full px-8 py-6 flex items-center justify-between bg-primary/10 backdrop-blur-sm">
			{/* Mobile Logos Container - visible on mobile */}
			<div className="mobile-logos flex items-center gap-4 md:hidden">
				<img
					src="/images/logo-white.png"
					alt="Logo"
					className="logo-footer h-8 w-auto"
				/>
				<img
					src="/images/arena-logo-white.png"
					alt="Arena Logo"
					className="logo-footer h-8 w-auto"
				/>
			</div>

			{/* Desktop Left Logo - visible on desktop */}
			<img
				src="/images/logo-white.png"
				alt="Logo"
				className="logo-footer h-10 w-auto hidden md:block"
			/>

			{/* Center Text */}
			<p className="footer-text text-off-white text-xs font-helvetica uppercase tracking-wider">
				By Erwin Raphael McManus
			</p>

			{/* Desktop Right Logo - visible on desktop */}
			<img
				src="/images/arena-logo-white.png"
				alt="Arena Logo"
				className="logo-footer h-10 w-auto hidden md:block"
			/>
		</footer>
	)
}

export default QuizFooter
