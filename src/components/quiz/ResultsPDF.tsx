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

// Register fonts if needed
// Font.register({
// 	family: 'Helvetica',
// 	src: '/fonts/helvetica_regular.otf',
// })

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
})

interface ResultsPDFProps {
	quizResponse: QuizResponse
}

export const ResultsPDF = ({ quizResponse }: ResultsPDFProps) => {
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
									src={`https://taoc-quiz-media.s3.us-west-1.amazonaws.com/images/${frequency.name.toLowerCase()}.png`}
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
							src={`https://taoc-quiz-media.s3.us-west-1.amazonaws.com/workbook/${frequencies[0].name.toLowerCase()}.pdf`}
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
		</Document>
	)
}
