import { Link, useSearchParams } from 'react-router-dom'
import HeroSection from '../components/quiz/HeroSection'
import QuizLayout from '../components/quiz/QuizLayout'
import * as m from '../paraglide/messages'

const Home = () => {
	const LocationPreservingLink = () => {
		const [searchParams] = useSearchParams()

		return (
			<Link
				to={{
					pathname: '/quiz-start',
					search: searchParams.toString(),
				}}
				className="inline-block transition-all duration-300 uppercase leading-none cursor-pointer border border-off-white text-off-white hover:bg-off-white hover:text-primary px-8 py-4 text-base max-lg:w-full"
			>
				{m['quiz.start']()}
			</Link>
		)
	}

	return (
		<QuizLayout>
			{/* Language Selector in top-right corner */}
			{/* <div className="absolute top-4 right-4 z-10">
				<LanguageSelector />
			</div> */}

			<div className="flex-1 flex items-center justify-center px-4 lg:px-8">
				<HeroSection
					title="FIND YOUR FREQUENCY"
					subtitle="THE SEVEN FREQUENCIES OF COMMUNICATION"
				>
					<LocationPreservingLink />
				</HeroSection>
			</div>
		</QuizLayout>
	)
}

export default Home
