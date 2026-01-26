import { ArrowRight, Lock, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { LicenseTier } from '../../services/licenseApi'
import { trackEvent } from '../../services/posthog'
import {
	createCheckoutSession,
	formatPrice,
	getAvailableUpgrades,
	type TierPricing,
} from '../../services/stripeService'
import LoadingSpinner from '../common/LoadingSpinner'
import { QuizButton } from '../quiz'
import { TierFeatureList } from './TierFeatureList'

interface UpgradeCardProps {
	currentTier: LicenseTier
	email: string
	responseId: string
}

/**
 * Upsell component displayed on Results page after quiz completion.
 * Shows available tier upgrades with pricing and features.
 * Redirects to Stripe Checkout on upgrade selection.
 */
export function UpgradeCard({
	currentTier,
	email,
	responseId,
}: UpgradeCardProps) {
	const [isLoading, setIsLoading] = useState(false)
	const [selectedTier, setSelectedTier] = useState<number | null>(null)

	const availableUpgrades = getAvailableUpgrades(currentTier)

	// Don't render if no upgrades available (user is at tier 7)
	if (availableUpgrades.length === 0) {
		return null
	}

	const handleUpgrade = async (targetTier: LicenseTier) => {
		setIsLoading(true)
		setSelectedTier(targetTier)

		// Track analytics
		trackEvent('upgrade_clicked', {
			current_tier: currentTier,
			target_tier: targetTier,
			response_id: responseId,
		})

		try {
			const { url } = await createCheckoutSession({
				email,
				currentTier,
				targetTier,
				responseId,
			})

			// Redirect to Stripe Checkout
			window.location.href = url
		} catch (error) {
			console.error('Checkout error:', error)
			toast.error(
				error instanceof Error
					? error.message
					: 'Failed to start checkout. Please try again.'
			)
			setIsLoading(false)
			setSelectedTier(null)
		}
	}

	return (
		<div className="mt-10 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-200 shadow-sm">
			{/* Header */}
			<div className="flex items-center gap-2 mb-4">
				<Sparkles className="w-6 h-6 text-amber-600" />
				<h2 className="text-xl font-bold text-main uppercase tracking-wide">
					Unlock Your Complete Profile
				</h2>
			</div>

			<p className="text-main mb-6 font-family-helvetica">
				You're currently viewing your top frequency. Upgrade to see all 7
				Frequencies and get a comprehensive report.
			</p>

			{/* Locked Frequencies Preview */}
			<div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
				<div className="flex items-center gap-2 mb-3">
					<Lock className="w-4 h-4 text-gray-400" />
					<span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
						{currentTier === 1 ? '6 frequencies' : '4 frequencies'} locked
					</span>
				</div>
				<div className="space-y-2">
					{Array.from({
						length: currentTier === 1 ? 6 : 4,
					}).map((_, i) => (
						<div
							key={i}
							className="h-6 bg-gray-100 rounded opacity-60"
							style={{
								width: `${85 - i * 8}%`,
							}}
						/>
					))}
				</div>
			</div>

			{/* Upgrade Options */}
			<div
				className={`grid gap-4 mb-6 ${availableUpgrades.length > 1 ? 'md:grid-cols-2' : ''}`}
			>
				{availableUpgrades.map((tier) => (
					<UpgradeOption
						key={tier.tier}
						tier={tier}
						isLoading={isLoading && selectedTier === tier.tier}
						isDisabled={isLoading && selectedTier !== tier.tier}
						onUpgrade={() => handleUpgrade(tier.tier)}
						isRecommended={tier.tier === 7}
					/>
				))}
			</div>

			{/* Trust Signals */}
			<div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500 uppercase tracking-wide">
				<span>Secure Payment</span>
				<span className="text-gray-300">|</span>
				<span>Instant Access</span>
				<span className="text-gray-300">|</span>
				<span>Lifetime Download</span>
			</div>
		</div>
	)
}

// -------------------- Sub-component --------------------

interface UpgradeOptionProps {
	tier: TierPricing
	isLoading: boolean
	isDisabled: boolean
	isRecommended: boolean
	onUpgrade: () => void
}

function UpgradeOption({
	tier,
	isLoading,
	isDisabled,
	isRecommended,
	onUpgrade,
}: UpgradeOptionProps) {
	return (
		<div
			className={`
        relative rounded-lg p-5 border-2 transition-all
        ${
					isRecommended
						? 'border-main bg-white shadow-md'
						: 'border-gray-200 bg-white'
				}
        ${isDisabled ? 'opacity-50' : ''}
      `}
		>
			{/* Recommended Badge */}
			{isRecommended && (
				<div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-main text-off-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
					Most Popular
				</div>
			)}

			{/* Tier Name */}
			<h3 className="text-lg font-bold text-main mb-1 uppercase">
				{tier.name}
			</h3>

			{/* Price */}
			<div className="mb-4">
				<span className="text-3xl font-bold text-main">
					{formatPrice(tier.price)}
				</span>
				<span className="text-gray-500 ml-1 text-sm">one-time</span>
			</div>

			{/* Features */}
			<TierFeatureList
				features={tier.features}
				className="mb-5"
				iconColor={isRecommended ? 'text-main' : 'text-green-600'}
			/>

			{/* CTA Button */}
			<QuizButton
				onClick={onUpgrade}
				disabled={isDisabled || isLoading}
				variant={isRecommended ? 'primary' : 'primary-outline'}
				size="medium"
				className="w-full flex justify-center items-center gap-2"
			>
				{isLoading ? (
					<>
						<LoadingSpinner size="sm" />
						<span>Redirecting...</span>
					</>
				) : (
					<>
						<span>Upgrade Now</span>
						<ArrowRight className="w-4 h-4" />
					</>
				)}
			</QuizButton>
		</div>
	)
}

export default UpgradeCard
