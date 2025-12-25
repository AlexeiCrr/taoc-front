import { create } from 'zustand'
import { adminApi } from '../services/api'
import type {
	AdminResponse,
	PaginatedAdminResponses,
	ResponseFilters,
	UpdateUserDataParams,
	StatisticsResponse,
} from '../types/admin.types'

interface AdminState {
	responses: AdminResponse[]
	filters: ResponseFilters
	pagination: {
		page: number
		pageSize: number
		total: number
		totalPages: number
	}
	isLoading: boolean
	error: string | null

	statistics: StatisticsResponse | null
	isLoadingStatistics: boolean
	statisticsError: string | null

	fetchResponses: (page?: number) => Promise<void>
	fetchStatistics: () => Promise<void>
	updateUserData: (params: UpdateUserDataParams) => Promise<void>
	setFilter: (filters: Partial<ResponseFilters>) => void
	clearFilters: () => void
}

const useAdminStore = create<AdminState>((set, get) => ({
	responses: [],
	filters: {},
	pagination: { page: 1, pageSize: 100, total: 0, totalPages: 0 },
	isLoading: false,
	error: null,
	statistics: null,
	isLoadingStatistics: false,
	statisticsError: null,

	// Decision Log: Server-side pagination over client-side (matches API design, keeps initial load fast)
	fetchResponses: async (page = 1) => {
		set({ isLoading: true, error: null })
		try {
			// Invariant: empty filter values omitted from API request
			const params = new URLSearchParams({ page: page.toString() })
			const { search, email, licenseCode, date } = get().filters

			if (search) params.append('name', search)
			if (email) params.append('email', email)
			if (licenseCode) params.append('licenseCode', licenseCode)
			if (date) params.append('date', date)

			const response = await adminApi
				.get(`responses?${params.toString()}`)
				.json<PaginatedAdminResponses>()

			// Validate response structure to prevent UI breakage from malformed API responses
			if (
				!response ||
				typeof response.page !== 'number' ||
				typeof response.pageSize !== 'number' ||
				typeof response.total !== 'number' ||
				typeof response.totalPages !== 'number' ||
				!Array.isArray(response.items)
			) {
				throw new Error('Invalid API response structure')
			}

			set({
				responses: response.items,
				pagination: {
					page: response.page,
					pageSize: response.pageSize,
					total: response.total,
					totalPages: response.totalPages,
				},
				isLoading: false,
			})
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to fetch responses'
			set({ error: errorMessage, isLoading: false })
			throw error
		}
	},

	updateUserData: async (params: UpdateUserDataParams) => {
		set({ isLoading: true, error: null })
		try {
			const { responseId, ...userData } = params
			await adminApi
				.put(`responses/${responseId}`, { json: userData })
				.json<AdminResponse>()

			set((state) => ({
				responses: state.responses.map((r) =>
					r.id === params.responseId ? { ...r, ...userData } : r
				),
				isLoading: false,
			}))
		} catch (error) {
			set({
				error:
					error instanceof Error ? error.message : 'Failed to update user data',
				isLoading: false,
			})
			throw error
		}
	},

	fetchStatistics: async () => {
		set({ isLoadingStatistics: true, statisticsError: null })
		try {
			const response = await adminApi
				.get('responses/statistics')
				.json<StatisticsResponse>()

			if (
				!response ||
				!Array.isArray(response.frequencyAverageScores) ||
				!Array.isArray(response.frequencyUserCounts) ||
				!response.timeSpentStatistics ||
				!Array.isArray(response.timeSpentStatistics.categories)
			) {
				throw new Error('Invalid statistics response structure')
			}

			set({
				statistics: response,
				isLoadingStatistics: false,
			})
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to fetch statistics'
			set({ statisticsError: errorMessage, isLoadingStatistics: false })
			throw error
		}
	},

	// Invariant: pagination resets to page 1 when filters change
	setFilter: (newFilters: Partial<ResponseFilters>) => {
		set((state) => ({
			filters: { ...state.filters, ...newFilters },
			pagination: { ...state.pagination, page: 1 },
		}))
	},

	clearFilters: () => {
		set({ filters: {}, pagination: { ...get().pagination, page: 1 } })
	},
}))

export default useAdminStore
