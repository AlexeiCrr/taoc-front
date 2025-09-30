import useQuizStore from '../../stores/quizStore'
// import GreetingForm from './GreetingForm';
// import QuestionCard from './QuestionCard';
// import ResultsView from './ResultsView';
import ErrorMessage from '../common/ErrorMessage'
import LoadingSpinner from '../common/LoadingSpinner'
import ProgressBar from '../common/ProgressBar'
import GreetingForm from './GreetingForm'

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
		<div className="max-w-4xl mx-auto">
			<div className="mb-8">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-2xl font-bold text-gray-800">
						Question {currentQuestionIndex + 1} of {questions.length}
					</h2>
					<span className="text-sm text-gray-600">
						{Math.round(progress())}% Complete
					</span>
				</div>
				<ProgressBar value={progress()} />
			</div>

			{/* {currentQuestion() && (
        <QuestionCard
          question={currentQuestion()!}
          currentValue={currentAnswer?.value}
          onAnswer={answerQuestion}
          onNext={goToNextQuestion}
          onPrevious={goToPreviousQuestion}
          canGoBack={canGoBack()}
          canGoForward={canGoForward()}
          isLastQuestion={currentQuestionIndex === questions.length - 1}
        />
      )} */}

			{error && (
				<div className="mt-4">
					<ErrorMessage message={error} />
				</div>
			)}
		</div>
	)
}
