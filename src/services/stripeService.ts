/**
 * Stripe checkout service for tier upgrades.
 *
 * Handles checkout session creation and upgrade status verification.
 * Uses publicApi client - no authentication required for checkout
 * (user identity is tied to quiz responseId and email).
 */
import { publicApi } from './api'
import type { LicenseTier } from './licenseApi'

// -------------------- Types --------------------

export interface CheckoutSessionRequest {
	email: string
	currentTier: LicenseTier
	targetTier: LicenseTier
	responseId: string
}

export interface CheckoutSessionResponse {
	sessionId: string
	url: string
}

export interface SessionStatus {
	status: 'completed' | 'pending' | 'failed'
	responseId?: string
	targetTier?: number
	completedAt?: string
	message?: string
}

export interface TierPricing {
	tier: LicenseTier
	name: string
	price: number
	currency: string
	features: string[]
}

// -------------------- Constants --------------------

/**
 * Tier pricing configuration.
 * Update prices here when Stripe products change.
 * These should match the prices configured in Stripe Dashboard.
 */
export const TIER_PRICING: Record<number, TierPricing> = {
	1: {
		tier: 1,
		name: 'Single Frequency',
		price: 0,
		currency: 'USD',
		features: [
			'Your #1 frequency revealed',
			'Basic PDF report',
			'Email delivery',
		],
	},
	3: {
		tier: 3,
		name: 'Top 3 Frequencies',
		price: 29,
		currency: 'USD',
		features: [
			'Your top 3 frequencies',
			'Detailed PDF report',
			'Frequency explanations',
			'Email support',
		],
	},
	7: {
		tier: 7,
		name: 'Complete Profile',
		price: 49,
		currency: 'USD',
		features: [
			'All 7 frequencies revealed',
			'Comprehensive PDF report',
			'Detailed analysis for each',
			'Action recommendations',
			'Priority support',
			'Lifetime access',
		],
	},
}

// -------------------- API Functions --------------------

/**
 * Creates a Stripe Checkout session for tier upgrade.
 *
 * Redirects user to Stripe-hosted checkout page.
 * Email is pre-filled from quiz submission.
 *
 * @param request - Checkout session parameters
 * @returns Promise with session ID and checkout URL
 * @throws Error if API call fails
 */
export async function createCheckoutSession(
	request: CheckoutSessionRequest
): Promise<CheckoutSessionResponse> {
	try {
		const response = await publicApi
			.post('checkout/create-session', {
				json: request,
			})
			.json<CheckoutSessionResponse>()

		return response
	} catch (error) {
		console.error('Failed to create checkout session:', error)
		throw new Error('Unable to start checkout. Please try again.')
	}
}

/**
 * Checks upgrade status after payment.
 *
 * Called on success page to verify payment completed.
 *
 * @param sessionId - Stripe session ID from URL params
 * @returns Promise with upgrade status
 */
export async function getUpgradeStatus(
	sessionId: string
): Promise<SessionStatus> {
	try {
		const response = await publicApi
			.get(`checkout/status?session_id=${encodeURIComponent(sessionId)}`)
			.json<SessionStatus>()

		return response
	} catch (error) {
		console.error('Failed to get upgrade status:', error)
		throw new Error('Unable to verify upgrade status. Please try again.')
	}
}

// -------------------- Utility Functions --------------------

/**
 * Returns available upgrade options based on current tier.
 *
 * @param currentTier - User's current license tier
 * @returns Array of available tier upgrades (empty if at tier 7)
 */
export function getAvailableUpgrades(currentTier: LicenseTier): TierPricing[] {
	if (currentTier === 1) {
		return [TIER_PRICING[3], TIER_PRICING[7]]
	} else if (currentTier === 3) {
		return [TIER_PRICING[7]]
	}
	return []
}

/**
 * Formats price for display.
 *
 * @param price - Numeric price
 * @param currency - Currency code (default: USD)
 * @returns Formatted price string (e.g., "$29.00")
 */
export function formatPrice(price: number, currency: string = 'USD'): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency,
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(price)
}

/**
 * Calculates upgrade price (difference between tiers).
 *
 * Useful for showing "pay the difference" pricing.
 *
 * @param currentTier - User's current tier
 * @param targetTier - Desired tier
 * @returns Price difference
 */
export function getUpgradePrice(
	currentTier: LicenseTier,
	targetTier: LicenseTier
): number {
	const currentPrice = TIER_PRICING[currentTier]?.price || 0
	const targetPrice = TIER_PRICING[targetTier]?.price || 0
	return Math.max(0, targetPrice - currentPrice)
}
