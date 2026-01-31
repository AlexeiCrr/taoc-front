// Quiz related types
export interface Question {
	id: number
	description: string
	frequencyId: string
}

export interface Answer {
	questionId: number
	frequencyId: string | number
	value: number
}

export interface UserData {
	firstName: string
	lastName: string
	email: string
	licenseCode: string
	licenseTier?: number
	hasSubscribed?: boolean
	quizStartedAt?: string
	responseId?: number
	locale?: string
}

export interface Frequency {
	id: number
	name: string
	value: number
	description: string
}

export interface FrequencyMap {
	[key: string]: number
}

export interface QuizResponse {
	id: string
	firstName: string
	lastName: string
	createdOn: string
	frequencies: Frequency[]
}

export interface QuizResponseCreate {
	userData: UserData
	answers: Answer[]
}

export interface QuizResult {
	id: number
	firstName: string
	lastName: string
	email: string
	createdOn: string
	answers: Answer[]
	frequencies: Frequency[]
}
