import { useEffect } from 'react'
import Layout from '../components/common/Layout'
import QuizContainer from '../components/quiz/QuizContainer'
import useQuizStore from '../stores/quizStore'

export default function Quiz() {
	const fetchQuestions = useQuizStore((state) => state.fetchQuestions)
	const resetQuiz = useQuizStore((state) => state.resetQuiz)

	useEffect(() => {
		resetQuiz()
		// Fetch questions
		fetchQuestions()
	}, [fetchQuestions, resetQuiz])

	return (
		<Layout>
			<QuizContainer />
		</Layout>
	)
}
