import type { ResourcesConfig } from 'aws-amplify'

const requiredEnvVars = {
	userPoolId: import.meta.env.VITE_USER_POOL_ID,
	userPoolClientId: import.meta.env.VITE_CLIENT_ID,
	redirectSignIn: import.meta.env.VITE_REDIRECT_SIGN_IN,
	redirectSignOut: import.meta.env.VITE_REDIRECT_SIGN_OUT,
}

// Validate all required env vars are present
Object.entries(requiredEnvVars).forEach(([key, value]) => {
	if (!value) {
		throw new Error(
			`Missing required environment variable for Cognito config: ${key}`
		)
	}
})

const cognitoConfig: ResourcesConfig = {
	Auth: {
		Cognito: {
			userPoolId: requiredEnvVars.userPoolId,
			userPoolClientId: requiredEnvVars.userPoolClientId,
			// identityPoolId is optional - only needed if accessing AWS services directly
			// ...(import.meta.env.VITE_IDENTITY_POOL_ID && { identityPoolId: import.meta.env.VITE_IDENTITY_POOL_ID }),
			loginWith: {
				oauth: {
					domain:
						import.meta.env.VITE_APP_WEB_DOMAIN ||
						'taoc.auth.us-west-1.amazoncognito.com',
					scopes: import.meta.env.VITE_TOKEN_SCOPES?.split(',').map(
						(s: string) => s.trim()
					) || ['openid', 'email', 'profile'],
					redirectSignIn: [requiredEnvVars.redirectSignIn],
					redirectSignOut: [requiredEnvVars.redirectSignOut],
					responseType: 'code',
				},
			},
		},
	},
}

export default cognitoConfig
