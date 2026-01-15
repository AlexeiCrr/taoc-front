import * as m from '@/paraglide/messages'
import type { AdminResponse } from '@/types/admin.types'
import type { Frequency, QuizResponse } from '@/types/quiz.types'

export interface ResponseDetailDto extends Omit<AdminResponse, 'answers'> {
	phoneNumber?: string | null
	country?: string | null
	answers?: Array<{
		id: number
		description: string
		value: number
		frequencyName: string
	}>
}

/**
 * Get frequency description from translations
 */
export function getFrequencyDescription(frequencyName: string): string {
	const key = `frequencies.${frequencyName}`
	// Type assertion needed for dynamic string key access to translation messages
	const messageFn = (m as unknown as Record<string, () => string>)[key]
	return typeof messageFn === 'function' ? messageFn() : ''
}

/**
 * Get all frequencies sorted by score (descending) for the frequency map.
 */
export function getAllFrequenciesSorted(data: ResponseDetailDto): Frequency[] {
	return Object.entries(data.frequencies)
		.filter(([, value]) => value !== null && value !== undefined)
		.map(([name, value]) => ({
			name,
			value: value as number,
			description: getFrequencyDescription(name),
			id: undefined,
		}))
		.sort((a, b) => {
			if (b.value !== a.value) return b.value - a.value
			return a.name.localeCompare(b.name)
		})
}

/**
 * Transform API response to ResultsPDF format with tier-based frequency filtering.
 *
 * Tier filtering enables admin use case: send tier-7 results to tier-1 user
 * for upgrade preview. Sorting ensures deterministic output for reproducible
 * PDFs in support scenarios.
 *
 * @param tier Number of top frequencies to include (1, 3, or 7)
 */
export function toQuizResponse(
	data: ResponseDetailDto,
	tier: number
): QuizResponse {
	const allFrequencies = getAllFrequenciesSorted(data)

	if (allFrequencies.length === 0) {
		throw new Error('No frequency data available for PDF generation')
	}

	const tierCutoffValue =
		allFrequencies[Math.min(tier - 1, allFrequencies.length - 1)].value
	const frequenciesArray = allFrequencies.filter(
		(freq) => freq.value >= tierCutoffValue
	)

	return {
		id: String(data.id),
		firstName: data.firstName,
		lastName: data.lastName,
		createdOn: data.createdOn,
		frequencies: frequenciesArray,
	}
}
