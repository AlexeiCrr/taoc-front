import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types/auth.types'

const getAuthService = async () => (await import('../services/auth')).authService

interface AuthState {
	user: User | null
	isAuthenticated: boolean
	isLoading: boolean
	error: string | null

	login: () => Promise<void>
	logout: () => Promise<void>
	checkAuth: () => Promise<void>
	clearError: () => void
}

const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			user: null,
			isAuthenticated: false,
			isLoading: false,
			error: null,

			login: async () => {
				set({ isLoading: true, error: null })
				try {
					const authService = await getAuthService()
					await authService.signIn()
					// redirecting
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
					set({ user, isAuthenticated: !!user })
				} catch {
					set({ user: null, isAuthenticated: false })
				}
			},

			clearError: () => set({ error: null }),
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
