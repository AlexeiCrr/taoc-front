import { identifyUser, posthog, trackEvent } from '../services/posthog'

export default function PostHogTest() {
	const handleTestEvent = () => {
		trackEvent('test_button_clicked', {
			timestamp: new Date().toISOString(),
			page: 'PostHogTest',
		})
		alert('Event sent! Check your PostHog dashboard.')
	}

	const handleIdentifyUser = () => {
		identifyUser('test-user-123', {
			email: 'test@example.com',
			name: 'Test User',
		})
		alert('User identified! Check your PostHog dashboard.')
	}

	const handleTestException = () => {
		try {
			// Intentionally throw an error to test exception capture
			throw new Error('Test exception from PostHog test page')
		} catch (error) {
			// PostHog will automatically capture this
			console.error('Test error:', error)
			alert('Exception thrown! Check your PostHog dashboard under "Exceptions".')
		}
	}

	const handleUncaughtException = () => {
		// This will be caught by PostHog's global error handler
		setTimeout(() => {
			throw new Error('Test uncaught exception')
		}, 100)
		alert('Uncaught exception will be thrown in 100ms. Check your PostHog dashboard.')
	}

	const checkPostHogStatus = () => {
		if (posthog.__loaded) {
			alert('✅ PostHog is loaded and ready!')
			console.log('PostHog Config:', {
				loaded: posthog.__loaded,
				apiKey: import.meta.env.VITE_PUBLIC_POSTHOG_KEY ? '✓ Set' : '✗ Not set',
				host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
			})
		} else {
			alert('❌ PostHog is not loaded. Check your API key in .env.local')
			console.log('PostHog Config:', {
				loaded: false,
				apiKey: import.meta.env.VITE_PUBLIC_POSTHOG_KEY || 'Not set',
				host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST || 'Not set',
			})
		}
	}

	return (
		<div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
			<div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
				<h1 className="text-2xl font-bold mb-6 text-center">
					PostHog Test Page
				</h1>

				<div className="space-y-4">
					<button
						onClick={checkPostHogStatus}
						className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition"
					>
						Check PostHog Status
					</button>

					<button
						onClick={handleTestEvent}
						className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition"
					>
						Send Test Event
					</button>

					<button
						onClick={handleIdentifyUser}
						className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg transition"
					>
						Identify Test User
					</button>

					<button
						onClick={handleTestException}
						className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition"
					>
						Test Exception Capture
					</button>

					<button
						onClick={handleUncaughtException}
						className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition"
					>
						Test Uncaught Exception
					</button>

					<div className="mt-6 p-4 bg-gray-50 rounded-lg">
						<h2 className="font-semibold mb-2">Instructions:</h2>
						<ol className="text-sm space-y-2 list-decimal list-inside">
							<li>
								Add your PostHog API key to <code>.env.local</code>
							</li>
							<li>Restart your dev server</li>
							<li>Click "Check PostHog Status"</li>
							<li>Click "Send Test Event"</li>
							<li>
								Check your PostHog dashboard at{' '}
								<a
									href="https://app.posthog.com"
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-500 hover:underline"
								>
									app.posthog.com
								</a>
							</li>
						</ol>
					</div>

					<div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
						<p className="text-sm text-yellow-800">
							<strong>Note:</strong> Events may take a few seconds to appear in
							your PostHog dashboard.
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}
