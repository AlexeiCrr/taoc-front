import type { TimeSpentStatistics } from '@/types/admin.types'
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'
import { foregroundColor } from '@/utils/chartUtils'

interface Props {
	data: TimeSpentStatistics
}

export function TimeSpentChart({ data }: Props) {
	return (
		<div>
			<div className="mb-4 text-sm text-muted-foreground">
				Sample Size: {data.sampleSize} responses | Average Time:{' '}
				{data.averageTimeMinutes.toFixed(1)} minutes
			</div>
			<ResponsiveContainer width="100%" height={300}>
				<BarChart
					data={data.categories}
					margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
					style={{ cursor: 'default' }}
				>
					<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
					<XAxis
						dataKey="category"
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
						formatter={(value?: number, name?: string, props?: { payload: { percentage: number } }) => [
							`Count: ${value}`,
							`Percentage: ${props?.payload.percentage.toFixed(1)}%`,
						]}
						isAnimationActive={false}
						cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
					/>
					<Bar
						dataKey="userCount"
						fill="#06b6d4"
						radius={[8, 8, 0, 0]}
						activeBar={{ fill: 'rgba(6, 182, 212, 0.9)' }}
					/>
				</BarChart>
			</ResponsiveContainer>
		</div>
	)
}
