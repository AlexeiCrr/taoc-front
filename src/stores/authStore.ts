import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '../services/auth'
import type { User } from '../types/auth.types'

interface AuthState {
	user: User | null
	isAuthenticated: boolean
	isLoading: boolean
	error: string | null

	// Actions
	login: () => Promise<void>
	logout: () => Promise<void>
	checkAuth: () => Promise<void>
	handleCallback: () => Promise<void>
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
				set({ isLoading: true })
				try {
					const user = await authService.getCurrentUser()
					set({
						user,
						isAuthenticated: !!user,
						isLoading: false,
					})
				} catch {
					set({
						user: null,
						isAuthenticated: false,
						isLoading: false,
					})
				}
			},

			handleCallback: async () => {
				set({ isLoading: true, error: null })
				try {
					const user = await authService.handleCallback()
					if (user) {
						set({
							user,
							isAuthenticated: true,
							isLoading: false,
						})
					} else {
						set({ isLoading: false })
					}
				} catch (error) {
					set({
						error:
							error instanceof Error ? error.message : 'Authentication failed',
						isLoading: false,
						isAuthenticated: false,
						user: null,
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
