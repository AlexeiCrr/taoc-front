import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface QuizButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?:
		| 'primary'
		| 'primary-outline'
		| 'dark'
		| 'dark-outline'
		| 'light'
		| 'light-outline'
		| 'text'
	size?: 'small' | 'medium' | 'large'
	to?: string
	children: ReactNode
	newTab?: boolean
}

const QuizButton = ({
	variant = 'primary-outline',
	size = 'medium',
	to,
	children,
	newTab = false,
	className = '',
	disabled = false,
	...props
}: QuizButtonProps) => {
	const baseClasses =
		'inline-block transition-all duration-300 uppercase leading-none'

	const variantClasses = {
		// Primary green variants (using tailwind config colors)
		primary: 'bg-main text-off-white hover:bg-opacity-90',
		'primary-outline':
			'border-2 border-main text-main hover:bg-main hover:text-off-white',

		// Dark/Black variants
		dark: 'bg-black text-off-white hover:bg-opacity-90',
		text: 'text-off-white hover:bg-off-white/10',
		'dark-outline':
			'border-2 border-black text-black hover:bg-black hover:text-off-white',

		light: 'bg-off-white text-main hover:bg-main',
		'light-outline':
			'border border-off-white text-off-white hover:bg-off-white hover:text-main',
	}

	const sizeClasses = {
		small: 'px-4 py-2 text-xs',
		medium: 'px-6 py-3 text-sm',
		large: 'px-8 py-4 text-base',
	}

	const disabledClasses = disabled
		? 'opacity-60 hover:cursor-not-allowed pointer-events-none'
		: 'cursor-pointer'

	const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`

	if (to) {
		return (
			<Link
				to={to}
				className={combinedClasses}
				target={newTab ? '_blank' : '_self'}
			>
				{children}
			</Link>
		)
	}

	return (
		<button className={combinedClasses} {...props}>
			{children}
		</button>
	)
}

export default QuizButton
