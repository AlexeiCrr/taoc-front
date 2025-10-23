interface LoadingSpinnerProps {
	message?: string
	size?: 'sm' | 'md' | 'lg'
}

export default function LoadingSpinner({
	message,
	size = 'md',
}: LoadingSpinnerProps) {
	const sizeClasses = {
		sm: 'w-5 h-5',
		md: 'w-10 h-10',
		lg: 'w-16 h-16',
	}

	return (
		<div className="flex flex-col items-center justify-center space-y-4">
			<div className={`${sizeClasses[size]} relative`}>
				<div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
				<div className="absolute inset-0 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
			</div>
			{message && (
				<p className="text-gray-600 text-sm font-medium animate-pulse">
					{message}
				</p>
			)}
		</div>
	)
}
