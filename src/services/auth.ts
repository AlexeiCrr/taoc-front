import {
	AuthenticationDetails,
	CognitoUser,
	CognitoUserPool,
	CognitoUserSession,
} from 'amazon-cognito-identity-js'
import type { CognitoIdTokenPayload, User } from '../types/auth.types'

// Cognito configuration
const poolData = {
	UserPoolId: import.meta.env.VITE_USER_POOL_ID || 'us-west-1_2sHchLZDR',
	ClientId: import.meta.env.VITE_CLIENT_ID || '1to5504c05956ijk9g16jpkoio',
}

const userPool = new CognitoUserPool(poolData)

const COGNITO_DOMAIN =
	import.meta.env.VITE_APP_WEB_DOMAIN || 'taoc.auth.us-west-1.amazoncognito.com'

const getRedirectUri = () => {
	if (import.meta.env.VITE_REDIRECT_SIGN_IN) {
		return import.meta.env.VITE_REDIRECT_SIGN_IN
	}

	// Force HTTPS in production (CloudFront terminates SSL, so window.location may be HTTP)
	const protocol =
		window.location.hostname === 'localhost'
			? window.location.protocol
			: 'https:'
	return `${protocol}//${window.location.host}/admin`
}

const REDIRECT_SIGN_IN = getRedirectUri()
const REDIRECT_SIGN_OUT =
	import.meta.env.VITE_REDIRECT_SIGN_OUT || REDIRECT_SIGN_IN

let refreshPromise: Promise<boolean> | null = null

// Helper function to check if a token is still valid
export const isTokenAlive = (token: string): boolean => {
	if (!token) return false

	try {
		const payload = JSON.parse(
			atob(token.split('.')[1])
		) as CognitoIdTokenPayload
		const now = Math.floor(Date.now() / 1000)
		return payload.exp ? payload.exp > now : false
	} catch {
		return false
	}
}

export const clearTokens = () => {
	localStorage.removeItem('auth-token')
	localStorage.removeItem('access-token')
	localStorage.removeItem('refresh-token')
	localStorage.removeItem('user')
}

