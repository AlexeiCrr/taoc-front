import { Outlet, useLocation } from 'react-router-dom'
import {
	setLocale,
	getLocale,
	isLocale,
	baseLocale,
} from '../paraglide/runtime'
import type { Locale } from '../paraglide/runtime'

export default function LocaleLayout() {
	const location = useLocation()

	// Detect locale from URL path: '/es/quiz' → 'es', '/quiz' → baseLocale
	const firstSegment = location.pathname.split('/')[1]
	const effectiveLocale: Locale =
		firstSegment && isLocale(firstSegment) ? firstSegment : baseLocale

	// Sync Paraglide locale (idempotent, safe during render)
	if (getLocale() !== effectiveLocale) {
		setLocale(effectiveLocale, { reload: false })
		localStorage.setItem('preferredLanguage', effectiveLocale)
	}

	return <Outlet />
}
