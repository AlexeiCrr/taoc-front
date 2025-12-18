import type { ReactNode } from 'react'
import QuizFooter from './QuizFooter'
import QuizHeader from './QuizHeader'

interface QuizLayoutProps {
	children: ReactNode
	className?: string
}

const QuizLayout = ({ children, className = '' }: QuizLayoutProps) => {
	return (
		<div className={`min-h-screen bg-off-white p-3 lg:p-6 ${className}`}>
			<div className="bg-main relative flex flex-col h-[calc(100vh-24px)] lg:h-[calc(100vh-48px)]">
				<QuizHeader />
				{children}
				<QuizFooter />
			</div>
		</div>
	)
}

export default QuizLayout
