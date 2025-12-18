import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import GreetingForm from '../components/quiz/GreetingForm'
import useQuizStore from '../stores/quizStore'

interface FormData {
	licenseCode: string
	firstName: string
	lastName: string
	email: string
	agreeToEmail: boolean
	licenseTier?: number
}

const QuizStart = () => {
	const navigate = useNavigate()
	const setUserData = useQuizStore((state) => state.setUserData)
	const resetQuiz = useQuizStore((state) => state.resetQuiz)

	// Reset quiz when component mounts to ensure clean state
	useEffect(() => {
		resetQuiz()
	}, [resetQuiz])

	const handleFormSubmit = (data: FormData) => {
		// Map form data to UserData type and store in zustand
		setUserData({
			firstName: data.firstName,
			lastName: data.lastName,
			email: data.email,
			licenseCode: data.licenseCode,
			licenseTier: data.licenseTier,
			hasSubscribed: data.agreeToEmail,
			quizStartedAt: new Date().toISOString(),
		})

		// Navigate to the actual quiz
		navigate('/quiz')
	}

	return (
		<div
			className={`min-h-screen bg-off-white p-3 lg:p-6 flex justify-center items-center`}
		>
			<div className="absolute text-pompei top-10 lg:top-20 left-1/2 -translate-x-1/2 text-main text-5xl">
				7
			</div>
			<div className="relative flex flex-col">
				<GreetingForm onSubmit={handleFormSubmit} />
			</div>
		</div>
	)
}

export default QuizStart
