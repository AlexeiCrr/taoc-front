import * as LabelPrimitive from '@radix-ui/react-label'
import { forwardRef } from 'react'
import type { ComponentPropsWithoutRef } from 'react'

export interface LabelProps
	extends ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
	required?: boolean
}

const Label = forwardRef<
	React.ElementRef<typeof LabelPrimitive.Root>,
	LabelProps
>(({ className = '', required = false, children, ...props }, ref) => {
	return (
		<LabelPrimitive.Root
			ref={ref}
			className={`block text-sm font-medium text-gray-700 mb-1 ${className}`}
			{...props}
		>
			{children}
			{required && <span className="text-red-500 ml-1">*</span>}
		</LabelPrimitive.Root>
	)
})

Label.displayName = 'Label'

export default Label
