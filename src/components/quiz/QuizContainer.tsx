import { useState } from 'react'
import useQuizStore from '../../stores/quizStore'
import ErrorMessage from '../common/ErrorMessage'
import LoadingSpinner from '../common/LoadingSpinner'
import GreetingForm from './GreetingForm'
import QuestionCard from './QuestionCard'
import QuizProgressBar from './QuizProgressBar'

export default function QuizContainer() {
	const {
		userData,
		currentQuestion,
		quizResponse,
		isLoading,
		error,
		setUserData,
		answerQuestion,
		goToPreviousQuestion,
		goToNextQuestion,
		submitQuiz,
		progress,
		isComplete,
		canGoBack,
		canGoForward,
		currentQuestionIndex,
		questions,
		answers,
	} = useQuizStore()

	const [isTransitioning, setIsTransitioning] = useState(false)
	const [direction, setDirection] = useState<'forward' | 'backward'>('forward')

	const handleNext = () => {
		setDirection('forward')
		setIsTransitioning(true)
		setTimeout(() => {
			goToNextQuestion()
			setIsTransitioning(false)
		}, 200)
	}

	const handlePrevious = () => {
		setDirection('backward')
		setIsTransitioning(true)
		setTimeout(() => {
			goToPreviousQuestion()
			setIsTransitioning(false)
		}, 200)
	}

	// Show loading state
	if (isLoading && !userData) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<LoadingSpinner message="Loading quiz..." />
			</div>
		)
	}

	// Show error state
	if (error && !userData) {
		return (
			<div className="max-w-2xl mx-auto">
				<ErrorMessage
					message={error}
					onRetry={() => window.location.reload()}
				/>
			</div>
		)
	}

	// Show greeting form if no user data
	if (!userData) {
		return (
			<div className="max-w-2xl mx-auto">
				<GreetingForm onSubmit={setUserData} />
			</div>
		)
	}

	// Show results if quiz is complete
	if (quizResponse) {
		// return <ResultsView response={quizResponse} />;
	}

	// Show loading state while fetching questions
	if (isLoading || questions.length === 0) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<LoadingSpinner message="Loading questions..." />
			</div>
		)
	}

	// Check if quiz is complete and needs submission
	if (isComplete()) {
		submitQuiz()
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<LoadingSpinner message="Calculating your results..." size="lg" />
			</div>
		)
	}

	// Show current question
	const currentAnswer = answers[currentQuestionIndex]

	return (
		<>
			<div className="w-full relative overflow-hidden">
				<div
					className={`question-transition-wrapper ${
						isTransitioning
							? direction === 'forward'
								? 'exit-left'
								: 'exit-right'
							: 'enter'
					}`}
				>
					{currentQuestion() && (
						<QuestionCard
							question={currentQuestion()!}
							currentValue={currentAnswer?.value}
							onAnswer={answerQuestion}
							onNext={handleNext}
							onPrevious={handlePrevious}
							canGoBack={canGoBack()}
							canGoForward={canGoForward()}
							isLastQuestion={currentQuestionIndex === questions.length - 1}
							currentQuestionNumber={currentQuestionIndex + 1}
							totalQuestions={questions.length}
						/>
					)}
				</div>

				{error && (
					<div className="mt-4 max-w-2xl mx-auto">
						<ErrorMessage message={error} />
					</div>
				)}
			</div>

			<QuizProgressBar
				currentQuestion={currentQuestionIndex + 1}
				totalQuestions={questions.length}
			/>
		</>
	)
}
