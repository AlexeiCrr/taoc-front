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
		canGoBack,
		canGoForward,
		currentQuestionIndex,
		questions,
		answers,
	} = useQuizStore()

	const [isTransitioning, setIsTransitioning] = useState(false)
	const [direction, setDirection] = useState<'forward' | 'backward'>('forward')

	const handleNext = () => {
		// Check if this is the last question
		const isLastQuestion = currentQuestionIndex === questions.length - 1

		if (isLastQuestion) {
			// Submit the quiz
			submitQuiz()
		} else {
			// Go to next question with animation
			setDirection('forward')
			setIsTransitioning(true)
			setTimeout(() => {
				goToNextQuestion()
				setIsTransitioning(false)
			}, 200)
		}
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

	// Show loading state while fetching questions
	if (isLoading && questions.length === 0) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<LoadingSpinner message="Loading questions..." />
			</div>
		)
	}

	// Show loading state while submitting quiz
	if (isLoading && userData) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<LoadingSpinner message="Calculating your results..." size="lg" />
			</div>
		)
	}

	// Show results if quiz is complete
	if (quizResponse) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<h2 className="text-2xl font-bold mb-4">Quiz Complete!</h2>
					<p>Your results have been submitted successfully.</p>
					{/* TODO: Add ResultsView component here */}
				</div>
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
