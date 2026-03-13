import { pdf } from '@react-pdf/renderer'
import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { CheckCircle, Loader2 } from 'lucide-react'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { QuizButton, QuizFooter } from '../components/quiz'
import { ResultsPDF } from '../components/quiz/ResultsPDF'
import { UpgradeCard } from '../components/checkout/UpgradeCard'
import { PaymentErrorBoundary } from '../components/checkout/PaymentErrorBoundary'
import { getUpgradeStatus } from '../services/stripeService'
import { apiService } from '../services/api'
import { trackEvent } from '../services/posthog'
import type { EmailResultsResponse } from '../types/quiz.types'
import type { LicenseTier } from '../services/licenseApi'
import * as m from '../paraglide/messages'

interface UpgradeData {
	newTier: number
	completedAt: string
}

export function EmailResults() {
	const { token } = useParams<{ token: string }>()
	const [searchParams] = useSearchParams()
	const sessionId = searchParams.get('session_id')

	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [responseData, setResponseData] = useState<EmailResultsResponse | null>(null)
	const [isUpgraded, setIsUpgraded] = useState(false)
	const [upgradeData, setUpgradeData] = useState<UpgradeData | null>(null)
	const [isVerifying, setIsVerifying] = useState(false)
	const [isGenerating, setIsGenerating] = useState(false)

	const loadResponse = useCallback(async () => {
		if (!token) {
			setError('Invalid results link.')
			setIsLoading(false)
			return
		}
		try {
			const data = await apiService.getResponseByToken(token)
			setResponseData(data)
		} catch {
			setError('Results not found. The link may be expired or invalid.')
		} finally {
			setIsLoading(false)
		}
	}, [token])

	useEffect(() => {
		loadResponse()
	}, [loadResponse])

	useEffect(() => {
		if (!sessionId) return
		let pollTimeout: ReturnType<typeof setTimeout> | null = null
		let isMounted = true
		let count = 0
		const MAX_POLLS = 10
		const POLL_INTERVAL = 3000

		async function verifyUpgrade() {
			try {
				const status = await getUpgradeStatus(sessionId!)
				if (!isMounted) return

				if (status.status === 'completed' && status.targetTier) {
					setUpgradeData({
						newTier: status.targetTier,
						completedAt: status.completedAt || new Date().toISOString(),
					})
					setIsVerifying(false)
					setIsUpgraded(true)
					const refreshed = await apiService.getResponseByToken(token!)
					if (isMounted) setResponseData(refreshed)
					trackEvent('upgrade_completed', {
						new_tier: status.targetTier,
						session_id: sessionId,
					})
					toast.success(m['upgrade.upgradeSuccessToast']())
				} else if (status.status === 'pending') {
					count++
					if (count < MAX_POLLS) {
						pollTimeout = setTimeout(verifyUpgrade, POLL_INTERVAL)
					} else {
						if (isMounted) setIsVerifying(false)
					}
				} else {
					if (isMounted) setIsVerifying(false)
					toast.error(m['upgrade.verificationFailed']())
				}
			} catch {
				count++
				if (count < MAX_POLLS) {
					pollTimeout = setTimeout(verifyUpgrade, POLL_INTERVAL)
				} else {
					if (isMounted) {
						setIsVerifying(false)
						toast.error(m['upgrade.unableToVerify']())
					}
				}
			}
		}

		setIsVerifying(true)
		verifyUpgrade()

		return () => {
			isMounted = false
			if (pollTimeout) clearTimeout(pollTimeout)
		}
	}, [sessionId, token])

	const generatePDF = async () => {
		if (!responseData) return
		setIsGenerating(true)
		try {
			const quizResponse = {
				id: String(responseData.id),
				firstName: responseData.firstName,
				lastName: responseData.lastName,
				createdOn: responseData.createdOn,
				frequencies: responseData.frequencies,
			}
			const blob = await pdf(<ResultsPDF quizResponse={quizResponse} />).toBlob()
			const url = URL.createObjectURL(blob)
			const link = document.createElement('a')
			link.href = url
			link.download = `seven-frequencies-results-${responseData.firstName}-${responseData.lastName}.pdf`
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)
			URL.revokeObjectURL(url)
			trackEvent('email_results_pdf_downloaded', { tier: responseData.licenseTier })
		} catch (err) {
			console.error('Error generating PDF:', err)
			toast.error(m['upgrade.pdfFailed']())
		} finally {
			setTimeout(() => setIsGenerating(false), 800)
		}
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-off-white">
				<LoadingSpinner message="Loading your results..." />
			</div>
		)
	}

	if (error || !responseData) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-off-white px-4">
				<div className="text-center max-w-md">
					<h2 className="text-2xl font-bold text-main mb-4 uppercase">
						Results Not Found
					</h2>
					<p className="text-base font-family-helvetica text-main mb-4">
						{error || 'We could not find your results.'}
					</p>
					<p className="text-sm font-family-helvetica text-main/70 mb-8">
						If you need help, please contact us at{' '}
						<a
							href="mailto:info@thesevenfrequencies.com"
							className="underline hover:opacity-70 transition-opacity"
						>
							info@thesevenfrequencies.com
						</a>
					</p>
					<QuizButton
						onClick={() => (window.location.href = '/')}
						variant="primary"
						size="large"
					>
						{m['results.takeQuiz']()}
					</QuizButton>
				</div>
			</div>
		)
	}

	return (
		<div className="flex flex-col min-h-screen bg-off-white">
			{/* Verifying upgrade overlay banner */}
			{isVerifying && (
				<div className="w-full bg-main text-off-white py-3 px-4 flex items-center justify-center gap-3">
					<Loader2 className="w-4 h-4 animate-spin" />
					<span className="text-sm font-family-helvetica uppercase tracking-wider">
						{m['upgrade.verifying']()}
					</span>
				</div>
			)}

			{/* Upgrade success banner */}
			{isUpgraded && upgradeData && (
				<div className="w-full bg-green-600 text-white py-4 px-4 flex items-center justify-center gap-3">
					<CheckCircle className="w-5 h-5 flex-shrink-0" />
					<span className="text-sm font-family-helvetica uppercase tracking-wider">
						{m['upgrade.successful']()}
					</span>
				</div>
			)}

			{/* Header */}
			<header className="flex items-center justify-between p-4 lg:p-6">
				<div />
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
					<h1 className="font-bold text-main mb-4 uppercase">
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
						className="flex justify-center items-center flex-nowrap w-[240px] mx-auto"
					>
						{isGenerating ? (
							<LoadingSpinner size="sm" />
						) : (
							m['results.downloadResults']()
						)}
					</QuizButton>

					<PaymentErrorBoundary>
						{responseData.licenseTier < 7 && (
							<UpgradeCard
								currentTier={responseData.licenseTier as LicenseTier}
								email={responseData.email}
								responseId={String(responseData.id)}
								accessToken={responseData.accessToken}
							/>
						)}
					</PaymentErrorBoundary>
				</div>
			</main>

			<QuizFooter inverted />
		</div>
	)
}

export default EmailResults
