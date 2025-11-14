import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import posthog from 'posthog-js'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
	const location = useLocation()

	useEffect(() => {
		// Initialize PostHog
		if (import.meta.env.VITE_PUBLIC_POSTHOG_KEY && import.meta.env.VITE_PUBLIC_POSTHOG_HOST) {
			posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_KEY, {
				api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
				person_profiles: 'identified_only',
				capture_pageview: false, // We'll manually capture pageviews
				capture_pageleave: true,
				// Exception capture
				capture_exceptions: true,
				// Additional useful options
				session_recording: {
					recordCrossOriginIframes: false,
				},
			})
		}
	}, [])

	// Track page views
	useEffect(() => {
		if (posthog.__loaded) {
			posthog.capture('$pageview')
		}
	}, [location])

	return <>{children}</>
}
