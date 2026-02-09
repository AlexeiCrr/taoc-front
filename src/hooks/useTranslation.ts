import * as m from '../paraglide/messages'

/**
 * Custom hook for using translations
 * This provides a convenient way to access all translation messages
 */
export const useTranslation = () => {
	return {
		t: m,
		// Add any additional translation utilities here
	}
}

export default useTranslation
