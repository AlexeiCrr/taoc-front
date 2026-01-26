import type { FrequencyAverageScore } from '@/types/admin.types'
import {
	FREQUENCY_COLORS,
	foregroundColor,
	getFrequencyColor,
} from '@/utils/chartUtils'
import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'

interface Props {
	data: FrequencyAverageScore[]
}

export function FrequencyAverageScoresChart({ data }: Props) {
	const sortedData = [...data].sort((a, b) => b.averageScore - a.averageScore)

	const chartData = sortedData.map((item) => ({
		...item,
		fill: getFrequencyColor(item.frequency),
	}))

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
							{index + 1}. {item.frequency} ({item.averageScore.toFixed(1)})
						</span>
					</div>
				))}
			</div>
		</div>
	)

	return (
		<ResponsiveContainer width="100%" height={350}>
			<BarChart
				data={chartData}
				margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
				style={{ cursor: 'default' }}
			>
				<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
				<XAxis
					dataKey="frequency"
					angle={-45}
					textAnchor="end"
					height={80}
					tick={{ fill: foregroundColor }}
				/>
				<YAxis tick={{ fill: foregroundColor }} />
				<Tooltip
					contentStyle={{
						backgroundColor: 'rgba(0, 0, 0, 0.5)',
						border: '1px solid rgba(255, 255, 255, 0.2)',
						borderRadius: '8px',
						color: foregroundColor,
					}}
					labelStyle={{ color: foregroundColor }}
					itemStyle={{ color: foregroundColor }}
					formatter={(
						value?: number,
						_name?: string,
						item?: { payload?: FrequencyAverageScore }
					) => {
						const payload = item?.payload
						return [
							`Score: ${value?.toFixed(1)}`,
							`Responses: ${payload?.totalResponses ?? 'N/A'}`,
						]
					}}
					isAnimationActive={false}
					cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
				/>
				<Bar
					dataKey="averageScore"
					radius={[8, 8, 0, 0]}
					activeBar={{ opacity: 0.9 }}
				/>
				<Legend content={<CustomLegend />} />
			</BarChart>
		</ResponsiveContainer>
	)
}
