import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/common/Layout'
import QuizContainer from '../components/quiz/QuizContainer'
import useQuizStore from '../stores/quizStore'

export default function Quiz() {
	const navigate = useNavigate()
	const fetchQuestions = useQuizStore((state) => state.fetchQuestions)
	const userData = useQuizStore((state) => state.userData)
	const questions = useQuizStore((state) => state.questions)

	useEffect(() => {
		if (!userData) {
			navigate('/quiz-start')
			return
		}

		// Fetch questions if not already loaded
		if (questions.length === 0) {
			fetchQuestions()
		}
	}, [fetchQuestions, userData, questions.length, navigate])

	return (
		<Layout>
			<div className="absolute text-pompei top-10 lg:top-20 left-1/2 -translate-x-1/2 text-main text-5xl">
				7
			</div>
			<QuizContainer />
		</Layout>
	)
}
