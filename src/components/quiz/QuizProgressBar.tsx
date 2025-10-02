import '../../styles/QuizProgressBar.css'

interface QuizProgressBarProps {
	currentQuestion: number
	totalQuestions: number
}

const QuizProgressBar = ({
	currentQuestion,
	totalQuestions,
}: QuizProgressBarProps) => {
	const percentage = (currentQuestion / totalQuestions) * 100

	return (
		<div className="quiz-progress-bar-container">
			<div className="quiz-progress-bar-track">
				<div
					className="quiz-progress-bar-fill"
					style={{ width: `${percentage}%` }}
				/>
			</div>
		</div>
	)
}

export default QuizProgressBar
