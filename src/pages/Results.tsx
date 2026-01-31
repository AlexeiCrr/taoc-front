import { pdf } from '@react-pdf/renderer'
import { useState } from 'react'
import { useLocaleNavigate } from '../hooks/useLocaleNavigate'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { QuizButton, QuizFooter } from '../components/quiz'
import { ResultsPDF } from '../components/quiz/ResultsPDF'
import useQuizStore from '../stores/quizStore'
import * as m from '../paraglide/messages'

export const Results = () => {
	const navigate = useLocaleNavigate()
	const { quizResponse } = useQuizStore()
	const [isGenerating, setIsGenerating] = useState(false)

	const generatePDF = async () => {
		if (!quizResponse) return
		setIsGenerating(true)

		try {
			const blob = await pdf(
				<ResultsPDF quizResponse={quizResponse} />
			).toBlob()

			const url = URL.createObjectURL(blob)
			const link = document.createElement('a')
			link.href = url
			link.download = `seven-frequencies-results-${quizResponse.firstName}-${quizResponse.lastName}.pdf`
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)
			URL.revokeObjectURL(url)
		} catch (error) {
			console.error('Error generating PDF:', error)
			alert(m['upgrade.pdfFailed']())
		} finally {
			setTimeout(() => {
				setIsGenerating(false)
			}, 800)
		}
	}

	if (!quizResponse) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
				<div className="text-center max-w-md">
					<h2 className="text-2xl font-bold text-main mb-4">
						{m['results.noResults']()}
					</h2>
					<p className="text-lg text-main mb-6">
						{m['results.completeQuizFirst']()}
					</p>
					<button
						onClick={() => navigate('/')}
						className="bg-main text-off-white px-8 py-3 rounded-md text-lg font-semibold uppercase hover:opacity-80 transition-opacity"
					>
						{m['results.takeQuiz']()}
					</button>
				</div>
			</div>
		)
	}

	return (
		<div className="flex flex-col min-h-screen bg-off-white">
			{/* Header */}
			<header className="flex items-center justify-between p-4 lg:p-6">
				{/* Left: Back arrow and Logo */}
				<div className="flex items-center gap-4">
					<button
						onClick={() => navigate('/')}
						className="text-main hover:opacity-70 transition-opacity cursor-pointer"
						aria-label="Go back"
					>
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M19 12H5M12 19l-7-7 7-7" />
						</svg>
					</button>
				</div>

				{/* Right: More Info Link */}
				<a
					href="https://www.thesevenfrequencies.com/"
					target="_blank"
					rel="noopener noreferrer"
					className="text-main font-semibold uppercase tracking-wider hover:opacity-70 transition-opacity"
				>
					{m['results.moreInfo']()}
				</a>
			</header>

			{/* Main Content */}
			<main className="flex-1 flex items-center justify-center p-6 lg:p-8">
				<div className="max-w-2xl w-full text-center">
					<h1 className=" font-bold text-main mb-4 uppercase">
						{m['results.congratulations']()}
					</h1>

					<p className="text-base font-family-helvetica text-main mb-8 uppercase">
						{m['results.emailResults']()}
					</p>

					<QuizButton
						onClick={generatePDF}
						disabled={isGenerating}
						size="large"
						variant="primary"
						className="flex justify-center items-center flex-nowrap w-[240px]"
					>
						{isGenerating ? <LoadingSpinner size="sm" /> : m['results.downloadResults']()}
					</QuizButton>

					{/* Upgrade Upsell - show if user has room to upgrade */}
					{/* {userData?.licenseTier && userData.licenseTier < 7 && (
						<UpgradeCard
							currentTier={userData.licenseTier as LicenseTier}
							email={userData.email}
							responseId={quizResponse.id}
						/>
					)} */}
				</div>
			</main>
			<QuizFooter inverted />
		</div>
	)
}
