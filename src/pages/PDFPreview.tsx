import { PDFViewer } from '@react-pdf/renderer'
import { ResultsPDF } from '../components/quiz/ResultsPDF'
import type { Frequency, QuizResponse } from '../types/quiz.types'

// All 7 frequencies with mock scores (sorted by score descending)
const allFrequenciesMock: Frequency[] = [
	{
		id: 1,
		name: 'Commander',
		value: 44,
		description:
			'When you communicate with this frequency, you transmit trust and provide direction to others. Commanders are authoritative, clear, and direct others with confidence to execute goals.',
	},
	{
		id: 2,
		name: 'Professor',
		value: 44,
		description:
			'When you communicate with this frequency, you transmit knowledge and assure competency in others. Professors are instructive, mentoring, and use data as the backbone for their worldview and ideas.',
	},
	{
		id: 3,
		name: 'Motivator',
		value: 42,
		description:
			'When you communicate with this frequency, you transmit energy and infuse self-belief in others. Motivators are positive, encouraging, and enthusiastic supporters of the dreams and goals of others.',
	},
	{
		id: 4,
		name: 'Challenger',
		value: 42,
		description:
			'When you communicate with this frequency, you transmit courage and awaken calling in others. Challengers are persuasive, dynamic, and unafraid of confrontation to achieve results.',
	},
	{
		id: 5,
		name: 'Seer',
		value: 37,
		description:
			'When you communicate with this frequency, you transmit vision and generate innovation in others. Seers are originative, pioneering, and direct the focus of others away from past achievements to future possibilities.',
	},
	{
		id: 6,
		name: 'Healer',
		value: 37,
		description:
			'When you communicate with this frequency, you transmit acceptance and extend wholeness to others. Healers are therapeutic, intentional, and capable of speaking into the wounding and brokenness in those around them.',
	},
	{
		id: 7,
		name: 'Maven',
		value: 33,
		description:
			'When you communicate with this frequency, you transmit a new reality and create paradigm shifts in others. Mavens are outliers and iconoclasts whose revolutionary worldviews can be seen by some as heretical or violating.',
	},
]

// Test data for previewing the PDF (top 3 frequencies for main content)
const mockQuizResponse: QuizResponse = {
	firstName: 'John',
	lastName: 'Doe',
	id: '123',
	createdOn: '12-12-2025',
	frequencies: allFrequenciesMock.slice(0, 3), // Top 3 for tier display
}

const PDFPreview = () => {
	return (
		<div style={{ width: '100vw', height: '100vh' }}>
			<div
				style={{
					padding: '20px',
					background: '#f5f5f5',
					borderBottom: '1px solid #ddd',
				}}
			>
				<h1 style={{ margin: 0, fontSize: '24px' }}>PDF Preview</h1>
				<p style={{ margin: '10px 0 0 0', color: '#666' }}>
					Testing with {mockQuizResponse.frequencies.length} frequencies (main
					page) + Frequency Map page (all 7)
				</p>
			</div>
			<PDFViewer style={{ width: '100%', height: 'calc(100% - 80px)' }}>
				<ResultsPDF quizResponse={mockQuizResponse} />
			</PDFViewer>
		</div>
	)
}

export default PDFPreview
