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
	return (
		import.meta.env.VITE_REDIRECT_SIGN_IN || `${window.location.origin}/admin`
	)
}

const REDIRECT_SIGN_IN = getRedirectUri()
const REDIRECT_SIGN_OUT =
	import.meta.env.VITE_REDIRECT_SIGN_OUT || `${window.location.origin}/admin`

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
			localStorage.removeItem('auth-token')
			localStorage.removeItem('access-token')
			localStorage.removeItem('refresh-token')
		}

		const logoutUrl =
			`https://${COGNITO_DOMAIN}/logout?` +
			`client_id=${poolData.ClientId}&` +
			`logout_uri=${encodeURIComponent(REDIRECT_SIGN_OUT)}`

		window.location.href = logoutUrl
	},

	getCurrentUser: async (): Promise<User | null> => {
		return new Promise((resolve) => {
			const cognitoUser = userPool.getCurrentUser()

			if (!cognitoUser) {
				resolve(null)
				return
			}

			cognitoUser.getSession(
				(err: Error | null, session: CognitoUserSession | null) => {
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

					// Update stored token
					localStorage.setItem('auth-token', session.getIdToken().getJwtToken())

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

			// Store tokens
			localStorage.setItem('auth-token', tokens.id_token)
			localStorage.setItem('access-token', tokens.access_token)
			localStorage.setItem('refresh-token', tokens.refresh_token)

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

	// Refresh session
	refreshSession: async (): Promise<boolean> => {
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

			// Update stored tokens
			localStorage.setItem('auth-token', tokens.id_token)
			localStorage.setItem('access-token', tokens.access_token)

			return true
		} catch {
			return false
		}
	},
}

export default authService
