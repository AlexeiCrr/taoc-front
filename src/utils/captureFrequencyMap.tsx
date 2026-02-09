import html2canvas from 'html2canvas'
import type { Frequency } from '../types/quiz.types'
import { generateFrequencyMapHTML } from '../components/quiz/frequencyMapTemplate'

/**
 * Captures the FrequencyMap as a base64 PNG image.
 * Renders in an isolated iframe to avoid oklch color issues from Tailwind CSS.
 *
 * Uses the shared HTML template from frequencyMapTemplate.ts to ensure
 * consistency between the preview component and the capture utility.
 *
 * @param frequencies - Array of 7 frequencies sorted by score descending
 * @param userName - Optional user name to display in the title
 * @returns Promise<string> - Base64 data URL of the captured image
 */
export async function captureFrequencyMap(
	frequencies: Frequency[],
	userName?: string
): Promise<string> {
	if (frequencies.length !== 7) {
		throw new Error('FrequencyMap requires exactly 7 frequencies')
	}

	// Create an isolated iframe to avoid inheriting oklch colors from the main document
	const iframe = document.createElement('iframe')
	iframe.style.position = 'absolute'
	iframe.style.left = '-9999px'
	iframe.style.top = '-9999px'
	iframe.style.width = '595px'
	iframe.style.height = '842px'
	iframe.style.border = 'none'
	document.body.appendChild(iframe)

	try {
		const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
		if (!iframeDoc) {
			throw new Error('Failed to access iframe document')
		}

		// Use the shared template
		const frequencyMapHTML = generateFrequencyMapHTML(frequencies, userName)

		iframeDoc.open()
		iframeDoc.write(`
			<!DOCTYPE html>
			<html>
			<head>
				<style>
					* {
						margin: 0;
						padding: 0;
						box-sizing: border-box;
					}
					body {
						font-family: Helvetica, Arial, sans-serif;
						color: #5e6153;
						background-color: #f4efe9;
					}
				</style>
			</head>
			<body>
				<div id="frequency-map">
					${frequencyMapHTML}
				</div>
			</body>
			</html>
		`)
		iframeDoc.close()

		// Wait for images to load
		const images = iframeDoc.querySelectorAll('img')
		await Promise.all(
			Array.from(images).map(
				(img) =>
					new Promise<void>((resolve) => {
						if (img.complete) {
							resolve()
						} else {
							img.onload = () => resolve()
							img.onerror = () => resolve() // Continue even if image fails
						}
					})
			)
		)

		// Small additional delay for rendering
		await new Promise((resolve) => setTimeout(resolve, 100))

		// Get the element to capture (the .freq-map-container from the template)
		const element = iframeDoc.querySelector(
			'.freq-map-container'
		) as HTMLElement | null
		if (!element) {
			throw new Error('Failed to find frequency map element')
		}

		// Capture with html2canvas
		const canvas = await html2canvas(element, {
			scale: 2,
			useCORS: true,
			allowTaint: false,
			backgroundColor: '#f4efe9',
			logging: false,
		})

		return canvas.toDataURL('image/png', 1.0)
	} finally {
		document.body.removeChild(iframe)
	}
}
