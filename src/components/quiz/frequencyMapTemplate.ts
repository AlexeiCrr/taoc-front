import type { Frequency } from '../../types/quiz.types'
import { getFrequencyColor } from '../../utils/chartUtils'

const S3_BASE_URL = 'https://taoc-quiz-media.s3.us-west-1.amazonaws.com'

export const getFrequencyImageUrl = (frequencyId: number): string =>
	`${S3_BASE_URL}/images/${frequencyId}.png`

/**
 * Generates the HTML template for the frequency map.
 * Used by both the React component (via dangerouslySetInnerHTML) and the capture utility.
 */
export function generateFrequencyMapHTML(
	frequencies: Frequency[],
	userName?: string
): string {
	if (frequencies.length !== 7) {
		return ''
	}

	const [top1, top2, top3, middle, bottom1, bottom2, bottom3] = frequencies

	// Shared styles as CSS variables (hex colors only for html2canvas compatibility)
	const styles = {
		bgColor: '#f4efe9',
		textColor: '#5e6153',
		titleFont: "'PompeiPro', system-ui, sans-serif",
		subtitleFont: "'Silka', system-ui, sans-serif",
		bodyFont: 'Helvetica, Arial, sans-serif',
	}

	return `
		<style>
			.freq-map-container,
			.freq-map-container * {
				margin: 0;
				padding: 0;
				box-sizing: border-box;
			}
			.freq-map-container {
				width: 595px;
				height: 842px;
				background-color: ${styles.bgColor};
				font-family: ${styles.bodyFont};
				color: ${styles.textColor};
				padding: 25px;
				display: flex;
				flex-direction: column;
			}
			.freq-map-title {
				margin-top: 20px;
				line-height: 1.1;
				font-size: 28px;
				font-weight: 600;
				text-align: center;
				text-transform: uppercase;
				letter-spacing: 3px;
				margin-bottom: 8px;
				font-family: ${styles.titleFont};
				color: ${styles.textColor};
			}
			.freq-map-subtitle {
				font-size: 16px;
				font-weight: 700;
				text-align: center;
				text-transform: uppercase;
				letter-spacing: 2px;
				margin-bottom: 30px;
				font-family: ${styles.subtitleFont};
				color: ${styles.textColor};
			}
			.freq-map-content {
				flex: 1;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: flex-start;
				padding: 16px 0;
				width: 550px;
				margin: 0 auto;
				position: relative;
			}
			.freq-item {
				position: relative;
				display: flex;
				align-items: center;
				justify-content: center;
			}
			.freq-item img {
				width: 60px;
				height: 60px;
				object-fit: contain;
			}
			.freq-item--bottom-side {
				top:-45px;
			}
			.freq-item--top-side {
				bottom: -40px;
			}
			.freq-item--top {
				margin-bottom: 10px;
			}
			.freq-item--bottom {
				margin-top: 10px;
			}
			.freq-label {
				position: absolute;
				white-space: nowrap;
				font-size: 12px;
				text-transform: uppercase;
				font-weight: 600;
				letter-spacing: 1px;
				font-family: ${styles.titleFont};
			}
			/* Label positioning: right side of image */
			.freq-label--right {
				left: 100%;
				margin-left: 12px;
			}
			/* Label positioning: left side of image */
			.freq-label--left {
				right: 100%;
				margin-right: 12px;
			}
			.freq-row {
				display: flex;
				align-items: center;
				justify-content: center;
				position: relative;
				width: 100%;
				gap: 10px;
			}
			.triangle-up {
				width: 0;
				height: 0;
				border-left: 55px solid transparent;
				border-right: 55px solid transparent;
				border-bottom: 85px solid ${styles.textColor};
			}
			.triangle-down {
				width: 0;
				height: 0;
				border-left: 55px solid transparent;
				border-right: 55px solid transparent;
				border-top: 85px solid ${styles.textColor};
			}
			.vertical-line {
				width: 2px;
				height: 80px;
				background-color: ${styles.textColor};
			}
			.freq-footer {
				display: flex;
				align-items: flex-end;
				justify-content: space-between;
				margin-top: auto;
				padding-top: 20px;
				color: ${styles.textColor};
				font-family: ${styles.titleFont};
			}
			.freq-footer-left {
				display: flex;
				flex-direction: column;
				gap: 2px;
			}
			.freq-footer-title {
				font-size: 10px;
				font-weight: 600;
				text-transform: uppercase;
				letter-spacing: 1px;
			}
			.freq-footer-copyright {
				font-size: 10px;
			}
			.freq-footer-badge {
				font-size: 32px;
				line-height: 1;
				letter-spacing: -1px;
			}
		</style>

		<div class="freq-map-container">
			<h1 class="freq-map-title">Frequency Map</h1>
			${userName ? `<p class="freq-map-subtitle">${userName}</p>` : ''}

			<div class="freq-map-content">
				<!-- Top Center - Position 0 (Highest) -->
				<div class="freq-item freq-item--top">
					<img src="${getFrequencyImageUrl(top1.id)}" alt="${top1.name}" crossorigin="anonymous" />
					<span class="freq-label freq-label--right" style="color: ${getFrequencyColor(top1.name)}">${top1.name} | ${top1.value}</span>
				</div>

				<!-- Top Row with Triangle - Positions 1 & 2 -->
				<div class="freq-row">
					<div class="freq-item freq-item--top-side">
						<img src="${getFrequencyImageUrl(top2.id)}" alt="${top2.name}" crossorigin="anonymous" />
						<span class="freq-label freq-label--left" style="color: ${getFrequencyColor(top2.name)}">${top2.value} | ${top2.name}</span>
					</div>

					<div class="triangle-up"></div>

					<div class="freq-item freq-item--top-side">
						<img src="${getFrequencyImageUrl(top3.id)}" alt="${top3.name}" crossorigin="anonymous" />
						<span class="freq-label freq-label--right" style="color: ${getFrequencyColor(top3.name)}">${top3.name} | ${top3.value}</span>
					</div>
				</div>

				<!-- Vertical Line -->
				<div class="vertical-line"></div>

				<!-- Middle Center - Position 3 -->
				<div class="freq-item">
					<img src="${getFrequencyImageUrl(middle.id)}" alt="${middle.name}" crossorigin="anonymous" />
					<span class="freq-label freq-label--right" style="color: ${getFrequencyColor(middle.name)}">${middle.name} | ${middle.value}</span>
				</div>

				<!-- Vertical Line -->
				<div class="vertical-line"></div>

				<!-- Bottom Row with Triangle - Positions 4 & 5 -->
				<div class="freq-row">
					<div class="freq-item freq-item--bottom-side">
						<img src="${getFrequencyImageUrl(bottom1.id)}" alt="${bottom1.name}" crossorigin="anonymous" />
						<span class="freq-label freq-label--left" style="color: ${getFrequencyColor(bottom1.name)}">${bottom1.value} | ${bottom1.name}</span>
					</div>

					<div class="triangle-down"></div>

					<div class="freq-item freq-item--bottom-side">
						<img src="${getFrequencyImageUrl(bottom2.id)}" alt="${bottom2.name}" crossorigin="anonymous" />
						<span class="freq-label freq-label--right" style="color: ${getFrequencyColor(bottom2.name)}">${bottom2.name} | ${bottom2.value}</span>
					</div>
				</div>

				<!-- Bottom Center - Position 6 (Lowest) -->
				<div class="freq-item freq-item--bottom">
					<img src="${getFrequencyImageUrl(bottom3.id)}" alt="${bottom3.name}" crossorigin="anonymous" />
					<span class="freq-label freq-label--right" style="color: ${getFrequencyColor(bottom3.name)}">${bottom3.name} | ${bottom3.value}</span>
				</div>
			</div>

			<div class="freq-footer">
				<div class="freq-footer-left">
					<span class="freq-footer-title">The Seven Frequencies of Communication Report</span>
					<span class="freq-footer-copyright">&copy;${new Date().getFullYear()}, The Arena Community, LLC. All rights reserved.</span>
				</div>
				<span class="freq-footer-badge">7F</span>
			</div>
		</div>
	`
}
