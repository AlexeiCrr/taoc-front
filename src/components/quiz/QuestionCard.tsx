import { useEffect, useState } from 'react'
import '../../styles/QuestionCard.css'
import type { Question } from '../../types/quiz.types'
import * as m from '../../paraglide/messages'
import { useLanguage } from '@/hooks/useLanguage'
import { cn, LANGUAGE } from '@/lib/utils'

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

	const { currentLanguage } = useLanguage()
	const isSpanish = currentLanguage === LANGUAGE.SPANISH

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
			<div className="question-counter">
				{String(currentQuestionNumber).padStart(2, '0')} /{' '}
				{String(totalQuestions).padStart(2, '0')}
			</div>

			<h2 className="question-text">{question.description}</h2>

			<div className="rating-container">
				<span className={cn('rating-label rating-label-desktop')}>
					{m['quiz.stronglyDisagree']()}
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

					<div className="rating-labels-mobile">
						<span
							className={cn('rating-label-mobile', {
								'rating-label-es': isSpanish,
							})}
						>
							{m['quiz.stronglyDisagree']()}
						</span>
						<span
							className={cn('rating-label-mobile', {
								'rating-label-es': isSpanish,
							})}
						>
							{m['quiz.stronglyAgree']()}
						</span>
					</div>
				</div>

				<span className="rating-label rating-label-desktop">
					{m['quiz.stronglyAgree']()}
				</span>
			</div>

			<div className="navigation-buttons">
				<button
					onClick={handlePrevious}
					disabled={!canGoBack}
					className={cn('nav-button back-button', {
						'nav-button--es': isSpanish,
					})}
				>
					{m['quiz.back']()}
				</button>
				<button
					onClick={handleNext}
					disabled={!canGoForward}
					className={cn('nav-button next-button', {
						'nav-button--es': isSpanish,
					})}
				>
					{isLastQuestion ? m['quiz.submit']() : m['quiz.next']()}
				</button>
			</div>
		</div>
	)
}

export default QuestionCard
