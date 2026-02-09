import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import LocaleLink from '../components/LocaleLink'
import { CheckCircle, Download, ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { pdf } from '@react-pdf/renderer'
import { QuizButton, QuizFooter } from '../components/quiz'
import { ResultsPDF } from '../components/quiz/ResultsPDF'
import { getUpgradeStatus } from '../services/stripeService'
import { trackEvent } from '../services/posthog'
import useQuizStore from '../stores/quizStore'
import LoadingSpinner from '../components/common/LoadingSpinner'
import * as m from '../paraglide/messages'

/**
 * Post-payment success page.
 * Verifies upgrade status and allows downloading upgraded PDF.
 */
const MAX_POLLS = 10
const POLL_INTERVAL = 3000

export function UpgradeSuccess() {
	const [searchParams] = useSearchParams()
	const [isVerifying, setIsVerifying] = useState(true)
	const [upgradeData, setUpgradeData] = useState<{
		newTier: number
		completedAt: string
	} | null>(null)
	const [isGenerating, setIsGenerating] = useState(false)
	const [pollCount, setPollCount] = useState(0)
	const [retryTrigger, setRetryTrigger] = useState(0)

	const { quizResponse } = useQuizStore()
	const sessionId = searchParams.get('session_id')

	useEffect(() => {
		let pollTimeout: ReturnType<typeof setTimeout> | null = null
		let isMounted = true

		setPollCount(0)

		async function verifyUpgrade() {
			if (!sessionId) {
				toast.error(m['upgrade.invalidSession']())
				setIsVerifying(false)
				return
			}

			try {
				const status = await getUpgradeStatus(sessionId)

				if (!isMounted) return

				if (status.status === 'completed' && status.targetTier) {
					setUpgradeData({
						newTier: status.targetTier,
						completedAt: status.completedAt || new Date().toISOString(),
					})
					setIsVerifying(false)

					trackEvent('upgrade_completed', {
						new_tier: status.targetTier,
						session_id: sessionId,
						polls_required: pollCount,
					})

					toast.success(m['upgrade.upgradeSuccessToast']())
				} else if (status.status === 'pending') {
					if (pollCount < MAX_POLLS) {
						setPollCount((prev) => prev + 1)
						pollTimeout = setTimeout(verifyUpgrade, POLL_INTERVAL)

						if (pollCount === 0) {
							toast.info(m['upgrade.paymentProcessing']())
						}
					} else {
						setIsVerifying(false)
					}
				} else if (status.status === 'failed') {
					setIsVerifying(false)
					toast.error(m['upgrade.verificationFailed']())
				}
			} catch (error) {
				if (!isMounted) return

				if (pollCount < MAX_POLLS) {
					setPollCount((prev) => prev + 1)
					pollTimeout = setTimeout(verifyUpgrade, POLL_INTERVAL)
				} else {
					setIsVerifying(false)
					toast.error(m['upgrade.unableToVerify']())
				}
			}
		}

		verifyUpgrade()

		return () => {
			isMounted = false
			if (pollTimeout) clearTimeout(pollTimeout)
		}
	}, [sessionId, retryTrigger])

	const handleDownload = async () => {
		if (!quizResponse) {
			toast.error(m['upgrade.quizNotFound']())
			return
		}

		setIsGenerating(true)

		try {
			// Generate PDF with full frequencies (backend should now return all based on upgraded tier)
			const blob = await pdf(
				<ResultsPDF quizResponse={quizResponse} />
			).toBlob()

			const url = URL.createObjectURL(blob)
			const link = document.createElement('a')
			link.href = url
			link.download = `seven-frequencies-complete-${quizResponse.firstName}-${quizResponse.lastName}.pdf`
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)
			URL.revokeObjectURL(url)

			trackEvent('upgraded_pdf_downloaded', {
				tier: upgradeData?.newTier,
			})

			toast.success(m['upgrade.reportDownloaded']())
		} catch (error) {
			console.error('Error generating PDF:', error)
			toast.error(m['upgrade.pdfFailed']())
		} finally {
			setIsGenerating(false)
		}
	}

	if (isVerifying) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-off-white">
				<div className="text-center">
					<Loader2 className="w-12 h-12 animate-spin text-main mx-auto mb-4" />
					<p className="text-main font-family-helvetica">
						{m['upgrade.verifying']()}
					</p>
				</div>
			</div>
		)
	}

	if (!upgradeData) {
		return (
			<div className="min-h-screen flex flex-col bg-off-white">
				<div className="flex-1 flex items-center justify-center p-4">
					<div className="max-w-md w-full bg-white rounded-lg p-8 text-center shadow-sm border border-gray-200">
						<div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<span className="text-3xl">!</span>
						</div>
						<h1 className="text-2xl font-bold text-main mb-2 uppercase">
							{m['upgrade.verificationPending']()}
						</h1>
						<p className="text-main font-family-helvetica mb-6">
							{m['upgrade.verificationPendingMessage']()}
						</p>
						{sessionId && (
							<p className="text-xs text-gray-500 mb-6 font-mono bg-gray-100 p-2 rounded break-all">
								Session: {sessionId}
							</p>
						)}
						<div className="space-y-3">
							<QuizButton
								onClick={() => {
									setRetryTrigger((prev) => prev + 1)
									setIsVerifying(true)
								}}
								variant="primary"
								className="w-full flex justify-center"
							>
								Check Again
							</QuizButton>
							<LocaleLink to="/" className="block">
								<QuizButton
									variant="primary-outline"
									className="w-full flex justify-center"
								>
									{m['upgrade.returnHome']()}
								</QuizButton>
							</LocaleLink>
						</div>
					</div>
				</div>
				<QuizFooter inverted />
			</div>
		)
	}

	return (
		<div className="min-h-screen flex flex-col bg-off-white">
			{/* Header */}
			<header className="flex items-center justify-between p-4 lg:p-6">
				<LocaleLink
					to="/results"
					className="text-main hover:opacity-70 transition-opacity flex items-center gap-2"
				>
					<ArrowLeft className="w-5 h-5" />
					<span className="uppercase tracking-wide text-sm font-semibold">
						{m['upgrade.backToResults']()}
					</span>
				</LocaleLink>
			</header>

			{/* Main Content */}
			<main className="flex-1 flex items-center justify-center p-6">
				<div className="max-w-xl w-full bg-white rounded-lg p-8 shadow-sm border border-gray-200 text-center">
					{/* Success Icon */}
					<div className="flex justify-center mb-6">
						<CheckCircle
							className="w-20 h-20 text-green-500"
							strokeWidth={1.5}
						/>
					</div>

					{/* Heading */}
					<h1 className="text-2xl font-bold text-main mb-3 uppercase tracking-wide">
						{m['upgrade.successful']()}
					</h1>

					<p className="text-main font-family-helvetica mb-8">
						{upgradeData.newTier === 7
							? m['upgrade.accessAll']()
							: m['upgrade.accessTop']({ count: String(upgradeData.newTier) })}
					</p>

					{/* Upgrade Details */}
					<div className="bg-amber-50 rounded-lg p-6 mb-8 border border-amber-200">
						<div className="grid grid-cols-2 gap-4 text-center">
							<div>
								<p className="text-sm text-gray-500 mb-1 uppercase tracking-wide">
									{m['upgrade.newTier']()}
								</p>
								<p className="text-2xl font-bold text-main">
									{m['upgrade.tier']({ n: String(upgradeData.newTier) })}
								</p>
							</div>
							<div>
								<p className="text-sm text-gray-500 mb-1 uppercase tracking-wide">
									{m['upgrade.upgradedOn']()}
								</p>
								<p className="text-lg font-semibold text-main">
									{new Date(upgradeData.completedAt).toLocaleDateString()}
								</p>
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="space-y-3">
						<QuizButton
							onClick={handleDownload}
							disabled={isGenerating}
							variant="primary"
							size="large"
							className="w-full flex justify-center items-center gap-2"
						>
							{isGenerating ? (
								<>
									<LoadingSpinner size="sm" />
									<span>{m['upgrade.generating']()}</span>
								</>
							) : (
								<>
									<Download className="w-5 h-5" />
									<span>{m['upgrade.downloadCompleteReport']()}</span>
								</>
							)}
						</QuizButton>

						<LocaleLink to="/results" className="block">
							<QuizButton
								variant="primary-outline"
								className="w-full flex justify-center items-center gap-2"
							>
								<ArrowLeft className="w-5 h-5" />
								<span>{m['upgrade.viewResults']()}</span>
							</QuizButton>
						</LocaleLink>
					</div>

					{/* Footer Note */}
					<p className="mt-6 text-sm text-gray-500 font-family-helvetica">
						{m['upgrade.emailNote']()}
					</p>
				</div>
			</main>

			<QuizFooter inverted />
		</div>
	)
}

export default UpgradeSuccess
