import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { identifyUser, trackEvent } from '../../services/posthog'
import useQuizStore from '../../stores/quizStore'
import type { UserData } from '../../types/quiz.types'
import ErrorMessage from '../common/ErrorMessage'
import LoadingSpinner from '../common/LoadingSpinner'
import GreetingForm from './GreetingForm'
import QuestionCard from './QuestionCard'
import QuizProgressBar from './QuizProgressBar'

export default function QuizContainer() {
	const navigate = useNavigate()
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

	// Navigate to results when quiz is complete
	useEffect(() => {
		if (quizResponse) {
			navigate('/results')
		}
	}, [quizResponse, navigate])

	// Identify user in PostHog when userData is set
	useEffect(() => {
		if (userData) {
			// Use email as the unique identifier
			identifyUser(userData.email, {
				email: userData.email,
				firstName: userData.firstName,
				lastName: userData.lastName,
				name: `${userData.firstName} ${userData.lastName}`,
				licenseCode: userData.licenseCode,
				licenseTier: userData.licenseTier,
			})

			// Track quiz start event
			trackEvent('quiz_started', {
				email: userData.email,
				firstName: userData.firstName,
				lastName: userData.lastName,
				licenseCode: userData.licenseCode,
				licenseTier: userData.licenseTier,
			})
		}
	}, [userData])

	const handleUserDataSubmit = (data: UserData) => {
		setUserData(data)
	}

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
				<GreetingForm onSubmit={handleUserDataSubmit} />
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

	// Show loading while navigating to results
	if (quizResponse) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<LoadingSpinner message="Loading results..." />
			</div>
		)
	}

	// Show current question - find answer by questionId
	const currentQuestionData = currentQuestion()
	const currentAnswerValue = currentQuestionData
		? answers.find((a) => a?.questionId === currentQuestionData.id)?.value
		: undefined

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
							currentValue={currentAnswerValue}
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
