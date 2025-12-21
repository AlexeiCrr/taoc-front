import UserDataCard from '@/components/admin/UserDataCard'
import LoadingSpinner from '@/components/common/LoadingSpinner'
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
import * as m from '@/paraglide/messages'
import { adminApi } from '@/services/api'
import { LicenseTier } from '@/services/licenseApi'
import type { AdminResponse } from '@/types/admin.types'
import type { Frequency, QuizResponse } from '@/types/quiz.types'
import { pdf } from '@react-pdf/renderer'
import { ChevronLeft, Download, Mail } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

interface ResponseDetailDto extends Omit<AdminResponse, 'answers'> {
	phoneNumber?: string | null
	country?: string | null
	answers?: Array<{
		id: number
		description: string
		value: number
		frequencyName: string
	}>
}

export default function ResponseDetail() {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()
	const [response, setResponse] = useState<ResponseDetailDto | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
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

	/**
	 * Get frequency description from translations
	 */
	const getFrequencyDescription = (frequencyName: string): string => {
		const key = `frequencies.${frequencyName}`
		// Type assertion needed for dynamic string key access to translation messages
		const messageFn = (m as unknown as Record<string, () => string>)[key]
		return typeof messageFn === 'function' ? messageFn() : ''
	}

	/**
	 * Transform API response to ResultsPDF format with tier-based frequency filtering.
	 *
	 * Tier filtering enables admin use case: send tier-7 results to tier-1 user
	 * for upgrade preview. Sorting ensures deterministic output for reproducible
	 * PDFs in support scenarios.
	 *
	 * @param tier Number of top frequencies to include (1, 3, or 7)
	 */
	const toQuizResponse = (
		data: ResponseDetailDto,
		tier: number
	): QuizResponse => {
		const allFrequencies: Frequency[] = Object.entries(data.frequencies)
			.filter(([_, value]) => value !== null && value !== undefined)
			.map(([name, value]) => ({
				name,
				value: value as number,
				description: getFrequencyDescription(name),
				id: undefined,
			}))
			.sort((a, b) => {
				if (b.value !== a.value) return b.value - a.value
				return a.name.localeCompare(b.name)
			})

		if (allFrequencies.length === 0) {
			throw new Error('No frequency data available for PDF generation')
		}

		const tierCutoffValue =
			allFrequencies[Math.min(tier - 1, allFrequencies.length - 1)].value
		const frequenciesArray = allFrequencies.filter(
			(freq) => freq.value >= tierCutoffValue
		)

		return {
			id: String(data.id),
			firstName: data.firstName,
			lastName: data.lastName,
			createdOn: data.createdOn,
			frequencies: frequenciesArray,
		}
	}

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
				<div className="max-w-4xl mx-auto flex px-4 sm:px-6 lg:px-8 py-4">
					<Link
						to="/dashboard"
						className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
					>
						<ChevronLeft className="mr-1 h-4 w-4" />
						Back to Dashboard
					</Link>
				</div>
			</header>

			<main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
				<UserDataCard
					responseId={response.id}
					firstName={response.firstName}
					lastName={response.lastName}
					email={response.email}
					licenseCode={response.licenseCode}
					licenseTier={response.licenseTier}
					onDataUpdated={refetchResponse}
				/>

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
			</main>
		</div>
	)
}
