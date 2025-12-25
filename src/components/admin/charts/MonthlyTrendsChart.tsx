import {
	Area,
	AreaChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'

// TODO: Backend API endpoint /responses/monthly-trends not yet implemented
// Expected format: { month: "Jan", userCount: 145 }
// This chart uses mock data to demonstrate the final design
const MOCK_DATA = [
	{ month: 'Jan', userCount: 65 },
	{ month: 'Feb', userCount: 78 },
	{ month: 'Mar', userCount: 90 },
	{ month: 'Apr', userCount: 95 },
	{ month: 'May', userCount: 88 },
	{ month: 'Jun', userCount: 70 },
	{ month: 'Jul', userCount: 60 },
	{ month: 'Aug', userCount: 75 },
	{ month: 'Sep', userCount: 92 },
	{ month: 'Oct', userCount: 100 },
	{ month: 'Nov', userCount: 95 },
	{ month: 'Dec', userCount: 80 },
]

export function MonthlyTrendsChart() {
	return (
		<div className="relative">
			<div className="absolute top-0 right-0 bg-yellow-500/10 border border-yellow-500/50 rounded px-2 py-1 text-xs text-yellow-600 dark:text-yellow-400">
				TODO: Backend API
			</div>
			<ResponsiveContainer width="100%" height={350}>
				<AreaChart
					data={MOCK_DATA}
					margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
				>
					<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
					<XAxis dataKey="month" tick={{ fill: '#ffffff' }} />
					<YAxis tick={{ fill: '#ffffff' }} />
					<Tooltip
						contentStyle={{
							backgroundColor: 'rgba(0, 0, 0, 0.5)',
							border: '1px solid rgba(255, 255, 255, 0.2)',
							borderRadius: '8px',
							color: '#ffffff',
						}}
						labelStyle={{ color: '#ffffff' }}
						itemStyle={{ color: '#ffffff' }}
						formatter={(value: number) => [`${value} users`, 'User Count']}
						isAnimationActive={false}
					/>
					<Legend />
					<Area
						type="monotone"
						dataKey="userCount"
						stroke="var(--primary)"
						strokeWidth={2}
						dot={{ fill: 'var(--primary)' }}
						name="Monthly Users"
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	)
}
