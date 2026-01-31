import { CrossCircledIcon } from '@radix-ui/react-icons'
import * as m from '../../paraglide/messages'

interface ErrorMessageProps {
	message: string
	onRetry?: () => void
	onDismiss?: () => void
}

export default function ErrorMessage({
	message,
	onRetry,
	onDismiss,
}: ErrorMessageProps) {
	return (
		<div className="bg-red-50 border border-red-200 rounded-lg p-4">
			<div className="flex items-start">
				<CrossCircledIcon className="w-5 h-5 text-red-400 mt-0.5" />
				<div className="ml-3 flex-1">
					<h3 className="text-sm font-medium text-red-800">
						{m['common.error']()}
					</h3>
					<p className="mt-1 text-sm text-red-700">{message}</p>
					<div className="mt-3 flex space-x-3">
						{onRetry && (
							<button
								onClick={onRetry}
								className="text-sm font-medium text-red-600 hover:text-red-500 transition-colors"
							>
								{m['common.tryAgain']()}
							</button>
						)}
						{onDismiss && (
							<button
								onClick={onDismiss}
								className="text-sm font-medium text-gray-600 hover:text-gray-500 transition-colors"
							>
								{m['common.dismiss']()}
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
