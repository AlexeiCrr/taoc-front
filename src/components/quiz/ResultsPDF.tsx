import {
	Document,
	Image,
	Link,
	Page,
	StyleSheet,
	Text,
	View,
} from '@react-pdf/renderer'
import type { Frequency, QuizResponse } from '../../types/quiz.types'

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

const getFrequencyImageUrl = (frequencyName: string): string =>
	`${S3_BASE_URL}/images/${frequencyName.toLowerCase()}.png`

const getWorkbookUrl = (frequencyName: string): string =>
	`${S3_BASE_URL}/workbook/${frequencyName.toLowerCase()}.pdf`

interface ResultsPDFProps {
	quizResponse: QuizResponse
	/** @deprecated Use frequencyMapImage instead for pixel-perfect rendering */
	allFrequencies?: Frequency[]
	/** Base64 data URL of the frequency map image captured via html2canvas */
	frequencyMapImage?: string
}

export const ResultsPDF = ({
	quizResponse,
	allFrequencies,
	frequencyMapImage,
}: ResultsPDFProps) => {
	const { firstName, lastName, frequencies } = quizResponse

	// Helper function to generate the appropriate text based on number of frequencies
	const getFrequenciesIntro = () => {
		const count = frequencies.length
		if (count === 1) {
			return {
				prefix: 'This is the',
				number: 'top',
			}
		} else if (count === 2) {
			return {
				prefix: 'These are the',
				number: 'top two',
			}
		} else if (count === 3) {
			return {
				prefix: 'These are the',
				number: 'top three',
			}
		} else {
			return {
				prefix: 'These are the',
				number: `top ${count}`,
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
						Hello {firstName} {lastName}!
					</Text>

					{/* Results Intro */}
					<View>
						<Text style={styles.resultsIntro}>
							Your <Text style={styles.bold}>Seven Frequencies</Text> results:
						</Text>
					</View>

					{/* Frequencies Grid with Images */}
					<View style={styles.frequenciesGrid}>
						{frequencies.map((frequency, index) => (
							<View key={frequency.id || index} style={styles.frequencyItem}>
								<Image
									style={styles.frequencyImage}
									src={getFrequencyImageUrl(frequency.name)}
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
								{frequenciesIntro.number} communication{' '}
								{frequencies.length === 1 ? 'frequency' : 'frequencies'}
							</Text>{' '}
							you utilize and access most naturally, but each of the Seven
							Frequencies can become a part of your communication toolkit over
							time.{'\n'}
							Your #1 frequency is what we call your core or{' '}
							<Text style={styles.bold}>primary frequency</Text>. Discovering
							the power and potential of your primary frequency will
							revolutionize how you impact the world around you.
						</Text>

						<Text style={styles.paragraph}>
							This is why we've created a{' '}
							<Text style={styles.bold}>unique workbook</Text> just for your
							frequency.
						</Text>

						<Link
							style={styles.button}
							src={getWorkbookUrl(frequencies[0].name)}
						>
							Download Workbook
						</Link>

						<Text style={styles.paragraph}>
							The workbook insights and applications will give you a
							comprehensive understanding of how to utilize your frequency to
							become a better speaker, leader, author, parent, partner, or
							teammate.
						</Text>

						<Text style={styles.paragraph}>
							Visit us at{' '}
							<Link
								style={styles.link}
								src="https://www.thesevenfrequencies.com/"
							>
								thesevenfrequencies.com
							</Link>{' '}
							to find out more about the Seven Frequencies.
						</Text>

						<Text style={styles.paragraph}>
							Learn more about the Seven Frequencies in{' '}
							<Text style={{ fontStyle: 'italic' }}>
								The Seven Frequencies of Communication: The Hidden Language of
								Human Connection
							</Text>{' '}
							book by Erwin Raphael McManus.{' '}
							<Link
								style={styles.link}
								src="https://shop.erwinmcmanus.com/collections/the-seven-frequencies-top/products/the-7-frequencies-of-communication"
							>
								Buy It Now!
							</Link>
						</Text>

						<Text style={styles.signature}>- The Seven Frequencies Team</Text>
					</View>

					{/* PS Section */}
					<View style={styles.footer}>
						<Text>
							PS: If you have any questions about your personal results or want
							assistance bringing the Seven Frequencies to your team or
							workplace, reach out to us{' '}
							<Link style={styles.link} src="https://erwinmcmanus.com/contact">
								here
							</Link>
							!
						</Text>
					</View>

					{/* Footer */}
					<View style={styles.contactFooter}>
						<Text>
							Contact us:{'\n'}
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

			{/* Fallback: Render map using react-pdf if no image provided but allFrequencies exists */}
			{!frequencyMapImage && allFrequencies && allFrequencies.length === 7 && (
				<Page size="A4" style={styles.mapPage}>
					<View style={styles.mapPageContainer}>
						<Text style={styles.frequencyMapTitle}>YOUR FREQUENCIES MAP</Text>
						<View style={styles.mapContainer}>
							{/* Top Center - Position 0 (Highest) */}
							<View style={styles.mapRow}>
								<View style={styles.mapItemCenter}>
									<Image
										style={styles.mapFrequencyImage}
										src={getFrequencyImageUrl(allFrequencies[0].name)}
									/>
									<Text style={styles.mapFrequencyLabel}>
										{allFrequencies[0].name} | {allFrequencies[0].value}
									</Text>
								</View>
							</View>

							{/* Top Row - Positions 1 & 2 */}
							<View style={styles.mapRow}>
								<View style={styles.mapItemLeft}>
									<Image
										style={styles.mapFrequencyImage}
										src={getFrequencyImageUrl(allFrequencies[1].name)}
									/>
									<Text style={styles.mapFrequencyLabel}>
										{allFrequencies[1].value} | {allFrequencies[1].name}
									</Text>
								</View>
								<View style={styles.mapItemRight}>
									<Image
										style={styles.mapFrequencyImage}
										src={getFrequencyImageUrl(allFrequencies[2].name)}
									/>
									<Text style={styles.mapFrequencyLabel}>
										{allFrequencies[2].name} | {allFrequencies[2].value}
									</Text>
								</View>
							</View>

							{/* Upward Triangle */}
							<View style={[styles.mapTriangle, styles.mapTriangleUp]} />

							{/* Middle Center - Position 3 */}
							<View style={styles.mapRow}>
								<View style={styles.mapItemCenter}>
									<Image
										style={styles.mapFrequencyImage}
										src={getFrequencyImageUrl(allFrequencies[3].name)}
									/>
									<Text style={styles.mapFrequencyLabel}>
										{allFrequencies[3].name} | {allFrequencies[3].value}
									</Text>
								</View>
							</View>

							{/* Downward Triangle */}
							<View style={[styles.mapTriangle, styles.mapTriangleDown]} />

							{/* Bottom Row - Positions 4 & 5 */}
							<View style={styles.mapRow}>
								<View style={styles.mapItemLeft}>
									<Image
										style={styles.mapFrequencyImage}
										src={getFrequencyImageUrl(allFrequencies[4].name)}
									/>
									<Text style={styles.mapFrequencyLabel}>
										{allFrequencies[4].value} | {allFrequencies[4].name}
									</Text>
								</View>
								<View style={styles.mapItemRight}>
									<Image
										style={styles.mapFrequencyImage}
										src={getFrequencyImageUrl(allFrequencies[5].name)}
									/>
									<Text style={styles.mapFrequencyLabel}>
										{allFrequencies[5].name} | {allFrequencies[5].value}
									</Text>
								</View>
							</View>

							{/* Bottom Center - Position 6 (Lowest) */}
							<View style={styles.mapRow}>
								<View style={styles.mapItemCenter}>
									<Image
										style={styles.mapFrequencyImage}
										src={getFrequencyImageUrl(allFrequencies[6].name)}
									/>
									<Text style={styles.mapFrequencyLabel}>
										{allFrequencies[6].name} | {allFrequencies[6].value}
									</Text>
								</View>
							</View>
						</View>
						<Text style={styles.mapFooterNote}>
							*All scores are out of a maximum of 60
						</Text>
					</View>
				</Page>
			)}
		</Document>
	)
}
