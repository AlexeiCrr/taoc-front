import {
	Document,
	Image,
	Link,
	Page,
	StyleSheet,
	Text,
	View,
} from '@react-pdf/renderer'
import type { QuizResponse } from '../../types/quiz.types'
import * as m from '../../paraglide/messages'
import { getLocale } from '../../paraglide/runtime'

// Create styles
const styles = StyleSheet.create({
	page: {
		padding: 15,
		fontFamily: 'Helvetica',
		color: '#5e6153',
		fontSize: 16,
	},
	container: {
		maxWidth: 600,
		margin: '0 auto',
	},
	greeting: {
		fontSize: 16,
		lineHeight: 2,
		marginTop: 0,
		fontWeight: 400,
		marginBottom: 0,
		textAlign: 'left',
	},
	resultsIntro: {
		fontSize: 16,
		textAlign: 'left',
		lineHeight: 1.4,
		fontWeight: 400,
		marginTop: 10,
		marginBottom: 20,
	},
	bold: {
		fontWeight: 'bold',
	},
	frequenciesGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'flex-start',
		marginBottom: 60,
	},
	frequencyItem: {
		width: '33.33%',
		marginBottom: 20,
		alignItems: 'center',
	},
	frequencyImage: {
		width: 120,
		height: 120,
		marginBottom: 10,
	},
	frequencyName: {
		textTransform: 'uppercase',
		marginBottom: 10,
		fontSize: 14,
	},
	frequencyNumber: {
		color: '#5e6153',
		fontSize: 32,
		fontWeight: 'bold',
		textTransform: 'uppercase',
	},
	descriptionsSection: {
		marginTop: 20,
	},
	descriptionItem: {
		marginBottom: 20,
	},
	descriptionTitle: {
		marginBottom: 5,
		textTransform: 'uppercase',
		fontWeight: 'bold',
		fontStyle: 'italic',
		fontSize: 14,
	},
	descriptionText: {
		marginTop: 0,
		fontSize: 16,
		lineHeight: 1.6,
		textAlign: 'left',
		marginBottom: 0,
	},
	mainContent: {
		fontSize: 16,
		lineHeight: 1.6,
		textAlign: 'left',
		marginBottom: 30,
	},
	paragraph: {
		marginTop: 0,
		marginBottom: 15,
	},
	button: {
		color: '#f3f0e8',
		backgroundColor: '#5e6153',
		padding: '10px 20px',
		fontSize: 16,
		textTransform: 'uppercase',
		marginBottom: 20,
		lineHeight: 1,
		textAlign: 'center',
		textDecoration: 'none',
		cursor: 'pointer',
	},
	link: {
		color: '#5e6153',
		textDecoration: 'underline',
	},
	signature: {
		textTransform: 'uppercase',
		marginTop: 20,
	},
	footer: {
		fontSize: 14,
		lineHeight: 1.6,
		marginBottom: 60,
		textAlign: 'left',
	},
	contactFooter: {
		textAlign: 'center',
		marginBottom: 40,
	},
	frequencyData: {
		textAlign: 'center',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	},
	// Frequency Map Page styles
	mapPage: {
		padding: 40,
		fontFamily: 'Helvetica',
		color: '#5e6153',
		backgroundColor: '#f8f7f4',
	},
	mapPageContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	frequencyMapTitle: {
		fontSize: 24,
		fontWeight: 'bold',
		textAlign: 'center',
		marginBottom: 40,
		textTransform: 'uppercase',
		letterSpacing: 2,
	},
	mapContainer: {
		alignItems: 'center',
		width: '100%',
	},
	mapRow: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 20,
	},
	mapItemCenter: {
		alignItems: 'center',
		width: 200,
	},
	mapItemLeft: {
		alignItems: 'center',
		width: 200,
		marginRight: 60,
	},
	mapItemRight: {
		alignItems: 'center',
		width: 200,
		marginLeft: 60,
	},
	mapFrequencyImage: {
		width: 80,
		height: 80,
		marginBottom: 10,
	},
	mapFrequencyLabel: {
		fontSize: 14,
		textTransform: 'uppercase',
		fontWeight: 'bold',
		textAlign: 'center',
	},
	mapTriangle: {
		width: 0,
		height: 0,
		backgroundColor: 'transparent',
		borderStyle: 'solid',
		marginVertical: 15,
	},
	mapTriangleUp: {
		borderLeftWidth: 30,
		borderRightWidth: 30,
		borderBottomWidth: 50,
		borderLeftColor: 'transparent',
		borderRightColor: 'transparent',
		borderBottomColor: '#5e6153',
	},
	mapTriangleDown: {
		borderLeftWidth: 30,
		borderRightWidth: 30,
		borderTopWidth: 50,
		borderLeftColor: 'transparent',
		borderRightColor: 'transparent',
		borderTopColor: '#5e6153',
	},
	mapFooterNote: {
		fontSize: 10,
		textAlign: 'center',
		marginTop: 30,
		fontStyle: 'italic',
	},
})

const S3_BASE_URL = 'https://taoc-quiz-media.s3.us-west-1.amazonaws.com'

const getFrequencyImageUrl = (frequencyId: number): string =>
	`${S3_BASE_URL}/images/${frequencyId}.png`

