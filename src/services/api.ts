/**
 * HTTP API client and service methods for quiz operations.
 *
 * Provides a pre-configured Ky client:
 *   - publicApi: Unauthenticated endpoints (quiz questions, license validation)
 *
 * Key features:
 *   - Retry logic for transient failures (2 attempts, GET only)
 *   - 30s timeout
 */
import ky, { type KyInstance } from 'ky'
import type {
	EmailResultsResponse,
	Question,
	QuizResponse,
	QuizResponseCreate,
} from '../types/quiz.types'
import { toast } from 'sonner'

interface LicenseValidationResponse {
	isValid: boolean
	message: string
	usageInfo: {
		maxUses: number
		currentUses: number
		remainingUses: number
	}
}

const API_URL =
	import.meta.env.VITE_API_URL ||
	'https://i7ipyw6g26.execute-api.us-west-1.amazonaws.com/prod'
const API_KEY = import.meta.env.VITE_API_KEY

export const publicApi: KyInstance = ky.create({
	prefixUrl: API_URL,
	headers: {
		'Content-Type': 'application/json',
		...(API_KEY ? { 'x-api-key': API_KEY } : {}),
	},
	hooks: {
		beforeRequest: [
			(request) => {
				if (API_KEY) {
					request.headers.set('x-api-key', API_KEY)
					request.headers.set('Content-Type', 'application/json')
				} else {
					console.warn('⚠️ API_KEY not found in environment variables')
				}
			},
		],
		afterResponse: [
			async (_request, _options, response) => {
				if (response.status === 503) {
					toast.error(
						'Service temporarily unavailable. Please try again later.'
					)
				}

				if (!response.ok) {
					const error = (await response
						.json()
						.catch(() => ({ message: 'An error occurred' }))) as {
						message?: string
					}
					throw new Error(error.message || `HTTP ${response.status}`)
				}
			},
		],
	},
	retry: {
		limit: 2,
		methods: ['get'],
		statusCodes: [408, 413, 429, 500, 502, 503, 504],
	},
	timeout: 30000,
})

// Error handler helper
export const handleApiError = (error: unknown): string => {
	if (error instanceof Error) {
		return error.message
	}
	return 'An unexpected error occurred'
}

export const apiService = {
	getQuestions: async (locale: string = 'en'): Promise<Question[]> => {
		return await publicApi
			.get('questions', {
				searchParams: { locale },
			})
			.json()
	},

	submitQuizResponse: async (
		data: QuizResponseCreate
	): Promise<QuizResponse> => {
		return await publicApi.post('responses', { json: data }).json()
	},

	validateLicenseCode: async (code: string): Promise<boolean> => {
		try {
			const response = await publicApi
				.get('tac-get-code', {
					searchParams: { licenseCode: code },
				})
				.json<LicenseValidationResponse>()
			return response.isValid === true
		} catch {
			return false
		}
	},

	getResponseByToken: async (token: string): Promise<EmailResultsResponse> => {
		return await publicApi.get(`responses/by-token/${token}`).json()
	},
}

// Export API client for direct use if needed
export default publicApi
