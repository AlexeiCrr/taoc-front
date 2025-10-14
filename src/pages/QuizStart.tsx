import { useNavigate } from 'react-router-dom'
import GreetingForm from '../components/quiz/GreetingForm'
import useQuizStore from '../stores/quizStore'

interface FormData {
	licenseCode: string
	firstName: string
	lastName: string
	email: string
	agreeToEmail: boolean
}

const QuizStart = () => {
	const navigate = useNavigate()
	const setUserData = useQuizStore((state) => state.setUserData)

	const handleFormSubmit = (data: FormData) => {
		// Map form data to UserData type and store in zustand
		setUserData({
			firstName: data.firstName,
			lastName: data.lastName,
			email: data.email,
			licenseCode: data.licenseCode,
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
			<div className="relative flex flex-col">
				<GreetingForm onSubmit={handleFormSubmit} />
			</div>
		</div>
	)
}

export default QuizStart