const getWorkbookUrl = (
	frequencyId: number,
	locale: string,
	isTier7: boolean
): string =>
	isTier7
		? `${S3_BASE_URL}/workbook/${locale}/seven-frequencies-workbook.pdf`
		: `${S3_BASE_URL}/workbook/${locale}/${frequencyId}.pdf`

interface ResultsPDFProps {
	quizResponse: QuizResponse
	/** Base64 data URL of the frequency map image captured via html2canvas */
	frequencyMapImage?: string
}

export const ResultsPDF = ({
	quizResponse,
	frequencyMapImage,
}: ResultsPDFProps) => {
	const { firstName, lastName, frequencies } = quizResponse
	const locale = getLocale()
	const isTier7 = frequencies.length === 7

	// Helper function to generate the appropriate text based on number of frequencies
	const getFrequenciesIntro = () => {
		const count = frequencies.length
		if (count === 1) {
			return {
				prefix: m['pdf.thisIsThe'](),
				number: m['pdf.top'](),
			}
		} else if (count === 2) {
			return {
				prefix: m['pdf.theseAreThe'](),
				number: m['pdf.topTwo'](),
			}
		} else if (count === 3) {
			return {
				prefix: m['pdf.theseAreThe'](),
				number: m['pdf.topThree'](),
			}
		} else {
			return {
				prefix: m['pdf.theseAreThe'](),
				number: m['pdf.topN']({ count: String(count) }),
			}
		}
	}

	const frequenciesIntro = getFrequenciesIntro()

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<View style={styles.container}>
					{/* Greeting */}
					<Text style={styles.greeting}>
						{m['pdf.greeting']({ firstName, lastName })}
					</Text>

					{/* Results Intro */}
					<View>
						<Text style={styles.resultsIntro}>{m['pdf.resultsIntro']()}</Text>
					</View>

					{/* Frequencies Grid with Images */}
					<View style={styles.frequenciesGrid}>
						{frequencies.map((frequency, index) => (
							<View key={frequency.id || index} style={styles.frequencyItem}>
								<Image
									style={styles.frequencyImage}
									src={getFrequencyImageUrl(frequency.id!)}
								/>
								<View style={styles.frequencyData}>
									<Text style={styles.frequencyName}>{frequency.name}</Text>
									<Text style={styles.frequencyNumber}>
										{(index + 1).toString().padStart(2, '0')}
									</Text>
								</View>
							</View>
						))}
					</View>

					{/* Frequency Descriptions */}
					<View style={styles.descriptionsSection}>
						{frequencies.map((frequency, index) => (
							<View key={frequency.id || index} style={styles.descriptionItem}>
								<Text style={styles.descriptionTitle}>
									#{index + 1} {frequency.name}
								</Text>
								<Text style={styles.descriptionText}>
									{frequency.description}
								</Text>
							</View>
						))}
					</View>

					{/* Main Content */}
					<View style={styles.mainContent}>
						<Text style={styles.paragraph}>
							{frequenciesIntro.prefix}{' '}
							<Text style={styles.bold}>
								{frequenciesIntro.number}{' '}
								{frequencies.length === 1
									? m['pdf.frequency']()
									: m['pdf.frequencyPlural']()}
							</Text>{' '}
							{m['pdf.mainParagraph1']()}
							{'\n'}
							{'\n'}
							{m['pdf.primaryFrequencyIntro']()}
						</Text>

						<Text style={styles.paragraph}>{m['pdf.workbookIntro']()}</Text>

						<Link
							style={styles.button}
							src={getWorkbookUrl(frequencies[0].id!, locale, isTier7)}
						>
							{m['pdf.downloadWorkbook']()}
						</Link>

						<Text style={styles.paragraph}>{m['pdf.workbookInsights']()}</Text>

						<Text style={styles.paragraph}>
							{m['pdf.visitUsPrefix']()}{' '}
							<Link
								style={{
									color: '#5e6153',
									fontWeight: 'bold',
									textDecoration: 'none',
								}}
								src="https://www.thesevenfrequencies.com/"
							>
								thesevenfrequencies.com
							</Link>{' '}
							{m['pdf.visitUsSuffix']()}
						</Text>

						<Text style={styles.paragraph}>
							{m['pdf.learnMore']()}{' '}
							<Link
								style={styles.link}
								src="https://shop.erwinmcmanus.com/collections/the-seven-frequencies-top/products/the-7-frequencies-of-communication"
							>
								{m['pdf.buyItNow']()}
							</Link>
						</Text>

						<Text style={styles.signature}>{m['pdf.signature']()}</Text>
					</View>

					{/* PS Section */}
					<View style={styles.footer}>
						<Text>{m['pdf.ps']()}</Text>
					</View>

					{/* Footer */}
					<View style={styles.contactFooter}>
						<Text>
							{m['pdf.contactUs']()}
							{'\n'}
							<Link style={styles.link} src="mailto:info@erwinmcmanus.com">
								info@erwinmcmanus.com
							</Link>
						</Text>
					</View>
				</View>
			</Page>

			{/* Frequency Map Page - Rendered from captured image (preferred) or fallback to allFrequencies */}
			{frequencyMapImage && (
				<Page size="A4" style={{ padding: 0 }}>
					<Image
						src={frequencyMapImage}
						style={{ width: '100%', height: '100%', objectFit: 'contain' }}
					/>
				</Page>
			)}
		</Document>
	)
}
