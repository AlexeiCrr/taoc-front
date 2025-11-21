import { forwardRef } from 'react'
import type { ComponentPropsWithoutRef } from 'react'

export interface InputProps extends ComponentPropsWithoutRef<'input'> {
	error?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
	({ className = '', error = false, ...props }, ref) => {
		const baseStyles =
			'w-full px-4 py-2 rounded border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed'

		const errorStyles = error
			? 'border-red-500 focus-visible:ring-red-500'
			: 'border-gray-300 focus-visible:ring-[#4855c4] focus-visible:border-[#4855c4]'

		const bgStyles = props.disabled ? 'bg-gray-100' : 'bg-white'

		return (
			<input
				ref={ref}
				className={`${baseStyles} ${errorStyles} ${bgStyles} ${className}`}
				{...props}
			/>
		)
	}
)

Input.displayName = 'Input'

export default Input
