import { useState, useMemo } from 'react'
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import type { MonthlyTrendData } from '@/types/admin.types'

interface MonthlyTrendsChartProps {
	data: MonthlyTrendData[]
}

interface MonthSelectProps {
	label: string
	value: string
	onChange: (value: string) => void
	availableMonths: string[]
}

function MonthSelect({
	label,
	value,
	onChange,
	availableMonths,
}: MonthSelectProps) {
	return (
		<div className="flex items-center gap-2">
			<label className="text-sm font-medium">{label}</label>
			<Select value={value} onValueChange={onChange}>
				<SelectTrigger className="w-[180px] bg-card">
					<SelectValue placeholder="All" />
				</SelectTrigger>
				<SelectContent className="dark bg-popover">
					<SelectItem value={ALL_MONTHS_VALUE}>All</SelectItem>
					{availableMonths.map((month) => (
						<SelectItem key={month} value={month}>
							{formatMonthLabel(month)}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	)
}

function formatMonthLabel(month: string): string {
	if (!/^\d{4}-\d{2}$/.test(month)) {
		console.warn(`Invalid month format: ${month}. Expected YYYY-MM.`)
		return month
	}
	const [year, monthNum] = month.split('-')
	const monthIndex = parseInt(monthNum) - 1
	if (monthIndex < 0 || monthIndex > 11) {
		console.warn(`Month out of range: ${month}`)
		return month
	}
	const date = new Date(parseInt(year), monthIndex)
	return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

const ALL_MONTHS_VALUE = 'all'

export function MonthlyTrendsChart({ data }: MonthlyTrendsChartProps) {
	const [startMonth, setStartMonth] = useState<string>(ALL_MONTHS_VALUE)
	const [endMonth, setEndMonth] = useState<string>(ALL_MONTHS_VALUE)

	const sortedMonths = useMemo(() => {
		return [...data].sort((a, b) => a.month.localeCompare(b.month))
	}, [data])

	const filteredData = useMemo(() => {
		if (startMonth === ALL_MONTHS_VALUE && endMonth === ALL_MONTHS_VALUE) {
			return sortedMonths
		}

		return sortedMonths.filter((item) => {
			const itemMonth = item.month
			const meetsStart =
				startMonth === ALL_MONTHS_VALUE || itemMonth >= startMonth
			const meetsEnd = endMonth === ALL_MONTHS_VALUE || itemMonth <= endMonth
			return meetsStart && meetsEnd
		})
	}, [sortedMonths, startMonth, endMonth])

	const chartData = useMemo(() => {
		return filteredData.map((item) => ({
			...item,
			displayMonth: formatMonthLabel(item.month),
		}))
	}, [filteredData])

	const availableMonths = sortedMonths.map((item) => item.month)

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap gap-4 items-center">
				<MonthSelect
					label="Start Month:"
					value={startMonth}
					onChange={setStartMonth}
					availableMonths={availableMonths}
				/>

				<MonthSelect
					label="End Month:"
					value={endMonth}
					onChange={setEndMonth}
					availableMonths={availableMonths}
				/>

				{(startMonth !== ALL_MONTHS_VALUE || endMonth !== ALL_MONTHS_VALUE) && (
					<button
						onClick={() => {
							setStartMonth(ALL_MONTHS_VALUE)
							setEndMonth(ALL_MONTHS_VALUE)
						}}
						className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						Clear Filters
					</button>
				)}
			</div>

			<ResponsiveContainer width="100%" height={350}>
				<AreaChart
					data={chartData}
					margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
				>
					<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
					<XAxis dataKey="displayMonth" tick={{ fill: '#ffffff' }} />
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
						formatter={(value?: number) => [
							`${value ?? 0} users`,
							'User Count',
						]}
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
