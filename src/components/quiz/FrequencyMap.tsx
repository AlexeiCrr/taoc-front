import { forwardRef } from 'react'
import type { Frequency } from '../../types/quiz.types'
import { generateFrequencyMapHTML } from './frequencyMapTemplate'

interface FrequencyMapProps {
	frequencies: Frequency[] // Must be sorted by score descending, exactly 7 items
	className?: string
	userName?: string
}

export const FrequencyMap = forwardRef<HTMLDivElement, FrequencyMapProps>(
	({ frequencies, className, userName }, ref) => {
		if (frequencies.length !== 7) {
			return null
		}

		return (
			<div
				ref={ref}
				className={className}
				dangerouslySetInnerHTML={{
					__html: generateFrequencyMapHTML(frequencies, userName),
				}}
			/>
		)
	}
)

FrequencyMap.displayName = 'FrequencyMap'
