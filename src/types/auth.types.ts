// Authentication related types
export interface User {
	username: string
	email: string
	attributes?: UserAttributes
}

export interface UserAttributes {
	sub: string
	email: string
	email_verified: boolean
	[key: string]: unknown
}

export interface CognitoIdTokenPayload {
	sub: string
	email: string
	email_verified?: boolean
	'cognito:username'?: string
	exp?: number
	iat?: number
	[key: string]: unknown
}

export interface AuthState {
	user: User | null
	isAuthenticated: boolean
	isLoading: boolean
}

export interface CognitoConfig {
	userPoolId: string
	clientId: string
	identityPoolId: string
	region: string
	domain: string
	redirectSignIn: string
	redirectSignOut: string
}
