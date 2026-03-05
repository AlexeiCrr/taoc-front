/**
 * Stripe checkout service for tier upgrades.
 *
 * Handles checkout session creation, upgrade status verification,
 * and dynamic pricing fetched from Stripe via the backend.
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

interface UpgradePriceResponse {
	currentTier: number
	targetTier: number
	amount: number
	currency: string
	name: string
}

// -------------------- Constants --------------------

/**
 * Tier feature/metadata configuration.
 * Prices are fetched from Stripe via the backend at runtime.
 * The `price` values here are fallbacks only.
 */
export const TIER_PRICING: Record<number, TierPricing> = {
	1: {
		tier: 1,
		name: 'Primary Frequency',
		price: 0,
		currency: 'USD',
		features: ['Your #1 frequency revealed', 'PDF report', 'Email delivery'],
	},
	3: {
		tier: 3,
		name: 'Top 3 Frequency Breakdown',
		price: 15,
		currency: 'USD',
		features: [
			'See your top 3 ranked frequencies',
			'Brief insights on your secondary strengths',
			'Add context to your primary result',
		],
	},
	7: {
		tier: 7,
		name: 'Unlock All 7 Frequencies',
		price: 90,
		currency: 'USD',
		features: [
			'All 7 frequencies ranked in order',
			'Full PDF workbook for all 7 frequencies',
			'Growth edge and development insights',
			'Lifetime access',
		],
	},
}

/**
 * Fallback upgrade prices used when the API is unavailable.
 * Key format: "currentTier-targetTier"
 */
const FALLBACK_UPGRADE_PRICES: Record<string, number> = {
	'1-3': 15,
	'1-7': 90,
	'3-7': 75,
}

// -------------------- Price Cache --------------------

let upgradePricesCache: Record<string, number> | null = null
let cachePromise: Promise<Record<string, number>> | null = null

/**
 * Fetches upgrade prices from the backend (which reads them from Stripe).
 * Results are cached for the lifetime of the page session.
 * Falls back to hardcoded prices on failure.
 */
export async function fetchUpgradePrices(): Promise<Record<string, number>> {
	if (upgradePricesCache) {
		return upgradePricesCache
	}

	// Deduplicate concurrent calls
	if (cachePromise) {
		return cachePromise
	}

	cachePromise = publicApi
		.get('checkout/prices')
		.json<UpgradePriceResponse[]>()
		.then((prices) => {
			const priceMap: Record<string, number> = {}
			for (const p of prices) {
				priceMap[`${p.currentTier}-${p.targetTier}`] = p.amount
			}
			upgradePricesCache = priceMap
			return priceMap
		})
		.catch((error) => {
			console.error('Failed to fetch upgrade prices, using fallbacks:', error)
			upgradePricesCache = FALLBACK_UPGRADE_PRICES
			return FALLBACK_UPGRADE_PRICES
		})
		.finally(() => {
			cachePromise = null
		})

	return cachePromise
}

// -------------------- API Functions --------------------

/**
 * Creates a Stripe Checkout session for tier upgrade.
 */
export async function createCheckoutSession(
	request: CheckoutSessionRequest
): Promise<CheckoutSessionResponse> {
	try {
		return await publicApi
			.post('checkout/create-session', { json: request })
			.json<CheckoutSessionResponse>()
	} catch (error) {
		console.error('Failed to create checkout session:', error)
		throw new Error('Unable to start checkout. Please try again.')
	}
}

/**
 * Checks upgrade status after payment.
 */
export async function getUpgradeStatus(
	sessionId: string
): Promise<SessionStatus> {
	try {
		return await publicApi
			.get(`checkout/status?session_id=${encodeURIComponent(sessionId)}`)
			.json<SessionStatus>()
	} catch (error) {
		console.error('Failed to get upgrade status:', error)
		throw new Error('Unable to verify upgrade status. Please try again.')
	}
}

// -------------------- Utility Functions --------------------

/**
 * Returns available upgrade options with Stripe prices.
 * Must be called with `await` since prices are fetched asynchronously.
 */
export async function getAvailableUpgradesAsync(
	currentTier: LicenseTier
): Promise<TierPricing[]> {
	const prices = await fetchUpgradePrices()

	const withUpgradePrice = (target: TierPricing): TierPricing => ({
		...target,
		price: prices[`${currentTier}-${target.tier}`] ?? target.price,
	})

	if (currentTier === 1) {
		return [withUpgradePrice(TIER_PRICING[3]), withUpgradePrice(TIER_PRICING[7])]
	} else if (currentTier === 3) {
		return [withUpgradePrice(TIER_PRICING[7])]
	}
	return []
}

/**
 * Synchronous version using cached/fallback prices.
 * Use getAvailableUpgradesAsync when possible.
 */
export function getAvailableUpgrades(currentTier: LicenseTier): TierPricing[] {
	const prices = upgradePricesCache ?? FALLBACK_UPGRADE_PRICES

	const withUpgradePrice = (target: TierPricing): TierPricing => ({
		...target,
		price: prices[`${currentTier}-${target.tier}`] ?? target.price,
	})

	if (currentTier === 1) {
		return [withUpgradePrice(TIER_PRICING[3]), withUpgradePrice(TIER_PRICING[7])]
	} else if (currentTier === 3) {
		return [withUpgradePrice(TIER_PRICING[7])]
	}
	return []
}

/**
 * Formats price for display.
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
 * Returns the upgrade price for a specific path.
 */
export function getUpgradePrice(
	currentTier: LicenseTier,
	targetTier: LicenseTier
): number {
	const prices = upgradePricesCache ?? FALLBACK_UPGRADE_PRICES
	return prices[`${currentTier}-${targetTier}`] ?? 0
}
