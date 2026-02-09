import { Component, type ErrorInfo, type ReactNode } from 'react'
import { trackEvent } from '../../services/posthog'
import { QuizButton } from '../quiz'

interface Props {
	children: ReactNode
	fallback?: ReactNode
}

interface State {
	hasError: boolean
	error: Error | null
}

export class PaymentErrorBoundary extends Component<Props, State> {
	state: State = { hasError: false, error: null }

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error }
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		trackEvent('payment_error_boundary', {
			error: error.message,
			componentStack: errorInfo.componentStack,
		})
		console.error('Payment flow error:', error, errorInfo)
	}

	handleRetry = () => {
		this.setState({ hasError: false, error: null })
	}

	render() {
		if (this.state.hasError) {
			return (
				this.props.fallback || (
					<div className="min-h-[200px] flex items-center justify-center bg-off-white p-4">
						<div className="max-w-md w-full bg-white rounded-lg p-8 text-center shadow-sm border border-gray-200">
							<h2 className="text-xl font-bold text-main mb-4">
								Something went wrong
							</h2>
							<p className="text-main mb-6">
								There was an error with the payment process. Your payment may
								still be processing.
							</p>
							<div className="space-y-3">
								<QuizButton
									onClick={this.handleRetry}
									variant="primary"
									className="w-full"
								>
									Try Again
								</QuizButton>
								<QuizButton
									onClick={() => (window.location.href = '/results')}
									variant="primary-outline"
									className="w-full"
								>
									Return to Results
								</QuizButton>
							</div>
						</div>
					</div>
				)
			)
		}

		return this.props.children
	}
}
