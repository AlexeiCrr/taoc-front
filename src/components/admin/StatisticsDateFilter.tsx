import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format, subDays, parse, startOfDay, endOfDay } from 'date-fns'
import { CalendarIcon, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export interface StatisticsFilters {
	dateFrom?: string
	dateTo?: string
}

interface Props {
	onFilterChange: (filters: StatisticsFilters) => void
	initialFilters?: StatisticsFilters
}

export type PresetKey = 'week' | '30days' | '60days' | '90days' | 'custom' | null

export function StatisticsDateFilter({ onFilterChange, initialFilters }: Props) {
	const [activePreset, setActivePreset] = useState<PresetKey>(null)
	const [dateFrom, setDateFrom] = useState<Date | undefined>()
	const [dateTo, setDateTo] = useState<Date | undefined>()

	// Initialize from URL params on mount
	useEffect(() => {
		if (initialFilters?.dateFrom || initialFilters?.dateTo) {
			const from = initialFilters.dateFrom
				? parse(initialFilters.dateFrom, 'yyyy-MM-dd', new Date())
				: undefined
			const to = initialFilters.dateTo
				? parse(initialFilters.dateTo, 'yyyy-MM-dd', new Date())
				: undefined

			setDateFrom(from)
			setDateTo(to)

			// Try to detect which preset matches
			if (from && to) {
				const today = new Date()
				const daysDiff = Math.round((today.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))

				if (daysDiff === 7) setActivePreset('week')
				else if (daysDiff === 30) setActivePreset('30days')
				else if (daysDiff === 60) setActivePreset('60days')
				else if (daysDiff === 90) setActivePreset('90days')
				else setActivePreset('custom')
			}
		}
	}, []) // Only run on mount

	const applyPreset = (preset: PresetKey) => {
		const today = new Date()
		let from: Date | undefined
		let to: Date | undefined = today

		switch (preset) {
			case 'week':
				from = subDays(today, 7)
				break
			case '30days':
				from = subDays(today, 30)
				break
			case '60days':
				from = subDays(today, 60)
				break
			case '90days':
				from = subDays(today, 90)
				break
			case null:
				from = undefined
				to = undefined
				break
		}

		setActivePreset(preset)
		setDateFrom(from)
		setDateTo(to)

		if (preset !== 'custom') {
			onFilterChange({
				dateFrom: from ? startOfDay(from).toISOString() : undefined,
				dateTo: to ? endOfDay(to).toISOString() : undefined,
			})
		}
	}

	const applyCustomRange = () => {
		setActivePreset('custom')
		onFilterChange({
			dateFrom: dateFrom ? startOfDay(dateFrom).toISOString() : undefined,
			dateTo: dateTo ? endOfDay(dateTo).toISOString() : undefined,
		})
	}

	const clearFilters = () => {
		setActivePreset(null)
		setDateFrom(undefined)
		setDateTo(undefined)
		onFilterChange({})
	}

	return (
		<div className="flex flex-wrap items-center gap-2 mb-6">
			<span className="text-sm text-muted-foreground mr-2">Filter by:</span>

			<Button
				variant={activePreset === 'week' ? 'default' : 'outline'}
				size="sm"
				onClick={() => applyPreset('week')}
			>
				Last 7 days
			</Button>
			<Button
				variant={activePreset === '30days' ? 'default' : 'outline'}
				size="sm"
				onClick={() => applyPreset('30days')}
			>
				Last 30 days
			</Button>
			<Button
				variant={activePreset === '60days' ? 'default' : 'outline'}
				size="sm"
				onClick={() => applyPreset('60days')}
			>
				Last 60 days
			</Button>
			<Button
				variant={activePreset === '90days' ? 'default' : 'outline'}
				size="sm"
				onClick={() => applyPreset('90days')}
			>
				Last 90 days
			</Button>

			<div className="flex items-center gap-2 ml-2">
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant={activePreset === 'custom' && dateFrom ? 'default' : 'outline'}
							size="sm"
							className={cn(
								'justify-start text-left font-normal min-w-[140px]',
								!dateFrom && 'text-muted-foreground'
							)}
						>
							<CalendarIcon className="mr-2 h-4 w-4" />
							{dateFrom ? format(dateFrom, 'MMM d, yyyy') : 'From'}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="dark w-auto p-0 bg-popover" align="start">
						<Calendar
							mode="single"
							selected={dateFrom}
							onSelect={(date) => {
								setDateFrom(date)
								setActivePreset('custom')
							}}
							disabled={(date) => date > new Date()}
							initialFocus
						/>
					</PopoverContent>
				</Popover>

				<span className="text-muted-foreground">to</span>

				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant={activePreset === 'custom' && dateTo ? 'default' : 'outline'}
							size="sm"
							className={cn(
								'justify-start text-left font-normal min-w-[140px]',
								!dateTo && 'text-muted-foreground'
							)}
						>
							<CalendarIcon className="mr-2 h-4 w-4" />
							{dateTo ? format(dateTo, 'MMM d, yyyy') : 'To'}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="dark w-auto p-0 bg-popover" align="start">
						<Calendar
							mode="single"
							selected={dateTo}
							onSelect={(date) => {
								setDateTo(date)
								setActivePreset('custom')
							}}
							disabled={(date) => date > new Date()}
							initialFocus
						/>
					</PopoverContent>
				</Popover>

				{activePreset === 'custom' && (dateFrom || dateTo) && (
					<Button size="sm" onClick={applyCustomRange}>
						Apply
					</Button>
				)}
			</div>

			{activePreset && (
				<Button
					variant="ghost"
					size="sm"
					onClick={clearFilters}
					className="ml-2"
				>
					<X className="h-4 w-4 mr-1" />
					Clear
				</Button>
			)}
		</div>
	)
}
