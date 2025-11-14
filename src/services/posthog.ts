import posthog from 'posthog-js'

// Helper functions for PostHog tracking
export const trackEvent = (
	eventName: string,
	properties?: Record<string, unknown>
) => {
	if (posthog.__loaded) {
		posthog.capture(eventName, properties)
	}
}

export const identifyUser = (
	userId: string,
	properties?: Record<string, unknown>
) => {
	if (posthog.__loaded) {
		posthog.identify(userId, properties)
	}
}

export const resetUser = () => {
	if (posthog.__loaded) {
		posthog.reset()
	}
}

export const captureException = (
	error: Error,
	additionalProperties?: Record<string, unknown>
) => {
	if (posthog.__loaded) {
		posthog.capture('$exception', {
			$exception_message: error.message,
			$exception_type: error.name,
			$exception_stack_trace_raw: error.stack,
			...additionalProperties,
		})
	}
}

export { posthog }
