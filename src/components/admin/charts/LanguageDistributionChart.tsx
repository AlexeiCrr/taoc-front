import type { LanguageStatistic } from '@/types/admin.types'
import { foregroundColor } from '@/utils/chartUtils'
import {
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
} from 'recharts'

interface Props {
	data: LanguageStatistic[]
}

const LOCALE_COLORS: Record<string, string> = {
	en: '#5E6153',
	es: '#E4892E',
}

const LOCALE_NAMES: Record<string, string> = {
	en: 'English',
	es: 'Spanish',
}

const getLocaleColor = (locale: string): string =>
	LOCALE_COLORS[locale] || '#888888'

const getLocaleName = (locale: string): string =>
	LOCALE_NAMES[locale] || locale

export function LanguageDistributionChart({ data }: Props) {
	if (!data || data.length === 0) {
		return (
			<div className="flex items-center justify-center h-[350px] text-muted-foreground">
				No data available
			</div>
		)
	}

	const sortedData = [...data].sort((a, b) => b.userCount - a.userCount)

	const chartData = sortedData.map((item) => ({
		...item,
		name: getLocaleName(item.locale),
	}))

	const CustomTooltip = ({
		active,
		payload,
	}: {
		active?: boolean
		payload?: Array<{ payload: LanguageStatistic }>
	}) => {
		if (active && payload && payload.length) {
			const item = payload[0].payload
			return (
				<div
					style={{
						backgroundColor: 'rgba(0, 0, 0, 0.5)',
						border: '1px solid rgba(255, 255, 255, 0.2)',
						borderRadius: '8px',
						padding: '12px',
					}}
				>
					<p style={{ color: foregroundColor }}>
						{getLocaleName(item.locale)}: {item.userCount} (
						{item.percentage.toFixed(1)}%)
					</p>
				</div>
			)
		}
		return null
	}

	const CustomLegend = () => (
		<div className="flex flex-col items-center mt-4 space-y-2">
			<p className="text-sm font-semibold text-foreground">Languages</p>
			<div className="flex gap-6">
				{sortedData.map((item, index) => (
					<div key={item.locale} className="flex items-center gap-2">
						<div
							style={{
								width: 12,
								height: 12,
								backgroundColor: getLocaleColor(item.locale),
								borderRadius: 2,
							}}
						/>
						<span className="text-sm text-muted-foreground">
							{index + 1}. {getLocaleName(item.locale)} (
							{item.percentage.toFixed(1)}%)
						</span>
					</div>
				))}
			</div>
		</div>
	)

	return (
		<ResponsiveContainer width="100%" height={350}>
			<PieChart>
				<Pie
					data={chartData}
					dataKey="userCount"
					nameKey="name"
					cx="50%"
					cy="50%"
					outerRadius={100}
					label={(props) => {
						const entry = props as unknown as LanguageStatistic & {
							name: string
						}
						return `${getLocaleName(entry.locale)} (${entry.percentage.toFixed(1)}%)`
					}}
				>
					{chartData.map((entry, index) => (
						<Cell
							key={`cell-${index}`}
							fill={getLocaleColor(entry.locale)}
						/>
					))}
				</Pie>
				<Tooltip isAnimationActive={false} content={<CustomTooltip />} />
				<Legend content={<CustomLegend />} />
			</PieChart>
		</ResponsiveContainer>
	)
}
