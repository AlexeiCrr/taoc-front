import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
	signIn,
	confirmSignIn,
	signOut as amplifySignOut,
	getCurrentUser,
	fetchAuthSession,
	fetchUserAttributes,
} from '@aws-amplify/auth'
import { toast } from 'sonner'
import type { User } from '../types/auth.types'

interface AuthState {
	user: User | null
	isAuthenticated: boolean
	isLoading: boolean
	error: string | null
	isAdmin: boolean
	needsNewPassword: boolean
	pendingEmail: string | null
	sessionExpired: boolean
	accessToken: string | null
}

interface AuthActions {
	login: (email: string, password: string) => Promise<void>
	completeNewPassword: (newPassword: string) => Promise<void>
	signOut: () => Promise<void>
	checkAuth: () => Promise<void>
	getAccessToken: () => Promise<string | null>
	clearError: () => void
	handleSessionExpired: () => void
}

type AuthStore = AuthState & AuthActions

function decodeJwtPayload(token: string): Record<string, unknown> | null {
	try {
		const parts = token.split('.')
		if (parts.length !== 3) {
			return null
		}
		const payload = parts[1]
		const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
		return JSON.parse(decoded)
	} catch {
		return null
	}
}

async function fetchUserFromSession(
	fallbackEmail: string
): Promise<{ user: User; token: string | null; isAdmin: boolean }> {
	const session = await fetchAuthSession({ forceRefresh: true })
	const token = session.tokens?.accessToken?.toString() ?? null

	let isAdmin = false
	if (token) {
		const payload = decodeJwtPayload(token)
		if (payload) {
			const groups = payload['cognito:groups'] as string[] | undefined
			if (groups && Array.isArray(groups) && groups.includes('admins')) {
				isAdmin = true
			}
		}
	}

	const attributes = await fetchUserAttributes()

	const user: User = {
		username: attributes.email ?? fallbackEmail,
		email: attributes.email ?? fallbackEmail,
		attributes: {
			sub: attributes.sub ?? '',
			email: attributes.email ?? fallbackEmail,
			email_verified: attributes.email_verified === 'true',
		},
	}

	return { user, token, isAdmin }
}

async function clearStaleSession() {
	try {
		await amplifySignOut({ global: true })
	} catch {
		// Ignore errors
	}
}

const useAuthStore = create<AuthStore>()(
	persist(
		(set, get) => ({
			user: null,
			isAuthenticated: false,
			isLoading: true,
			error: null,
			isAdmin: false,
			needsNewPassword: false,
			pendingEmail: null,
			sessionExpired: false,
			accessToken: null,

			login: async (email: string, password: string) => {
				set({ isLoading: true, error: null })

				try {
					await clearStaleSession()

					const result = await signIn({ username: email, password })

					if (
						result.nextStep?.signInStep ===
						'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED'
					) {
						set({
							isLoading: false,
							needsNewPassword: true,
							pendingEmail: email,
							error: null,
						})
						return
					}

					const { user, token, isAdmin } = await fetchUserFromSession(email)

					set({
						isAuthenticated: true,
						user,
						accessToken: token,
						isAdmin,
						isLoading: false,
						error: null,
						needsNewPassword: false,
						pendingEmail: null,
						sessionExpired: false,
					})
				} catch (error) {
					let errorMessage = 'Login failed'
					if (error instanceof Error) {
						if (error.message.includes('revoked')) {
							errorMessage = 'Session expired. Please try again.'
						} else if (error.message.includes('NotAuthorizedException')) {
							errorMessage = 'Invalid email or password'
						} else {
							errorMessage = error.message
						}
					}
					set({
						isAuthenticated: false,
						user: null,
						accessToken: null,
						isAdmin: false,
						isLoading: false,
						error: errorMessage,
						needsNewPassword: false,
						pendingEmail: null,
					})
					throw error
				}
			},

			completeNewPassword: async (newPassword: string) => {
				set({ isLoading: true, error: null })

				try {
					await confirmSignIn({ challengeResponse: newPassword })

					const email = get().pendingEmail ?? ''
					const { user, token, isAdmin } = await fetchUserFromSession(email)

					set({
						isAuthenticated: true,
						user,
						accessToken: token,
						isAdmin,
						isLoading: false,
						error: null,
						needsNewPassword: false,
						pendingEmail: null,
						sessionExpired: false,
					})
				} catch (error) {
					const errorMessage =
						error instanceof Error
							? error.message
							: 'Failed to set new password'
					set({
						isLoading: false,
						error: errorMessage,
					})
					throw error
				}
			},

			signOut: async () => {
				try {
					await amplifySignOut({ global: true })
				} catch (error) {
					console.error('Sign out error:', error)
				} finally {
					set({
						isAuthenticated: false,
						user: null,
						accessToken: null,
						isAdmin: false,
						isLoading: false,
						error: null,
						needsNewPassword: false,
						pendingEmail: null,
						sessionExpired: false,
					})
				}
			},

			checkAuth: async () => {
				try {
					const currentUser = await getCurrentUser()

					if (currentUser) {
						const { user, token, isAdmin } =
							await fetchUserFromSession(currentUser.username)

						set({
							isAuthenticated: true,
							user,
							accessToken: token,
							isAdmin,
							isLoading: false,
						})
					} else {
						set({
							isAuthenticated: false,
							user: null,
							accessToken: null,
							isAdmin: false,
							isLoading: false,
						})
					}
				} catch (error) {
					const errorMessage = error instanceof Error ? error.message : ''
					if (
						errorMessage.includes('revoked') ||
						errorMessage.includes('NotAuthorizedException')
					) {
						try {
							await amplifySignOut({ global: true })
						} catch {
							// Ignore
						}
					}
					set({
						isAuthenticated: false,
						user: null,
						accessToken: null,
						isAdmin: false,
						isLoading: false,
					})
				}
			},

			getAccessToken: async () => {
				try {
					const session = await fetchAuthSession()
					return session.tokens?.accessToken?.toString() || null
				} catch (error) {
					console.error('Get access token error:', error)
					return null
				}
			},

			clearError: () => {
				set({ error: null })
			},

			handleSessionExpired: () => {
				if (get().sessionExpired) {
					return
				}

				set({ sessionExpired: true })

				toast.error('Your session has expired. Redirecting to login...')

				setTimeout(() => {
					get().signOut()
				}, 3000)
			},
		}),
		{
			name: 'taoc-front-auth',
			partialize: (state) => ({
				accessToken: state.accessToken,
				user: state.user,
				isAuthenticated: state.isAuthenticated,
				isAdmin: state.isAdmin,
			}),
			onRehydrateStorage: () => (state) => {
				if (state) {
					state.isLoading = false
				}
			},
		}
	)
)

export default useAuthStore
