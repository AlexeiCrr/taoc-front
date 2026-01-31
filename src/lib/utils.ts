import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export const LANGUAGE = {
	SPANISH: 'es',
	ENGLISH: 'en',
	PORTUGESE: 'pt',
} as const
