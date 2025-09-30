import type { ReactNode } from 'react'
import QuizFooter from './QuizFooter'
import QuizHeader from './QuizHeader'

interface QuizLayoutProps {
	children: ReactNode
	showFooter?: boolean
	className?: string
}

const QuizLayout = ({
	children,
	showFooter = true,
	className = '',
}: QuizLayoutProps) => {
	return (
		<div className={`min-h-screen bg-off-white p-6 ${className}`}>
			<div className="bg-primary relative flex flex-col h-[calc(100vh-48px)]">
				<QuizHeader />
				{children}
				<QuizFooter />
			</div>
		</div>
	)
}

export default QuizLayout
