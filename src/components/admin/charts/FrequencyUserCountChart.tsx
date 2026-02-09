import type { FrequencyUserCount } from '@/types/admin.types'
import {
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
} from 'recharts'
import {
	FREQUENCY_COLORS,
	foregroundColor,
	getFrequencyColor,
} from '@/utils/chartUtils'

interface Props {
	data: FrequencyUserCount[]
}

export function FrequencyUserCountChart({ data }: Props) {
	const sortedData = [...data].sort((a, b) => b.userCount - a.userCount)

	// Transform data to match Recharts' expected format with index signature
	const chartData = sortedData.map((item) => ({
		...item,
		name: item.frequency,
	}))

	const CustomTooltip = ({
		active,
		payload,
	}: {
		active?: boolean
		payload?: Array<{ payload: FrequencyUserCount }>
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
						{item.frequency}: {item.userCount} ({item.percentage.toFixed(1)}%)
					</p>
				</div>
			)
		}
		return null
	}

	const CustomLegend = () => (
		<div className="flex flex-col items-center mt-4 space-y-2">
			<p className="text-sm font-semibold text-foreground">Top 3 Frequencies</p>
			<div className="flex gap-6">
				{sortedData.slice(0, 3).map((item, index) => (
					<div key={item.frequency} className="flex items-center gap-2">
						<div
							style={{
								width: 12,
								height: 12,
								backgroundColor: FREQUENCY_COLORS[item.frequency],
								borderRadius: 2,
							}}
						/>
						<span className="text-sm text-muted-foreground">
							{index + 1}. {item.frequency} ({item.percentage.toFixed(1)}%)
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
					nameKey="frequency"
					cx="50%"
					cy="50%"
					outerRadius={100}
					label={(props) => {
						const entry = props as unknown as FrequencyUserCount & {
							frequency: string
							percentage: number
						}
						return `${entry.frequency} (${entry.percentage.toFixed(1)}%)`
					}}
				>
					{chartData.map((entry, index) => (
						<Cell
							key={`cell-${index}`}
							fill={getFrequencyColor(entry.frequency)}
						/>
					))}
				</Pie>
				<Tooltip isAnimationActive={false} content={<CustomTooltip />} />
				<Legend content={<CustomLegend />} />
			</PieChart>
		</ResponsiveContainer>
	)
}
