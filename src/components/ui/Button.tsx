import { forwardRef } from 'react'
import type { ComponentPropsWithoutRef } from 'react'

export interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
	variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
	size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className = '', variant = 'primary', size = 'md', ...props }, ref) => {
		const baseStyles =
			'inline-flex items-center justify-center rounded font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'

		const variants = {
			primary: 'bg-[#4855c4] text-white hover:bg-[#3a46a8] focus-visible:ring-[#4855c4]',
			secondary: 'bg-[#5e6153] text-white hover:bg-[#4a4c40] focus-visible:ring-[#5e6153]',
			outline:
				'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-300',
			ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
			danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
		}

		const sizes = {
			sm: 'px-3 py-1.5 text-sm',
			md: 'px-4 py-2 text-base',
			lg: 'px-6 py-3 text-lg',
		}

		return (
			<button
				ref={ref}
				className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
				{...props}
			/>
		)
	}
)

Button.displayName = 'Button'

export default Button
