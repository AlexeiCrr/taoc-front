import { publicApi } from './api'

export interface LicenseValidationResponse {
	isValid: boolean
	message: string
	usageInfo?: {
		maxUses: number
		currentUses: number
		remainingUses: number
	}
}

export const validateLicenseCode = async (
	code: string
): Promise<LicenseValidationResponse> => {
	try {
		const response = await publicApi
			.get('tac-get-code', {
				searchParams: { licenseCode: code },
				timeout: 10000,
			})
			.json<LicenseValidationResponse>()

		return response
	} catch (error) {
		console.error('License validation error:', error)
		return {
			isValid: false,
			message: 'Error validating license code',
		}
	}
}
