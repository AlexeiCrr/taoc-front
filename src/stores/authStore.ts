import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types/auth.types'

// Lazy load auth service to avoid loading Cognito on app startup
const getAuthService = async () => {
	const { authService } = await import('../services/auth')
	return authService
}

interface AuthState {
	user: User | null
	isAuthenticated: boolean
	isLoading: boolean
	error: string | null

	// Actions
	login: () => Promise<void>
	logout: () => Promise<void>
	checkAuth: () => Promise<void>
	clearError: () => void
}

const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			// Initial state
			user: null,
			isAuthenticated: false,
			isLoading: false,
			error: null,

			// Actions
			login: async () => {
				set({ isLoading: true, error: null })
				try {
					const authService = await getAuthService()
					const user = await authService.signIn()
					set({
						user,
						isAuthenticated: true,
						isLoading: false,
					})
				} catch (error) {
					set({
						error: error instanceof Error ? error.message : 'Login failed',
						isLoading: false,
					})
					throw error
				}
			},

			logout: async () => {
				set({ isLoading: true })
				try {
					const authService = await getAuthService()
					await authService.signOut()
					set({
						user: null,
						isAuthenticated: false,
						isLoading: false,
					})
				} catch (error) {
					set({
						error: error instanceof Error ? error.message : 'Logout failed',
						isLoading: false,
					})
				}
			},

			checkAuth: async () => {
				try {
					const authService = await getAuthService()
					const user = await authService.getCurrentUser()
					set({
						user,
						isAuthenticated: !!user,
					})
				} catch {
					set({
						user: null,
						isAuthenticated: false,
					})
				}
			},

			clearError: () => {
				set({ error: null })
			},
		}),
		{
			name: 'auth-storage',
			partialize: (state) => ({
				user: state.user,
				isAuthenticated: state.isAuthenticated,
			}),
		}
	)
)

export default useAuthStore
