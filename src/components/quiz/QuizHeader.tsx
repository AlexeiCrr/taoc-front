import { Link } from 'react-router-dom'
import QuizButton from './QuizButton'

const QuizHeader = () => {
	return (
		<header className="absolute top-0 left-0 right-0 z-10  max-lg:pe-0 p-4 lg:p-6 flex justify-between items-center">
			<Link
				to="/"
				className="text-off-white hover:opacity-80 transition-opacity"
			>
				<span className="text-5xl font-pompei">7</span>
			</Link>

			<QuizButton
				to={'https://www.thesevenfrequencies.com/'}
				variant="text"
				size="large"
			>
				More Info
			</QuizButton>
		</header>
	)
}

export default QuizHeader
