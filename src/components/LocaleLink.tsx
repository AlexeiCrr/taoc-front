import { Link, type LinkProps } from 'react-router-dom'
import { localizeHref } from '../paraglide/runtime'

type LocaleLinkProps = Omit<LinkProps, 'to'> & {
	to: string | { pathname: string; search?: string; hash?: string }
}

export default function LocaleLink({ to, ...props }: LocaleLinkProps) {
	const localizedTo =
		typeof to === 'string'
			? localizeHref(to)
			: { ...to, pathname: localizeHref(to.pathname) }

	return <Link to={localizedTo} {...props} />
}
