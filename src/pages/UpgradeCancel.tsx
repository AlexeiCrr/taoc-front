import { useSearchParams } from 'react-router-dom'
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react'
import LocaleLink from '../components/LocaleLink'
import { QuizButton, QuizFooter } from '../components/quiz'
import { trackEvent } from '../services/posthog'
import { useEffect } from 'react'

export function UpgradeCancel() {
	const [searchParams] = useSearchParams()
	const sessionId = searchParams.get('session_id')

	useEffect(() => {
		trackEvent('upgrade_cancelled', { session_id: sessionId })
	}, [sessionId])

	const handleRetry = () => {
		window.location.href = '/results'
	}

	return (
		<div className="min-h-screen flex flex-col bg-off-white">
			<main className="flex-1 flex items-center justify-center p-6">
				<div className="max-w-md w-full bg-white rounded-lg p-8 text-center shadow-sm border border-gray-200">
					<div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<AlertTriangle className="w-8 h-8 text-amber-600" />
					</div>

					<h1 className="text-2xl font-bold text-main mb-3 uppercase">
						Payment Cancelled
					</h1>

					<p className="text-main font-family-helvetica mb-6">
						Your payment was not completed. No charges were made to your
						account.
					</p>

					<div className="space-y-3">
						<QuizButton
							onClick={handleRetry}
							variant="primary"
							className="w-full flex justify-center items-center gap-2"
						>
							<RefreshCw className="w-5 h-5" />
							<span>Try Again</span>
						</QuizButton>

						<LocaleLink to="/results" className="block">
							<QuizButton
								variant="primary-outline"
								className="w-full flex justify-center items-center gap-2"
							>
								<ArrowLeft className="w-5 h-5" />
								<span>Back to Results</span>
							</QuizButton>
						</LocaleLink>
					</div>
				</div>
			</main>
			<QuizFooter inverted />
		</div>
	)
}

export default UpgradeCancel
