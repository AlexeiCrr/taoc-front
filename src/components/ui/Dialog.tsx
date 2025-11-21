import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Cross2Icon } from '@radix-ui/react-icons'
import type { ComponentPropsWithoutRef } from 'react'

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogPortal = DialogPrimitive.Portal
export const DialogClose = DialogPrimitive.Close

export function DialogOverlay({
	className = '',
	...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>) {
	return (
		<DialogPrimitive.Overlay
			className={`fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 ${className}`}
			{...props}
		/>
	)
}

export function DialogContent({
	className = '',
	children,
	...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Content>) {
	return (
		<DialogPortal>
			<DialogOverlay />
			<DialogPrimitive.Content
				className={`fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-white rounded-lg shadow-lg p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] ${className}`}
				{...props}
			>
				{children}
				<DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:pointer-events-none">
					<Cross2Icon className="h-4 w-4" />
					<span className="sr-only">Close</span>
				</DialogPrimitive.Close>
			</DialogPrimitive.Content>
		</DialogPortal>
	)
}

export function DialogHeader({
	className = '',
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={`flex flex-col space-y-1.5 text-center sm:text-left mb-4 ${className}`}
			{...props}
		/>
	)
}

export function DialogTitle({
	className = '',
	...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
	return (
		<DialogPrimitive.Title
			className={`text-xl font-semibold leading-none tracking-tight ${className}`}
			{...props}
		/>
	)
}

export function DialogDescription({
	className = '',
	...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
	return (
		<DialogPrimitive.Description
			className={`text-sm text-gray-600 ${className}`}
			{...props}
		/>
	)
}

export function DialogFooter({
	className = '',
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6 ${className}`}
			{...props}
		/>
	)
}