export const authService = {
	signIn: async (): Promise<User> => {
		const authUrl =
			`https://${COGNITO_DOMAIN}/login?` +
			`client_id=${poolData.ClientId}&` +
			`response_type=code&` +
			`scope=openid+email+profile&` +
			`redirect_uri=${encodeURIComponent(REDIRECT_SIGN_IN)}`

		window.location.href = authUrl

		return Promise.resolve({} as User)
	},

	signInWithCredentials: async (
		username: string,
		password: string
	): Promise<User> => {
		return new Promise((resolve, reject) => {
			const authenticationDetails = new AuthenticationDetails({
				Username: username,
				Password: password,
			})

			const cognitoUser = new CognitoUser({
				Username: username,
				Pool: userPool,
			})

			cognitoUser.authenticateUser(authenticationDetails, {
				onSuccess: (session: CognitoUserSession) => {
					const idToken = session.getIdToken()
					const payload = idToken.payload as CognitoIdTokenPayload
					const user: User = {
						username: payload['cognito:username'] || payload.sub,
						email: payload.email,
						attributes: {
							...payload,
							email_verified: payload.email_verified ?? false,
						},
					}

					localStorage.setItem('auth-token', session.getIdToken().getJwtToken())

					resolve(user)
				},
				onFailure: (err) => {
					reject(err)
				},
			})
		})
	},

	signOut: async (): Promise<void> => {
		const cognitoUser = userPool.getCurrentUser()

		if (cognitoUser) {
			cognitoUser.signOut()
			clearTokens()
		}

		const logoutUrl =
			`https://${COGNITO_DOMAIN}/logout?` +
			`client_id=${poolData.ClientId}&` +
			`logout_uri=${encodeURIComponent(REDIRECT_SIGN_OUT)}`

		window.location.href = logoutUrl
	},

	getCurrentUser: async (): Promise<User | null> => {
		// First check if we have OAuth tokens (from hosted UI login)
		const idToken = localStorage.getItem('auth-token')
		const accessToken = localStorage.getItem('access-token')

		if (idToken && accessToken) {
			// Check if token is still valid
			if (!isTokenAlive(idToken)) {
				// Token expired, return null to trigger refresh or re-login
				return null
			}

			try {
				// Decode the ID token to get user info
				const payload = JSON.parse(
					atob(idToken.split('.')[1])
				) as CognitoIdTokenPayload

				return {
					username: payload['cognito:username'] || payload.sub,
					email: payload.email,
					attributes: {
						...payload,
						email_verified: payload.email_verified ?? false,
					},
				}
			} catch (error) {
				console.error('Failed to decode token:', error)
				// Fall through to try Cognito SDK session
			}
		}

		// Fallback to Cognito SDK session (for username/password login)
		return new Promise((resolve, reject) => {
			const cognitoUser = userPool.getCurrentUser()

			if (!cognitoUser) {
				resolve(null)
				return
			}

			// timeout protection
			const timeoutId = setTimeout(() => {
				reject(new Error('Get session timeout'))
			}, 5000)

			cognitoUser.getSession(
				(err: Error | null, session: CognitoUserSession | null) => {
					clearTimeout(timeoutId)

					if (err || !session || !session.isValid()) {
						resolve(null)
						return
					}

					const idToken = session.getIdToken()
					const payload = idToken.payload as CognitoIdTokenPayload
					const user: User = {
						username: payload['cognito:username'] || payload.sub,
						email: payload.email,
						attributes: {
							...payload,
							email_verified: payload.email_verified ?? false,
						},
					}

					try {
						localStorage.setItem(
							'auth-token',
							session.getIdToken().getJwtToken()
						)
					} catch (storageError) {
						console.warn('Failed to persist token:', storageError)
					}

					resolve(user)
				}
			)
		})
	},

	handleCallback: async (): Promise<User | null> => {
		const urlParams = new URLSearchParams(window.location.search)
		const code = urlParams.get('code')

		if (!code) {
			return null
		}

		// Exchange code for tokens
		try {
			const response = await fetch(`https://${COGNITO_DOMAIN}/oauth2/token`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams({
					grant_type: 'authorization_code',
					client_id: poolData.ClientId,
					code: code,
					redirect_uri: REDIRECT_SIGN_IN,
				}),
			})

			if (!response.ok) {
				throw new Error('Failed to exchange code for tokens')
			}

			const tokens = await response.json()

			try {
				localStorage.setItem('auth-token', tokens.id_token)
				localStorage.setItem('access-token', tokens.access_token)
				localStorage.setItem('refresh-token', tokens.refresh_token)
			} catch (storageError) {
				console.error('Failed to persist tokens:', storageError)
				throw new Error(
					'Storage quota exceeded - cannot persist authentication'
				)
			}

			// Decode ID token to get user info
			const payload = JSON.parse(
				atob(tokens.id_token.split('.')[1])
			) as CognitoIdTokenPayload

			const user: User = {
				username: payload['cognito:username'] || payload.sub,
				email: payload.email,
				attributes: {
					...payload,
					email_verified: payload.email_verified ?? false,
				},
			}

			// Clear the code from URL
			window.history.replaceState({}, document.title, window.location.pathname)

			return user
		} catch (error) {
			console.error('Error handling OAuth callback:', error)
			return null
		}
	},

	// Refresh session with mutex to prevent concurrent refreshes
	refreshSession: async (): Promise<boolean> => {
		// If refresh is already in progress, return the existing promise
		if (refreshPromise) {
			return refreshPromise
		}

		// Check if current token is still valid - no need to refresh
		const currentIdToken = localStorage.getItem('auth-token')
		if (currentIdToken && isTokenAlive(currentIdToken)) {
			return true
		}

		// Start new refresh
		refreshPromise = (async () => {
			const refreshToken = localStorage.getItem('refresh-token')

			if (!refreshToken) {
				return false
			}

			try {
				const response = await fetch(`https://${COGNITO_DOMAIN}/oauth2/token`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
					body: new URLSearchParams({
						grant_type: 'refresh_token',
						client_id: poolData.ClientId,
						refresh_token: refreshToken,
					}),
				})

				if (!response.ok) {
					return false
				}

				const tokens = await response.json()

				// Update stored tokens with error handling
				try {
					localStorage.setItem('auth-token', tokens.id_token)
					localStorage.setItem('access-token', tokens.access_token)
					// Note: AWS Cognito refresh doesn't return a new refresh token
					// unless rotation is enabled, so we keep the existing one
				} catch (storageError) {
					console.warn('Failed to persist refreshed tokens:', storageError)
					return false
				}

				return true
			} catch {
				return false
			}
		})().finally(() => {
			refreshPromise = null
		})

		return refreshPromise
	},
}

export default authService
