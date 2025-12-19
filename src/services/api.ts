import ky, { type KyInstance } from 'ky'
import type { AdminResponse, UpdateUserDataParams } from '../types/admin.types'
import type {
	Question,
	QuizResponse,
	QuizResponseCreate,
} from '../types/quiz.types'

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
	timeout: 30000, // 30 seconds
})

export const adminApi: KyInstance = ky.create({
	prefixUrl: API_URL,
	headers: {
		'Content-Type': 'application/json',
	},
	hooks: {
		beforeRequest: [
			(request) => {
				const token = localStorage.getItem('auth-token')
				if (token) {
					request.headers.set('Authorization', `Bearer ${token}`)
				}

				if (API_KEY) {
					request.headers.set('x-api-key', API_KEY)
				}
			},
		],
		afterResponse: [
			async (_request, _options, response) => {
				// Handle authentication errors
				if (response.status === 401) {
					localStorage.removeItem('auth-token')
					localStorage.removeItem('user')
					window.location.href = '/admin'
					throw new Error('Unauthorized - Please login again')
				}

				// Handle other API errors
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
	getQuestions: async (): Promise<Question[]> => {
		return await publicApi.get('questions').json()
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

	// Admin endpoints (using adminApi with JWT)
	getResponses: async (): Promise<AdminResponse[]> => {
		return await adminApi.get('responses').json()
	},

	getResponseById: async (id: number): Promise<AdminResponse> => {
		return await adminApi.get(`response/${id}`).json()
	},

	updateResponse: async (
		params: UpdateUserDataParams
	): Promise<AdminResponse> => {
		const { responseId, ...userData } = params
		return await adminApi
			.put(`response/${responseId}`, { json: userData })
			.json()
	},

	// resendEmail: async (responseId: number): Promise<ResendEmailResult> => {
	// 	const response = await adminApi
	// 		.post('send-response', { json: { responseId } })
	// 		.json<any>()
	// 	// Parse the body if it's a string (Lambda response format)
	// 	if (response.body && typeof response.body === 'string') {
	// 		return JSON.parse(response.body)
	// 	}
	// 	return response
	// },
}

// Export both API clients for direct use if needed
export default publicApi
