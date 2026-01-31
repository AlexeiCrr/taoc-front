import LocaleLink from '../LocaleLink'
import QuizButton from './QuizButton'
import * as m from '../../paraglide/messages'

const QuizHeader = () => {
	return (
		<header className="absolute top-0 left-0 right-0 z-10  max-lg:pe-0 p-4 lg:p-6 flex justify-between items-center">
			<LocaleLink
				to="/"
				className="text-off-white hover:opacity-80 transition-opacity"
			>
				<span className="text-5xl font-pompei">7</span>
			</LocaleLink>

			<div className="flex items-center gap-4">
				{/* <LanguageSelector /> */}
				<QuizButton
					to={'https://www.thesevenfrequencies.com/'}
					variant="text"
					size="large"
				>
					{m['quiz.moreInfo']()}
				</QuizButton>
			</div>
		</header>
	)
}

export default QuizHeader
