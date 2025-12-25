import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '../services/auth'
import type { User } from '../types/auth.types'

interface AuthState {
	user: User | null
	isAuthenticated: boolean
	isLoading: boolean
	error: string | null

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
				set({
					user: null,
					isAuthenticated: false,
					isLoading: true,
				})
				try {
					await authService.signOut()
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
					const user = await Promise.race([
						authService.getCurrentUser(),
						new Promise<null>((_, reject) =>
							setTimeout(
								() => reject(new Error('Authentication timeout')),
								5000
							)
						),
					])
					set({
						user,
						isAuthenticated: !!user,
						isLoading: false,
						error: null,
					})
				} catch (error) {
					set({
						user: null,
						isAuthenticated: false,
						isLoading: false,
						error:
							error instanceof Error
								? error.message
								: 'Authentication check failed',
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
			}),
			onRehydrateStorage: () => (state) => {
				if (state) {
					const token = localStorage.getItem('access-token')
					if (!token) {
						state.user = null
						state.isAuthenticated = false
						state.isLoading = false
					} else {
						// Token exists but don't assume it's valid
						// Let ProtectedRoute or Admin call checkAuth to verify
						state.isAuthenticated = false
						state.isLoading = false
					}
				}
			},
		}
	)
)

export default useAuthStore
