import { ArrowRight, Lock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { LicenseTier } from '../../services/licenseApi'
import { trackEvent } from '../../services/posthog'
import {
	createCheckoutSession,
	formatPrice,
	getAvailableUpgrades,
	getAvailableUpgradesAsync,
	type TierPricing,
} from '../../services/stripeService'
import LoadingSpinner from '../common/LoadingSpinner'
import { QuizButton } from '../quiz'
import { TierFeatureList } from './TierFeatureList'

// -------------------- Sub-component --------------------

interface OptionCardProps {
	tier: TierPricing
	variant: 'outlined' | 'filled'
	buttonLabel: string
	isLoading: boolean
	isDisabled: boolean
	centered?: boolean
	showBadge?: boolean
	onUpgrade: () => void
}

function OptionCard({
	tier,
	variant,
	buttonLabel,
	isLoading,
	isDisabled,
	centered = false,
	showBadge = false,
	onUpgrade,
}: OptionCardProps) {
	const isFilled = variant === 'filled'

	return (
		<div
			className={cn(
				'relative flex flex-col border p-6 transition-all duration-300',
				isFilled
					? 'bg-white border-main shadow-[0_4px_24px_rgba(94,97,83,0.10)]'
					: 'border-main/20 hover:border-main/40',
				showBadge && 'pt-8',
				isDisabled && 'opacity-40 pointer-events-none'
			)}
		>
			{showBadge && (
				<div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-main text-off-white text-[10px] font-bold px-4 py-1 uppercase tracking-widest font-family-helvetica whitespace-nowrap">
					Most Popular
				</div>
			)}

			<p
				className={cn(
					'text-xl text-main mb-2 uppercase tracking-wide',
					centered && 'text-center'
				)}
			>
				{tier.name}
			</p>

			<div className={cn('mb-5', centered && 'text-center mb-6')}>
				<span
					className={cn(
						'text-main tracking-tight text-3xl',
						centered && 'text-4xl'
					)}
				>
					{formatPrice(tier.price)}
				</span>
				<span className="text-main/40 ml-2 text-xs uppercase tracking-wider font-family-helvetica">
					one-time
				</span>
			</div>

			<div className={cn('h-px bg-main/10 mb-5', centered && 'mb-6')} />

			<TierFeatureList
				features={tier.features}
				className={centered ? 'mb-8' : 'mb-6'}
				iconColor="text-main/60"
			/>

			<QuizButton
				onClick={onUpgrade}
				disabled={isDisabled || isLoading}
				variant={isFilled ? 'primary' : 'primary-outline'}
				size={centered ? 'large' : 'medium'}
				className="w-full text-center mt-auto"
			>
				{isLoading ? (
					<span className="inline-flex items-center justify-center gap-2">
						<LoadingSpinner size="sm" />
						<span>Redirecting...</span>
					</span>
				) : (
					<span className="inline-flex items-center justify-center gap-2">
						<span>{buttonLabel}</span>
						<ArrowRight className="w-4 h-4" />
					</span>
				)}
			</QuizButton>
		</div>
	)
}

// -------------------- Main component --------------------

interface UpgradeCardProps {
	currentTier: LicenseTier
	email: string
	responseId: string
}

/**
 * Upsell component displayed on Results page after quiz completion.
 * Tier 7 is the hero option; tier 3 is an outlined secondary option.
 * Redirects to Stripe Checkout on upgrade selection.
 */
export function UpgradeCard({
	currentTier,
	email,
	responseId,
}: UpgradeCardProps) {
	const [isLoading, setIsLoading] = useState(false)
	const [selectedTier, setSelectedTier] = useState<number | null>(null)
	const [isDismissed, setIsDismissed] = useState(false)
	const [upgrades, setUpgrades] = useState<TierPricing[]>(() =>
		getAvailableUpgrades(currentTier)
	)

	// Fetch real Stripe prices on mount, replacing fallback values
	useEffect(() => {
		getAvailableUpgradesAsync(currentTier).then(setUpgrades)
	}, [currentTier])

	// Don't render if no upgrades available or user dismissed
	if (upgrades.length === 0 || isDismissed) {
		return null
	}

	const handleUpgrade = async (targetTier: LicenseTier) => {
		setIsLoading(true)
		setSelectedTier(targetTier)

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

	const tier7 = upgrades.find((t) => t.tier === 7)
	const tier3 = upgrades.find((t) => t.tier === 3)

	return (
		<div className="mt-12 w-full">
			{/* Decorative divider */}
			<div className="flex items-center gap-4 mb-8">
				<div className="flex-1 h-px bg-main/20" />
				<Lock className="w-4 h-4 text-main/40" />
				<div className="flex-1 h-px bg-main/20" />
			</div>

			{/* Headline */}
			<h2 className="text-center text-main uppercase tracking-wider mb-4">
				Your Primary Frequency Is Just the Surface.
			</h2>

			{/* Body copy */}
			<p className="text-center text-main/70 mb-10 font-family-helvetica text-sm max-w-lg mx-auto leading-relaxed">
				You know your strongest frequency. Now discover the patterns that drive
				your blind spots, your growth edge, and the way others actually
				experience you. Most people stop at their primary frequency. The real
				breakthroughs happen when you see the full map.
			</p>

			{/* Upgrade Options */}
			{tier3 && tier7 && (
				<div className="grid md:grid-cols-2 gap-5 mb-8">
					<OptionCard
						tier={tier3}
						variant="outlined"
						buttonLabel="See My Top 3"
						isLoading={isLoading && selectedTier === 3}
						isDisabled={isLoading && selectedTier !== 3}
						onUpgrade={() => handleUpgrade(tier3.tier)}
					/>
					<OptionCard
						tier={tier7}
						variant="filled"
						buttonLabel="Unlock All 7 Now"
						showBadge
						isLoading={isLoading && selectedTier === 7}
						isDisabled={isLoading && selectedTier !== 7}
						onUpgrade={() => handleUpgrade(tier7.tier)}
					/>
				</div>
			)}

			{!tier3 && tier7 && (
				<div className="max-w-md mx-auto mb-8">
					<OptionCard
						tier={tier7}
						variant="filled"
						buttonLabel="Unlock All 7 Now"
						showBadge
						centered
						isLoading={isLoading && selectedTier === 7}
						isDisabled={isLoading && selectedTier !== 7}
						onUpgrade={() => handleUpgrade(tier7.tier)}
					/>
				</div>
			)}

			{/* Trust Signals */}
			<div className="flex flex-wrap items-center justify-center gap-6 mb-6 text-xs text-main/40 uppercase tracking-widest font-family-helvetica">
				<span>Secure Payment</span>
				<span className="text-main/15">—</span>
				<span>Instant Access</span>
				<span className="text-main/15">—</span>
				<span>Lifetime Download</span>
			</div>

			{/* Continue with primary dismiss link */}
			<p className="text-center">
				<button
					onClick={() => setIsDismissed(true)}
					className="text-main/50 hover:text-main text-xs uppercase tracking-widest font-family-helvetica underline underline-offset-4 decoration-main/30 hover:decoration-main/50 transition-colors cursor-pointer"
				>
					Continue with Primary Only
				</button>
			</p>
		</div>
	)
}

export default UpgradeCard
