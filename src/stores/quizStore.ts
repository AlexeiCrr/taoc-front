import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { apiService } from '../services/api'
import { trackEvent } from '../services/posthog'
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
						// Reset answers when fetching new questions to prevent stale data
						set({ questions, answers: [], currentQuestionIndex: 0, isLoading: false })
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

					// Find if answer already exists for this question
					const existingIndex = state.answers.findIndex(
						(a) => a?.questionId === currentQuestion.id
					)

					let newAnswers: Answer[]
					if (existingIndex >= 0) {
						// Update existing answer
						newAnswers = [...state.answers]
						newAnswers[existingIndex] = answer
					} else {
						// Add new answer
						newAnswers = [...state.answers, answer]
					}

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
					const { userData, answers, questions } = get()

					if (!userData) {
						set({ error: 'User data is missing' })
						return
					}

					// Filter out any undefined/null values and log if found
					const validAnswers = answers.filter((answer) => answer != null)
					
					if (validAnswers.length !== answers.length) {
						console.error('Found undefined/null answers:', {
							totalAnswers: answers.length,
							validAnswers: validAnswers.length,
							totalQuestions: questions.length,
							answers: answers.map((a, i) => ({ index: i, answer: a }))
						})
					}

					set({ isLoading: true, error: null })

					try {
						const response = await apiService.submitQuizResponse({
							userData,
							answers: validAnswers,
						})
						set({ quizResponse: response, isLoading: false })

						// Track quiz completion in PostHog
						trackEvent('quiz_completed', {
							email: userData.email,
							firstName: userData.firstName,
							lastName: userData.lastName,
							licenseCode: userData.licenseCode,
							licenseTier: userData.licenseTier,
							totalQuestions: answers.length,
							responseId: response.id,
							topFrequency: response.frequencies[0]?.name,
							topFrequencyValue: response.frequencies[0]?.value,
						})

						// Don't clear localStorage - keep quizResponse persisted
						// so user can refresh and still see results
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
					sessionStorage.removeItem('quiz-storage')
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
					const { currentQuestionIndex, answers, questions } = get()
					const currentQuestion = questions[currentQuestionIndex]
					if (!currentQuestion) return false
					// Check if an answer exists for the current question by questionId
					return answers.some((a) => a?.questionId === currentQuestion.id)
				},
			}),
			{
				name: 'quiz-storage',
				storage: {
					getItem: (name) => {
						const str = sessionStorage.getItem(name)
						if (!str) return null
						
						try {
							const parsed = JSON.parse(str)
							// Validate and clean the answers array if it exists
							if (parsed.state?.answers && Array.isArray(parsed.state.answers)) {
								// Filter out any null/undefined values from the persisted answers
								parsed.state.answers = parsed.state.answers.filter((a: any) => a != null)
							}
							return parsed
						} catch (e) {
							console.error('Failed to parse quiz storage:', e)
							return null
						}
					},
					setItem: (name, value) => {
						sessionStorage.setItem(name, JSON.stringify(value))
					},
					removeItem: (name) => sessionStorage.removeItem(name),
				},
			}
		),
		{
			name: 'quiz-store',
		}
	)
)

export default useQuizStore
