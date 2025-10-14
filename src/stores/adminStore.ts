import { create } from 'zustand'
import { apiService } from '../services/api'
import type {
	AdminResponse,
	ResponseFilters,
	UpdateUserDataParams,
} from '../types/admin.types'

interface AdminState {
	// State
	responses: AdminResponse[]
	selectedResponse: AdminResponse | null
	filters: ResponseFilters
	isLoading: boolean
	error: string | null

	// Actions
	fetchResponses: () => Promise<void>
	fetchResponseById: (id: number) => Promise<void>
	updateUserData: (params: UpdateUserDataParams) => Promise<void>
	// resendEmail: (responseId: number) => Promise<void>
	setFilter: <K extends keyof ResponseFilters>(
		key: K,
		value: ResponseFilters[K]
	) => void
	clearFilters: () => void

	// Computed
	getFilteredResponses: () => AdminResponse[]
}

const useAdminStore = create<AdminState>((set, get) => ({
	// Initial state
	responses: [],
	selectedResponse: null,
	filters: {
		search: '',
		dateRange: null,
		licenseCode: undefined,
	},
	isLoading: false,
	error: null,

	// Actions
	fetchResponses: async () => {
		set({ isLoading: true, error: null })
		try {
			const responses = await apiService.getResponses()
			set({ responses, isLoading: false })
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
					r.id === params.responseId ? { ...r, ...params } : r
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

	// resendEmail: async (responseId: number) => {
	// 	set({ isLoading: true, error: null })
	// 	try {
	// 		await apiService.resendEmail(responseId)
	// 		set({ isLoading: false })
	// 	} catch (error) {
	// 		set({
	// 			error:
	// 				error instanceof Error ? error.message : 'Failed to resend email',
	// 			isLoading: false,
	// 		})
	// 		throw error
	// 	}
	// },

	setFilter: <K extends keyof ResponseFilters>(
		key: K,
		value: ResponseFilters[K]
	) => {
		set((state) => ({
			filters: {
				...state.filters,
				[key]: value,
			},
		}))
	},

	clearFilters: () => {
		set({
			filters: {
				search: '',
				dateRange: null,
				licenseCode: undefined,
			},
		})
	},

	// Computed filtered responses
	getFilteredResponses: () => {
		const { responses, filters } = get()

		return responses.filter((response) => {
			// Search filter
			if (filters.search) {
				const searchLower = filters.search.toLowerCase()
				const matchesSearch =
					response.firstName.toLowerCase().includes(searchLower) ||
					response.lastName.toLowerCase().includes(searchLower) ||
					response.email.toLowerCase().includes(searchLower) ||
					response.licenseCode?.toLowerCase().includes(searchLower)

				if (!matchesSearch) return false
			}

			// Date range filter
			if (filters.dateRange) {
				const responseDate = new Date(response.createdOn)
				if (
					responseDate < filters.dateRange.start ||
					responseDate > filters.dateRange.end
				) {
					return false
				}
			}

			// License code filter
			if (filters.licenseCode !== undefined) {
				if (filters.licenseCode === '' && response.licenseCode) return false
				if (
					filters.licenseCode !== '' &&
					response.licenseCode !== filters.licenseCode
				)
					return false
			}

			return true
		})
	},
}))

export default useAdminStore
