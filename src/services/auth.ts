import type { User } from '../types/auth.types'

const COGNITO_DOMAIN = import.meta.env.VITE_COGNITO_APP_WEB_DOMAIN as string
const CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID as string
const REDIRECT_SIGN_IN = import.meta.env
	.VITE_COGNITO_REDIRECT_SIGNIN as string
const REDIRECT_SIGN_OUT = import.meta.env
	.VITE_COGNITO_REDIRECT_SIGNOUT as string
const SCOPES = (import.meta.env.VITE_COGNITO_TOKEN_SCOPES as string) ||
	'openid email profile'

// PKCE helpers
const base64UrlEncode = (arrayBuffer: ArrayBuffer | Uint8Array) => {
	const bytes = arrayBuffer instanceof Uint8Array
		? arrayBuffer
		: new Uint8Array(arrayBuffer)
	let str = ''
	for (let i = 0; i < bytes.byteLength; i++) {
		str += String.fromCharCode(bytes[i])
	}
	return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const sha256 = async (plain: string) => {
	const encoder = new TextEncoder()
	const data = encoder.encode(plain)
	const hash = await crypto.subtle.digest('SHA-256', data)
	return base64UrlEncode(hash)
}

const generateCodeVerifier = () => {
	const array = new Uint8Array(32)
	crypto.getRandomValues(array)
	return base64UrlEncode(array)
}

const getStored = (key: string) => localStorage.getItem(key)
const setStored = (key: string, value: string) => localStorage.setItem(key, value)
const delStored = (key: string) => localStorage.removeItem(key)

export const authService = {
	// Start login using Cognito Hosted UI with PKCE
	signIn: async (): Promise<User> => {
		const codeVerifier = generateCodeVerifier()
		const codeChallenge = await sha256(codeVerifier)
		setStored('pkce_code_verifier', codeVerifier)

		const params = new URLSearchParams({
			client_id: CLIENT_ID,
			response_type: 'code',
			scope: SCOPES.split(/\s+/).join(' '),
			redirect_uri: REDIRECT_SIGN_IN,
			code_challenge_method: 'S256',
			code_challenge: codeChallenge,
		})
		window.location.href = `https://${COGNITO_DOMAIN}/oauth2/authorize?${params.toString()}`
		return Promise.resolve({} as User)
	},

	// Handle callback from Cognito after auth
	handleCallback: async (): Promise<User | null> => {
		const urlParams = new URLSearchParams(window.location.search)
		const code = urlParams.get('code')
		if (!code) return null

		const codeVerifier = getStored('pkce_code_verifier') || ''
		try {
			const body = new URLSearchParams({
				grant_type: 'authorization_code',
				client_id: CLIENT_ID,
				code,
				redirect_uri: REDIRECT_SIGN_IN,
				code_verifier: codeVerifier,
			})
			const resp = await fetch(`https://${COGNITO_DOMAIN}/oauth2/token`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body,
			})
			if (!resp.ok) throw new Error('Token exchange failed')
			const tokens = await resp.json()

			setStored('auth-token', tokens.id_token)
			setStored('access-token', tokens.access_token)
			if (tokens.refresh_token) setStored('refresh-token', tokens.refresh_token)
			delStored('pkce_code_verifier')

			const payload = JSON.parse(atob(tokens.id_token.split('.')[1]))
			const user: User = {
				username: payload['cognito:username'] || payload.sub,
				email: payload.email,
				attributes: payload,
			}
			window.history.replaceState({}, document.title, window.location.pathname)
			return user
		} catch (e) {
			console.error(e)
			return null
		}
	},

	getCurrentUser: async (): Promise<User | null> => {
		const idToken = getStored('auth-token')
		if (!idToken) return null
		try {
			const payload = JSON.parse(atob(idToken.split('.')[1]))
			return {
				username: payload['cognito:username'] || payload.sub,
				email: payload.email,
				attributes: payload,
			}
		} catch {
			return null
		}
	},

	refreshSession: async (): Promise<boolean> => {
		const refreshToken = getStored('refresh-token')
		if (!refreshToken) return false
		try {
			const resp = await fetch(`https://${COGNITO_DOMAIN}/oauth2/token`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: new URLSearchParams({
					grant_type: 'refresh_token',
					client_id: CLIENT_ID,
					refresh_token: refreshToken,
				}),
			})
			if (!resp.ok) return false
			const tokens = await resp.json()
			if (tokens.id_token) setStored('auth-token', tokens.id_token)
			if (tokens.access_token) setStored('access-token', tokens.access_token)
			return true
		} catch {
			return false
		}
	},

	signOut: async (): Promise<void> => {
		delStored('auth-token')
		delStored('access-token')
		delStored('refresh-token')
		const params = new URLSearchParams({
			client_id: CLIENT_ID,
			logout_uri: REDIRECT_SIGN_OUT,
		})
		window.location.href = `https://${COGNITO_DOMAIN}/logout?${params.toString()}`
	},
}

export default authService
