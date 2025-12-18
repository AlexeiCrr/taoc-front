interface ProgressBarProps {
	value: number
	max?: number
	showLabel?: boolean
	className?: string
}

export default function ProgressBar({
	value,
	max = 100,
	showLabel = false,
	className = '',
}: ProgressBarProps) {
	const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

	return (
		<div className={`w-full ${className}`}>
			{showLabel && (
				<div className="flex justify-between mb-2">
					<span className="text-sm font-medium text-gray-700">Progress</span>
					<span className="text-sm font-medium text-gray-700">
						{Math.round(percentage)}%
					</span>
				</div>
			)}
			<div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
				<div
					className="bg-main-500 h-full rounded-full transition-all duration-300 ease-out"
					style={{ width: `${percentage}%` }}
				>
					<div className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full animate-pulse"></div>
				</div>
			</div>
		</div>
	)
}
