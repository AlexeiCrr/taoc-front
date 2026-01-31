import React, {
	createContext,
	useContext,
	useEffect,
	useState,
	type FC,
} from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
	locales,
	setLocale,
	isLocale,
	baseLocale,
	localizeHref,
	deLocalizeHref,
	type Locale,
} from '../paraglide/runtime'

type LanguageContextType = {
	currentLanguage: string
	changeLanguage: (lang: string) => void
	availableLanguages: readonly Locale[]
}

// eslint-disable-next-line react-refresh/only-export-components
export const LanguageContext = createContext<LanguageContextType | undefined>(
	undefined
)

/** Derive locale from a URL pathname: '/es/quiz' → 'es', '/quiz' → baseLocale */
function localeFromPath(pathname: string): Locale {
	const firstSegment = pathname.split('/')[1]
	return firstSegment && isLocale(firstSegment) ? firstSegment : baseLocale
}

export const LanguageProvider: FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const navigate = useNavigate()
	const location = useLocation()

	// Derive initial locale from URL so it's correct on first render / refresh
	const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
		const urlLocale = localeFromPath(location.pathname)
		setLocale(urlLocale, { reload: false })
		return urlLocale
	})

	// Keep state in sync when the URL changes (e.g. browser back/forward)
	useEffect(() => {
		const urlLocale = localeFromPath(location.pathname)
		if (urlLocale !== currentLanguage) {
			setLocale(urlLocale, { reload: false })
			setCurrentLanguage(urlLocale)
		}
	}, [location.pathname]) // eslint-disable-line react-hooks/exhaustive-deps

	const changeLanguage = (lang: string) => {
		if (!isLocale(lang)) return

		setLocale(lang, { reload: false })
		setCurrentLanguage(lang)
		localStorage.setItem('preferredLanguage', lang)

		const currentPathWithoutLocale = deLocalizeHref(location.pathname)
		let newPath = localizeHref(currentPathWithoutLocale, { locale: lang })
		// Strip trailing slash so '/es/' becomes '/es' (but keep bare '/')
		if (newPath.length > 1 && newPath.endsWith('/')) {
			newPath = newPath.slice(0, -1)
		}
		navigate(newPath + location.search, { replace: true })
	}

	return (
		<LanguageContext.Provider
			value={{
				currentLanguage,
				changeLanguage,
				availableLanguages: locales,
			}}
		>
			{children}
		</LanguageContext.Provider>
	)
}

// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => {
	const context = useContext(LanguageContext)
	if (!context) {
		throw new Error('useLanguage must be used within a LanguageProvider')
	}
	return context
}
