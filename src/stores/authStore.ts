import { create } from 'zustand'
import { authService } from '../services/authService'
import type { User } from '../types/auth.types'

interface AuthState {
	user: User | null
	isAuthenticated: boolean
	isLoading: boolean
	error: string | null

	initializeAuth: () => Promise<void>
	signIn: () => Promise<void>
	signOut: () => Promise<void>
	getAccessToken: () => Promise<string | null>
	clearError: () => void
}

const useAuthStore = create<AuthState>((set, get) => ({
	user: null,
	isAuthenticated: false,
	isLoading: true,
	error: null,

	/**
	 * Initialize auth state on app load
	 * Checks if user is authenticated and loads user data
	 */
	initializeAuth: async () => {
		set({ isLoading: true, error: null })
		try {
			const isAuthenticated = await authService.isAuthenticated()

			if (isAuthenticated) {
				const user = await authService.getUser()
				const isTokenValid = await authService.isTokenValid()

				if (user && isTokenValid) {
					set({ user, isAuthenticated: true, isLoading: false })
				} else {
					await get().signOut()
				}
			} else {
				set({ user: null, isAuthenticated: false, isLoading: false })
			}
		} catch (error) {
			console.error('Auth initialization error:', error)
			set({
				user: null,
				isAuthenticated: false,
				isLoading: false,
				error:
					error instanceof Error
						? error.message
						: 'Failed to initialize authentication',
			})
		}
	},

	/**
	 * Sign in with Cognito hosted UI
	 */
	signIn: async () => {
		set({ isLoading: true, error: null })
		try {
			await authService.signIn()
		} catch (error) {
			console.error('Sign in error:', error)
			set({
				isLoading: false,
				error: error instanceof Error ? error.message : 'Failed to sign in',
			})
		}
	},

	/**
	 * Sign out and clear auth state
	 */
	signOut: async () => {
		set({ isLoading: true, error: null })
		try {
			await authService.signOut()
			set({ user: null, isAuthenticated: false, isLoading: false })
		} catch (error) {
			console.error('Sign out error:', error)
			set({
				isLoading: false,
				error: error instanceof Error ? error.message : 'Failed to sign out',
			})
		}
	},

	/**
	 * Get access token for API requests
	 */
	getAccessToken: async () => {
		try {
			return await authService.getAccessToken()
		} catch (error) {
			console.error('Get access token error:', error)
			return null
		}
	},

	/**
	 * Clear error state
	 */
	clearError: () => {
		set({ error: null })
	},
}))

export default useAuthStore
