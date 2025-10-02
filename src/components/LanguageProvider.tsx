import React, { createContext, useContext, useEffect, useState } from 'react'
import { getLocale, locales, setLocale } from '../paraglide/runtime'

type LanguageContextType = {
	currentLanguage: string
	changeLanguage: (lang: string) => void
	availableLanguages: readonly string[]
}

const LanguageContext = createContext<LanguageContextType | undefined>(
	undefined
)

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [currentLanguage, setCurrentLanguage] = useState(getLocale())

	useEffect(() => {
		// Get language from localStorage or browser preference
		const savedLang = localStorage.getItem('preferredLanguage')
		const browserLang = navigator.language.split('-')[0]

		const defaultLang =
			savedLang || (locales.includes(browserLang as any) ? browserLang : 'en')

		if (defaultLang !== currentLanguage) {
			changeLanguage(defaultLang)
		}
	}, [])

	const changeLanguage = (lang: string) => {
		if (locales.includes(lang as any)) {
			setLocale(lang as any, { reload: false })
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

export const useLanguage = () => {
	const context = useContext(LanguageContext)
	if (!context) {
		throw new Error('useLanguage must be used within a LanguageProvider')
	}
	return context
}
