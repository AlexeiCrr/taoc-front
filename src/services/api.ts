import ky from 'ky'
import type {
	AdminResponse,
	ResendEmailResult,
	UpdateUserDataParams,
} from '../types/admin.types'
import type {
	Question,
	QuizResponse,
	QuizResponseCreate,
} from '../types/quiz.types'

const API_URL =
	import.meta.env.VITE_API_URL ||
	'https://i7ipyw6g26.execute-api.us-west-1.amazonaws.com/prod'

// Create ky instance with default configuration
const api = ky.create({
	prefixUrl: API_URL,
	headers: {
		'Content-Type': 'application/json',
	},
	hooks: {
		beforeRequest: [
			(request) => {
				// Add auth token if available
				const token = localStorage.getItem('auth-token')
				if (token) {
					request.headers.set('Authorization', `Bearer ${token}`)
				}
			},
		],
		afterResponse: [
			async (_request, _options, response) => {
				// Handle API errors
				if (!response.ok) {
					const error = await response
						.json()
						.catch(() => ({ message: 'An error occurred' }))
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

export const apiService = {
	// Quiz endpoints
	getQuestions: async (): Promise<Question[]> => {
		return await api.get('questions').json()
	},

	submitQuizResponse: async (
		data: QuizResponseCreate
	): Promise<QuizResponse> => {
		return await api.post('response', { json: data }).json()
	},

	// Admin endpoints
	getResponses: async (): Promise<AdminResponse[]> => {
		return await api.get('responses').json()
	},

	getResponseById: async (id: number): Promise<AdminResponse> => {
		return await api.get(`response/${id}`).json()
	},

	updateResponse: async (
		params: UpdateUserDataParams
	): Promise<AdminResponse> => {
		const { responseId, ...userData } = params
		return await api.put(`response/${responseId}`, { json: userData }).json()
	},

	resendEmail: async (responseId: number): Promise<ResendEmailResult> => {
		const response = await api
			.post('send-response', { json: { responseId } })
			.json<any>()
		// Parse the body if it's a string (Lambda response format)
		if (response.body && typeof response.body === 'string') {
			return JSON.parse(response.body)
		}
		return response
	},

	// License code endpoints (if needed)
	validateLicenseCode: async (code: string): Promise<boolean> => {
		try {
			const response = await api.get(`code/${code}`).json<any>()
			return response.valid === true
		} catch {
			return false
		}
	},
}

export default api
