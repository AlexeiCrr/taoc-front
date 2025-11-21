import { create } from 'zustand'
import { apiService } from '../services/api'
import type {
	AdminResponse,
	ResponseFilters,
	UpdateUserDataParams,
	PaginatedResponse,
	StatisticsResponse,
} from '../types/admin.types'

interface AdminState {
	// State
	responses: AdminResponse[]
	selectedResponse: AdminResponse | null
	filters: ResponseFilters
	pagination: {
		page: number
		pageSize: number
		total: number
		totalPages: number
	}
	statistics: StatisticsResponse | null
	isLoading: boolean
	error: string | null

	// Actions
	fetchResponses: () => Promise<void>
	fetchResponseById: (id: number) => Promise<void>
	updateUserData: (params: UpdateUserDataParams) => Promise<void>
	resendEmail: (responseId: number) => Promise<void>
	exportCSV: () => Promise<void>
	fetchStatistics: () => Promise<void>
	setFilter: <K extends keyof ResponseFilters>(
		key: K,
		value: ResponseFilters[K]
	) => void
	setPage: (page: number) => void
	clearFilters: () => void
}

const useAdminStore = create<AdminState>((set, get) => ({
	// Initial state
	responses: [],
	selectedResponse: null,
	filters: {
		page: 1,
		name: undefined,
		email: undefined,
		licenseCode: undefined,
		date: undefined,
		dateFrom: undefined,
		dateTo: undefined,
	},
	pagination: {
		page: 1,
		pageSize: 100,
		total: 0,
		totalPages: 0,
	},
	statistics: null,
	isLoading: false,
	error: null,

	// Actions
	fetchResponses: async () => {
		set({ isLoading: true, error: null })
		try {
			const result: PaginatedResponse = await apiService.getResponses(
				get().filters
			)
			set({
				responses: result.items,
				pagination: {
					page: result.page,
					pageSize: result.pageSize,
					total: result.total,
					totalPages: result.totalPages,
				},
				isLoading: false,
			})
		} catch (error) {
			set({
				error:
					error instanceof Error ? error.message : 'Failed to fetch responses',
				isLoading: false,
			})
			throw error
		}
	},

	fetchResponseById: async (id: number) => {
		set({ isLoading: true, error: null })
		try {
			const response = await apiService.getResponseById(id)
			set({ selectedResponse: response, isLoading: false })
		} catch (error) {
			set({
				error:
					error instanceof Error ? error.message : 'Failed to fetch response',
				isLoading: false,
			})
			throw error
		}
	},

	updateUserData: async (params: UpdateUserDataParams) => {
		set({ isLoading: true, error: null })
		try {
			const updatedResponse = await apiService.updateResponse(params)

			// Update the response in the list
			set((state) => ({
				responses: state.responses.map((r) =>
					r.id === params.responseId ? { ...r, ...updatedResponse } : r
				),
				selectedResponse: updatedResponse,
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

	resendEmail: async (responseId: number) => {
		set({ isLoading: true, error: null })
		try {
			await apiService.resendEmail(responseId)
			set({ isLoading: false })
		} catch (error) {
			set({
				error:
					error instanceof Error ? error.message : 'Failed to resend email',
				isLoading: false,
			})
			throw error
		}
	},

	exportCSV: async () => {
		set({ isLoading: true, error: null })
		try {
			const blob = await apiService.exportCSV(get().filters)
			const url = window.URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = url
			a.download = `responses-${new Date().toISOString().split('T')[0]}.csv`
			document.body.appendChild(a)
			a.click()
			window.URL.revokeObjectURL(url)
			document.body.removeChild(a)
			set({ isLoading: false })
		} catch (error) {
			set({
				error:
					error instanceof Error ? error.message : 'Failed to export CSV',
				isLoading: false,
			})
			throw error
		}
	},

	fetchStatistics: async () => {
		set({ isLoading: true, error: null })
		try {
			const statistics = await apiService.getStatistics(get().filters)
			set({ statistics, isLoading: false })
		} catch (error) {
			set({
				error:
					error instanceof Error
						? error.message
						: 'Failed to fetch statistics',
				isLoading: false,
			})
			throw error
		}
	},

	setFilter: <K extends keyof ResponseFilters>(
		key: K,
		value: ResponseFilters[K]
	) => {
		set((state) => ({
			filters: {
				...state.filters,
				[key]: value,
				// Reset to page 1 when filters change
				page: key !== 'page' ? 1 : state.filters.page,
			},
		}))
	},

	setPage: (page: number) => {
		set((state) => ({
			filters: {
				...state.filters,
				page,
			},
		}))
	},

	clearFilters: () => {
		set({
			filters: {
				page: 1,
				name: undefined,
				email: undefined,
				licenseCode: undefined,
				date: undefined,
				dateFrom: undefined,
				dateTo: undefined,
			},
		})
	},
}))

export default useAdminStore
