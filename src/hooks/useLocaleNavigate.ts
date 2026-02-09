import { useNavigate, type NavigateOptions, type To } from 'react-router-dom'
import { localizeHref } from '../paraglide/runtime'

export function useLocaleNavigate() {
	const navigate = useNavigate()

	return (to: To | number, options?: NavigateOptions) => {
		if (typeof to === 'number') {
			return navigate(to)
		}

		if (typeof to === 'string') {
			return navigate(localizeHref(to), options)
		}

		// Object form: { pathname, search, hash }
		if (to.pathname) {
			return navigate({ ...to, pathname: localizeHref(to.pathname) }, options)
		}

		return navigate(to, options)
	}
}
