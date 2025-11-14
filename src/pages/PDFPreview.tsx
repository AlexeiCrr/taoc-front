import { PDFViewer } from '@react-pdf/renderer'
import { ResultsPDF } from '../components/quiz/ResultsPDF'
import type { QuizResponse } from '../types/quiz.types'

// Test data for previewing the PDF
const mockQuizResponse: QuizResponse = {
	firstName: 'John',
	lastName: 'Doe',
	id: '123',
	createdOn: '12-12-2025',
	frequencies: [
		{
			id: 1,
			name: 'Commander',
			value: 44,
			description:
				'Commanders are natural leaders who inspire action and drive results. They communicate with clarity, confidence, and decisiveness.',
		},
		{
			id: 2,
			name: 'Maven',
			value: 44,
			description:
				'Mavens are knowledge seekers and sharers who love to learn and educate others. They communicate with depth, detail, and expertise.',
		},
		{
			id: 3,
			name: 'Motivator',
			value: 43,
			description:
				'Motivators are energetic encouragers who inspire and uplift others. They communicate with enthusiasm, positivity, and passion.',
		},
	],
}

const PDFPreview = () => {
	// Change this to test different scenarios
	const testData = mockQuizResponse // or mockSingleFrequency or mockTwoFrequencies

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
					Testing with {testData.frequencies.length} frequenc
					{testData.frequencies.length === 1 ? 'y' : 'ies'}
				</p>
			</div>
			<PDFViewer style={{ width: '100%', height: 'calc(100% - 80px)' }}>
				<ResultsPDF quizResponse={testData} />
			</PDFViewer>
		</div>
	)
}

export default PDFPreview
