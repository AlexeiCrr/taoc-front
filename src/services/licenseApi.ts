import ky from 'ky'

export interface LicenseValidationResponse {
	isValid: boolean
	message: string
	usageInfo?: {
		maxUses: number
		currentUses: number
		remainingUses: number
	}
}

const API_URL =
	import.meta.env.VITE_LICENSE_API_URL || 'http://localhost:4000/tac-get-code'

export const validateLicenseCode = async (
	code: string
): Promise<LicenseValidationResponse> => {
	try {
		const response = await ky
			.get(API_URL, {
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
