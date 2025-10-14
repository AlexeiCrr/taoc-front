import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { apiService } from '../services/api'
import type {
	Answer,
	Question,
	QuizResponse,
	UserData,
} from '../types/quiz.types'

interface QuizState {
	// State
	questions: Question[]
	currentQuestionIndex: number
	answers: Answer[]
	userData: UserData | null
	quizResponse: QuizResponse | null
	isLoading: boolean
	error: string | null

	// Actions
	fetchQuestions: () => Promise<void>
	setUserData: (userData: UserData) => void
	answerQuestion: (value: number) => void
	goToPreviousQuestion: () => void
	goToNextQuestion: () => void
	submitQuiz: () => Promise<void>
	resetQuiz: () => void

	// Computed getters
	progress: () => number
	currentQuestion: () => Question | undefined
	isComplete: () => boolean
	canGoBack: () => boolean
	canGoForward: () => boolean
}

const useQuizStore = create<QuizState>()(
	devtools(
		persist(
			(set, get) => ({
				// Initial state
				questions: [],
				currentQuestionIndex: 0,
				answers: [],
				userData: null,
				quizResponse: null,
				isLoading: false,
				error: null,

				// Actions
				fetchQuestions: async () => {
					set({ isLoading: true, error: null })
					try {
						const questions = await apiService.getQuestions()
						set({ questions, isLoading: false })
					} catch (error) {
						set({
							error:
								error instanceof Error
									? error.message
									: 'Failed to fetch questions',
							isLoading: false,
						})
					}
				},

				setUserData: (userData) => {
					set({ userData })
				},

				answerQuestion: (value) => {
					const state = get()
					const currentQuestion = state.questions[state.currentQuestionIndex]

					if (!currentQuestion) return

					const answer: Answer = {
						questionId: currentQuestion.id,
						frequencyId: currentQuestion.frequencyId,
						value,
					}

					const newAnswers = [...state.answers]
					newAnswers[state.currentQuestionIndex] = answer

					set({ answers: newAnswers })
				},

				goToPreviousQuestion: () => {
					const { currentQuestionIndex } = get()
					if (currentQuestionIndex > 0) {
						set({ currentQuestionIndex: currentQuestionIndex - 1 })
					}
				},

				goToNextQuestion: () => {
					const { currentQuestionIndex, questions } = get()
					if (currentQuestionIndex < questions.length - 1) {
						set({ currentQuestionIndex: currentQuestionIndex + 1 })
					}
				},

				submitQuiz: async () => {
					const { userData, answers } = get()

					if (!userData) {
						set({ error: 'User data is missing' })
						return
					}

					set({ isLoading: true, error: null })
					console.log('submitting')

					try {
						const response = await apiService.submitQuizResponse({
							userData,
							answers,
						})
						set({ quizResponse: response, isLoading: false })
						// Clear persisted data after successful submission
						localStorage.removeItem('quiz-storage')
					} catch (error) {
						set({
							error:
								error instanceof Error
									? error.message
									: 'Failed to submit quiz',
							isLoading: false,
						})
					}
				},

				resetQuiz: () => {
					set({
						currentQuestionIndex: 0,
						answers: [],
						userData: null,
						quizResponse: null,
						error: null,
					})
					// Clear persisted data when resetting
					localStorage.removeItem('quiz-storage')
				},

				// Computed values
				progress: () => {
					const { currentQuestionIndex, questions } = get()
					return questions.length
						? (currentQuestionIndex / questions.length) * 100
						: 0
				},

				currentQuestion: () => {
					const { questions, currentQuestionIndex } = get()
					return questions[currentQuestionIndex]
				},

				isComplete: () => {
					const { currentQuestionIndex, questions } = get()
					return currentQuestionIndex >= questions.length
				},

				canGoBack: () => {
					const { currentQuestionIndex } = get()
					return currentQuestionIndex > 0
				},

				canGoForward: () => {
					const { currentQuestionIndex, answers } = get()
					return answers[currentQuestionIndex] !== undefined
				},
			}),
			{
				name: 'quiz-storage',
				partialize: (state) => ({
					userData: state.userData,
					questions: state.questions,
					currentQuestionIndex: state.currentQuestionIndex,
					answers: state.answers,
					quizResponse: state.quizResponse,
				}),
			}
		),
		{
			name: 'quiz-store',
		}
	)
)

export default useQuizStore
