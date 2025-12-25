export const FREQUENCY_COLORS: Record<string, string> = {
	Motivator: '#E4892E',
	Maven: '#C7933A',
	Commander: '#BDBCC1',
	Challenger: '#B84C35',
	Healer: '#676652',
	Professor: '#9D8266',
	Seer: '#B6CEE8',
}

export const getFrequencyColor = (frequency: string): string => {
	return FREQUENCY_COLORS[frequency] || '#888888'
}

export const foregroundColor = 'var(--foreground)'
