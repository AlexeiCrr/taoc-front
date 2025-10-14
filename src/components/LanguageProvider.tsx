import React, {
	createContext,
	useContext,
	useEffect,
	useState,
	type FC,
} from 'react'
import {
	getLocale,
	locales,
	setLocale,
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

export const LanguageProvider: FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [currentLanguage, setCurrentLanguage] = useState(getLocale())

	useEffect(() => {
		// Get language from localStorage or browser preference
		const savedLang = localStorage.getItem('preferredLanguage')
		const browserLang = navigator.language.split('-')[0]

		const isValidLocale = (lang: string): lang is Locale => {
			return locales.includes(lang as Locale)
		}

		const defaultLang =
			savedLang || (isValidLocale(browserLang) ? browserLang : 'en')

		if (defaultLang !== currentLanguage) {
			changeLanguage(defaultLang)
		}
	}, [])

	const changeLanguage = (lang: string) => {
		const isValidLocale = (lang: string): lang is Locale => {
			return locales.includes(lang as Locale)
		}

		if (isValidLocale(lang)) {
			setLocale(lang, { reload: false })
			setCurrentLanguage(lang)
			localStorage.setItem('preferredLanguage', lang)
			// Force re-render of the entire app
			window.location.reload()
		}
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
