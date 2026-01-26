import { Check } from 'lucide-react'

interface TierFeatureListProps {
	features: string[]
	className?: string
	iconColor?: string
}

/**
 * Displays a list of tier features with checkmark icons.
 * Reusable across upgrade cards and success pages.
 */
export function TierFeatureList({
	features,
	className = '',
	iconColor = 'text-green-600',
}: TierFeatureListProps) {
	return (
		<ul className={`space-y-2 ${className}`}>
			{features.map((feature, index) => (
				<li key={index} className="flex items-start gap-2">
					<Check
						className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`}
						aria-hidden="true"
					/>
					<span className="text-sm text-main">{feature}</span>
				</li>
			))}
		</ul>
	)
}
