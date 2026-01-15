import UserDataCard from '@/components/admin/UserDataCard'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { FrequencyMap } from '@/components/quiz/FrequencyMap'
import { ResultsPDF } from '@/components/quiz/ResultsPDF'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { adminApi } from '@/services/api'
import { LicenseTier } from '@/services/licenseApi'
import { captureFrequencyMap } from '@/utils/captureFrequencyMap'
import {
	getAllFrequenciesSorted,
	toQuizResponse,
	type ResponseDetailDto,
} from '@/utils/responseDetailUtils'
import { pdf } from '@react-pdf/renderer'
import { ChevronLeft, Download, Mail } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

export default function ResponseDetail() {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()
	const [response, setResponse] = useState<ResponseDetailDto | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
	const [isGeneratingMap, setIsGeneratingMap] = useState(false)
	const [isResendingEmail, setIsResendingEmail] = useState(false)
	// Tier 7 fallback ensures selector has valid value even when licenseTier is null
	const [selectedTier, setSelectedTier] = useState<number>(LicenseTier.TIER_7)

	const fetchResponse = async (signal?: AbortSignal) => {
		if (!id) return

		setIsLoading(true)
		setError(null)

		try {
			const data = await adminApi
				.get(`responses/${id}`, signal ? { signal } : {})
				.json<ResponseDetailDto>()

			if (!signal?.aborted) {
				setResponse(data)
				// Selector defaults to user's license tier; reduces accidental tier mismatches
				if (data.licenseTier) {
					setSelectedTier(data.licenseTier)
				}
			}
		} catch (err) {
			if (!signal?.aborted) {
				const errorMessage =
					err instanceof Error ? err.message : 'Failed to load response'
				setError(errorMessage)
			}
		} finally {
			if (!signal?.aborted) {
				setIsLoading(false)
			}
		}
	}

	const refetchResponse = async () => {
		await fetchResponse()
	}

	useEffect(() => {
		const abortController = new AbortController()
		fetchResponse(abortController.signal)

		return () => {
			abortController.abort()
		}
	}, [id])

	const handleDownloadPDF = async () => {
		if (!response) return

		setIsGeneratingPDF(true)

		try {
			const quizResponse = toQuizResponse(response, selectedTier)

			const blob = await pdf(
				<ResultsPDF quizResponse={quizResponse} />
			).toBlob()

			const url = URL.createObjectURL(blob)
			const link = document.createElement('a')
			link.href = url
			link.download = `seven-frequencies-results-${response.firstName}-${response.lastName}.pdf`
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)
			URL.revokeObjectURL(url)
		} catch (error) {
			console.error('Error generating PDF:', error)
			toast.error('Failed to generate PDF. Please try again.')
		} finally {
			setIsGeneratingPDF(false)
		}
	}

	const handleDownloadFrequencyMap = async () => {
		if (!response) return

		const frequencies = getAllFrequenciesSorted(response)
		if (frequencies.length !== 7) {
			toast.error('Frequency map requires all 7 frequencies')
			return
		}

		setIsGeneratingMap(true)

		try {
			const frequencyMapImage = await captureFrequencyMap(frequencies)

			// Convert base64 to blob and download
			const base64Data = frequencyMapImage.split(',')[1]
			const byteCharacters = atob(base64Data)
			const byteNumbers = new Array(byteCharacters.length)
			for (let i = 0; i < byteCharacters.length; i++) {
				byteNumbers[i] = byteCharacters.charCodeAt(i)
			}
			const byteArray = new Uint8Array(byteNumbers)
			const blob = new Blob([byteArray], { type: 'image/png' })

			const url = URL.createObjectURL(blob)
			const link = document.createElement('a')
			link.href = url
			link.download = `frequency-map-${response.firstName}-${response.lastName}.png`
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)
			URL.revokeObjectURL(url)
		} catch (error) {
			console.error('Error generating frequency map:', error)
			toast.error('Failed to generate frequency map. Please try again.')
		} finally {
			setIsGeneratingMap(false)
		}
	}

	const handleResendEmail = async () => {
		if (!id) return

		setIsResendingEmail(true)

		try {
			await adminApi.post(`responses/${id}/resend?tier=${selectedTier}`).json()
			toast.success('Email resent successfully')
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to resend email'
			toast.error(errorMessage)
		} finally {
			setIsResendingEmail(false)
		}
	}

	if (isLoading) {
		return (
			<div className="min-h-screen bg-background font-roboto flex items-center justify-center">
				<LoadingSpinner size="lg" />
			</div>
		)
	}

	if (error || !response) {
		return (
			<div className="min-h-screen bg-background font-roboto flex items-center justify-center px-4">
				<Card className="max-w-md w-full">
					<CardHeader>
						<CardTitle className="text-destructive">
							Error Loading Response
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-muted-foreground">
							{error || 'Response not found'}
						</p>
						<Button onClick={() => navigate('/dashboard')} variant="outline">
							<ChevronLeft className="mr-2 h-4 w-4" />
							Back to Dashboard
						</Button>
					</CardContent>
				</Card>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-background font-roboto">
			<header className="bg-card shadow-sm border-b border-border">
				<div className="max-w-6xl mx-auto flex px-4 sm:px-6 lg:px-8 py-4">
					<Link
						to="/dashboard"
						className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
					>
						<ChevronLeft className="mr-1 h-4 w-4" />
						Back to Dashboard
					</Link>
				</div>
			</header>

			<main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
				{/* Two-column layout: User Info (left) + Frequency Scores (right) */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<UserDataCard
						responseId={response.id}
						firstName={response.firstName}
						lastName={response.lastName}
						email={response.email}
						licenseCode={response.licenseCode}
						licenseTier={response.licenseTier}
						onDataUpdated={refetchResponse}
					/>

					{response.frequencies &&
					Object.keys(response.frequencies).length > 0 ? (
						<Card>
							<CardHeader>
								<CardTitle>Frequency Scores</CardTitle>
							</CardHeader>
							<CardContent>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Frequency</TableHead>
											<TableHead className="text-right">Score</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{Object.entries(response.frequencies)
											.sort(([, scoreA], [, scoreB]) => {
												// Sort by score descending (highest first)
												if (scoreB !== scoreA)
													return (scoreB ?? 0) - (scoreA ?? 0)
												// Alphabetical tie-breaker for same scores
												return 0
											})
											.map(([frequencyName, score]) => {
												return (
													<TableRow key={frequencyName}>
														<TableCell className="font-medium">
															{frequencyName}
														</TableCell>
														<TableCell className="text-right">
															{score === null || score === undefined ? (
																<span className="text-muted-foreground">—</span>
															) : (
																<span className="tabular-nums">{score}</span>
															)}
														</TableCell>
													</TableRow>
												)
											})}
									</TableBody>
								</Table>
							</CardContent>
						</Card>
					) : (
						<Card>
							<CardHeader>
								<CardTitle>Frequency Scores</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground">
									No frequency data available
								</p>
							</CardContent>
						</Card>
					)}
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Select Tier for PDF/Email</CardTitle>
					</CardHeader>
					<CardContent>
						<Select
							value={selectedTier.toString()}
							onValueChange={(value) => setSelectedTier(Number(value))}
						>
							<SelectTrigger className="w-[200px] bg-card">
								<SelectValue placeholder="Select tier" />
							</SelectTrigger>
							<SelectContent className="dark bg-popover">
								<SelectItem value="1">Tier 1</SelectItem>
								<SelectItem value="3">Tier 3</SelectItem>
								<SelectItem value="7">Tier 7</SelectItem>
							</SelectContent>
						</Select>
					</CardContent>
				</Card>

				<div className="flex flex-col sm:flex-row gap-3">
					<Button
						onClick={handleDownloadPDF}
						disabled={isGeneratingPDF}
						className="flex-1"
					>
						{isGeneratingPDF ? (
							<LoadingSpinner size="sm" />
						) : (
							<>
								<Download className="mr-2 h-4 w-4" />
								Download PDF
							</>
						)}
					</Button>
					<Button
						onClick={handleResendEmail}
						disabled={isResendingEmail}
						variant="outline"
						className="flex-1"
					>
						{isResendingEmail ? (
							<LoadingSpinner size="sm" />
						) : (
							<>
								<Mail className="mr-2 h-4 w-4" />
								Resend Email
							</>
						)}
					</Button>
				</div>

				{/* Frequency Map displayed below buttons */}
				{getAllFrequenciesSorted(response).length === 7 && (
					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<CardTitle>Frequency Map</CardTitle>
							<Button
								onClick={handleDownloadFrequencyMap}
								disabled={isGeneratingMap}
								variant="outline"
								size="sm"
							>
								{isGeneratingMap ? (
									<LoadingSpinner size="sm" />
								) : (
									<>
										<Download className="mr-2 h-4 w-4" />
										Download
									</>
								)}
							</Button>
						</CardHeader>
						<CardContent className="flex justify-center">
							<FrequencyMap frequencies={getAllFrequenciesSorted(response)} />
						</CardContent>
					</Card>
				)}
			</main>
		</div>
	)
}
