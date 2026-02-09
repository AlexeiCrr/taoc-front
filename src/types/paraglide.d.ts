/* eslint-disable */
// Type declarations for Paraglide messages

declare module '*/paraglide/messages' {
	type LocaleOptions = { locale?: 'en' | 'es' | 'fr' }

	// Export all message functions with bracket notation
	export const m: {
		// Main messages
		welcome: (inputs?: {}, options?: LocaleOptions) => string
		'quiz.start': (inputs?: {}, options?: LocaleOptions) => string
		'quiz.next': (inputs?: {}, options?: LocaleOptions) => string
		'quiz.previous': (inputs?: {}, options?: LocaleOptions) => string
		'quiz.submit': (inputs?: {}, options?: LocaleOptions) => string
		'quiz.question': (
			inputs: { number: any },
			options?: LocaleOptions
		) => string

		// Quiz greeting messages
		'quiz.greeting.title': (inputs?: {}, options?: LocaleOptions) => string
		'quiz.greeting.subtitle': (inputs?: {}, options?: LocaleOptions) => string
		'quiz.greeting.licenseCodePlaceholder': (
			inputs?: {},
			options?: LocaleOptions
		) => string
		'quiz.greeting.firstNamePlaceholder': (
			inputs?: {},
			options?: LocaleOptions
		) => string
		'quiz.greeting.lastNamePlaceholder': (
			inputs?: {},
			options?: LocaleOptions
		) => string
		'quiz.greeting.emailPlaceholder': (
			inputs?: {},
			options?: LocaleOptions
		) => string
		'quiz.greeting.agreeToEmail': (
			inputs?: {},
			options?: LocaleOptions
		) => string
		'quiz.greeting.startQuiz': (inputs?: {}, options?: LocaleOptions) => string

		// Validation messages
		'quiz.greeting.validation.licenseRequired': (
			inputs?: {},
			options?: LocaleOptions
		) => string
		'quiz.greeting.validation.licenseInvalid': (
			inputs?: {},
			options?: LocaleOptions
		) => string
		'quiz.greeting.validation.licenseLength': (
			inputs?: {},
			options?: LocaleOptions
		) => string
		'quiz.greeting.validation.licenseError': (
			inputs?: {},
			options?: LocaleOptions
		) => string
		'quiz.greeting.validation.firstNameRequired': (
			inputs?: {},
			options?: LocaleOptions
		) => string
		'quiz.greeting.validation.lastNameRequired': (
			inputs?: {},
			options?: LocaleOptions
		) => string
		'quiz.greeting.validation.emailRequired': (
			inputs?: {},
			options?: LocaleOptions
		) => string
		'quiz.greeting.validation.emailInvalid': (
			inputs?: {},
			options?: LocaleOptions
		) => string

		// Quiz results messages
		'quiz.results.title': (inputs?: {}, options?: LocaleOptions) => string
		'quiz.results.archetype': (inputs?: {}, options?: LocaleOptions) => string
		'quiz.results.download': (inputs?: {}, options?: LocaleOptions) => string

		// Navigation messages
		'navigation.home': (inputs?: {}, options?: LocaleOptions) => string
		'navigation.quiz': (inputs?: {}, options?: LocaleOptions) => string
		'navigation.about': (inputs?: {}, options?: LocaleOptions) => string
		'navigation.contact': (inputs?: {}, options?: LocaleOptions) => string

		// Common messages
		'common.loading': (inputs?: {}, options?: LocaleOptions) => string
		'common.error': (inputs?: {}, options?: LocaleOptions) => string
		'common.tryAgain': (inputs?: {}, options?: LocaleOptions) => string
	}
}

declare module '*/paraglide/runtime' {
	export type Locale = 'en' | 'es' | 'fr'

	export const locales: readonly Locale[]
	export const baseLocale: Locale

	export function getLocale(): Locale
	export function setLocale(
		locale: Locale,
		options?: { reload?: boolean }
	): void

	export function isLocale(value: any): value is Locale
	export function assertIsLocale(value: any): Locale
}
