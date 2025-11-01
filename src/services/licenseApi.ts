import { publicApi } from './api'

export const LicenseTier = {
	TIER_1: 1,
	TIER_3: 3,
	TIER_7: 7,
} as const

export type LicenseTier = (typeof LicenseTier)[keyof typeof LicenseTier]

export interface LicenseValidationResponse {
	isValid: boolean
	message: string
	licenseTier?: LicenseTier
	isError: boolean
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
			isError: true,
			message: 'Error validating license code',
		}
	}
}
