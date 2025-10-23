import { useEffect, useState } from 'react'
import '../../styles/QuestionCard.css'
import type { Question } from '../../types/quiz.types'

interface QuestionCardProps {
	question: Question
	currentValue?: number
	onAnswer: (value: number) => void
	onNext: () => void
	onPrevious: () => void
	canGoBack: boolean
	canGoForward: boolean
	isLastQuestion: boolean
	currentQuestionNumber: number
	totalQuestions: number
}

const QuestionCard = ({
	question,
	currentValue,
	onAnswer,
	onNext,
	onPrevious,
	canGoBack,
	canGoForward,
	isLastQuestion,
	currentQuestionNumber,
	totalQuestions,
}: QuestionCardProps) => {
	const [selectedValue, setSelectedValue] = useState<number | undefined>(
		currentValue
	)

	// Update selected value when currentValue changes (navigation)
	useEffect(() => {
		setSelectedValue(currentValue)
	}, [currentValue])

	const handleValueSelect = (value: number) => {
		setSelectedValue(value)
		onAnswer(value)
	}

	const handleNext = () => {
		if (canGoForward) {
			onNext()
		}
	}

	const handlePrevious = () => {
		if (canGoBack) {
			onPrevious()
		}
	}

	return (
		<div className="question-card">
			{/* Question Counter */}
			<div className="question-counter">
				{String(currentQuestionNumber).padStart(2, '0')} /{' '}
				{String(totalQuestions).padStart(2, '0')}
			</div>

			{/* Question Text */}
			<h2 className="question-text">{question.description}</h2>

			{/* Rating Scale */}
			<div className="rating-container">
				<span className="rating-label rating-label-desktop">
					STRONGLY DISAGREE
				</span>
				<div className="rating-buttons-wrapper">
					<div className="rating-buttons">
						{[1, 2, 3, 4, 5].map((value) => (
							<button
								key={value}
								onClick={() => handleValueSelect(value)}
								className={`rating-button ${selectedValue === value ? 'selected' : ''}`}
								aria-label={`Rate ${value}`}
							>
								{value}
							</button>
						))}
					</div>

					{/* Mobile Labels */}
					<div className="rating-labels-mobile">
						<span className="rating-label-mobile">
							STRONGLY <br />
							DISAGREE
						</span>
						<span className="rating-label-mobile">
							STRONGLY <br />
							AGREE
						</span>
					</div>
				</div>

				<span className="rating-label rating-label-desktop">
					STRONGLY AGREE
				</span>
			</div>

			{/* Navigation Buttons */}
			<div className="navigation-buttons">
				<button
					onClick={handlePrevious}
					disabled={!canGoBack}
					className="nav-button back-button"
				>
					BACK
				</button>
				<button
					onClick={handleNext}
					disabled={!canGoForward}
					className="nav-button next-button"
				>
					{isLastQuestion ? 'SUBMIT' : 'NEXT'}
				</button>
			</div>
		</div>
	)
}

export default QuestionCard
