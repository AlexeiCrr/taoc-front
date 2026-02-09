import type { TimeSpentStatistics } from '@/types/admin.types'
import { foregroundColor, getFrequencyColor } from '@/utils/chartUtils'
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'

interface Props {
	data: TimeSpentStatistics
}

export function TimeSpentChart({ data }: Props) {
	return (
		<div>
			<div className="mb-4 space-y-2">
				<div className="text-sm text-muted-foreground">
					Sample Size: {data.sampleSize} responses | Average Time:{' '}
					{data.averageTimeMinutes.toFixed(1)} minutes
				</div>
				{(data.fastestCompletion || data.slowestCompletion) && (
					<div className="flex flex-wrap gap-4 text-sm">
						{data.fastestCompletion && (
							<div className="bg-green-500/10 border border-green-500/20 rounded-md px-3 py-1.5">
								<span className="text-green-400">Fastest:</span>{' '}
								<span className="text-foreground">
									{data.fastestCompletion.timeMinutes} min
								</span>
								<span className="text-muted-foreground">
									{' '}
									— {data.fastestCompletion.primaryFrequency}
								</span>
							</div>
						)}
						{data.slowestCompletion && (
							<div className="bg-orange-500/10 border border-orange-500/20 rounded-md px-3 py-1.5">
								<span className="text-orange-400">Slowest:</span>{' '}
								<span className="text-foreground">
									{data.slowestCompletion.timeMinutes} min
								</span>
								<span className="text-muted-foreground">
									{' '}
									— {data.slowestCompletion.primaryFrequency}
								</span>
							</div>
						)}
					</div>
				)}
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
						formatter={(
							value?: number,
							_name?: string,
							item?: { payload?: { percentage: number } }
						) => {
							const percentage = item?.payload?.percentage
							return [
								`Count: ${value}`,
								`Percentage: ${percentage?.toFixed(1) ?? 'N/A'}%`,
							]
						}}
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

			{/* Time breakdown by primary frequency */}
			{data.timeByFrequency && data.timeByFrequency.length > 0 && (
				<div className="mt-6 pt-4 border-t border-border">
					<h4 className="text-sm font-medium text-foreground mb-3">
						Average Time by Primary Frequency
					</h4>
					<div className="flex flex-col gap-2">
						{[...data.timeByFrequency]
							.sort((a, b) => b.averageTimeMinutes - a.averageTimeMinutes)
							.map((item) => (
								<div
									key={item.frequency}
									className="flex items-center justify-between bg-muted/30 rounded-md px-3 py-2"
								>
									<div className="flex items-center gap-2">
										<div
											className="w-3 h-3 rounded-sm"
											style={{
												backgroundColor: getFrequencyColor(item.frequency),
											}}
										/>
										<span className="text-sm text-foreground">
											{item.frequency}
										</span>
									</div>
									<div className="text-right">
										<span className="text-sm font-medium text-foreground">
											{item.averageTimeMinutes.toFixed(1)} min
										</span>
										<span className="text-xs text-muted-foreground ml-2">
											({item.userCount} users)
										</span>
									</div>
								</div>
							))}
					</div>
				</div>
			)}
		</div>
	)
}
