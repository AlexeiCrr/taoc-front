import { useNavigate } from 'react-router-dom'
import GreetingForm from '../components/quiz/GreetingForm'

const QuizStart = () => {
	const navigate = useNavigate()

	const handleFormSubmit = (data: unknown) => {
		console.log('Form submitted with data:', data)
		// Store the user data in your state management solution (e.g., Zustand store)
		// Then navigate to the actual quiz
		navigate('/quiz')
	}

	return (
		<div
			className={`min-h-screen bg-off-white p-6 flex justify-center items-center`}
		>
			<div className="relative flex flex-col">
				<GreetingForm onSubmit={handleFormSubmit} />
			</div>
		</div>
	)
}

export default QuizStart
