import HeroSection from '../components/quiz/HeroSection'
import QuizButton from '../components/quiz/QuizButton'
import QuizLayout from '../components/quiz/QuizLayout'
import * as m from '../paraglide/messages'

const Home = () => {
	return (
		<QuizLayout showFooter={true}>
			{/* Language Selector in top-right corner */}
			{/* <div className="absolute top-4 right-4 z-10">
				<LanguageSelector />
			</div> */}

			<div className="flex-1 flex items-center justify-center px-8">
				<HeroSection
					title="FIND YOUR FREQUENCY"
					subtitle="THE SEVEN FREQUENCIES OF COMMUNICATION"
				>
					{/* Start Assessment Button */}
					<QuizButton variant="light-outline" size="large" to="/quiz-start">
						{m['quiz.start']()}
					</QuizButton>
				</HeroSection>
			</div>
		</QuizLayout>
	)
}

export default Home
