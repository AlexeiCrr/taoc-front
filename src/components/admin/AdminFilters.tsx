import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import useAdminStore from '@/stores/adminStore'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'

type DatePreset = 'week' | '30days' | '60days' | '90days' | 'custom' | null

export default function AdminFilters() {
	const [nameFilter, setNameFilter] = useState('')
	const [emailFilter, setEmailFilter] = useState('')
	const [licenseCodeFilter, setLicenseCodeFilter] = useState('')
	const [dateFrom, setDateFrom] = useState<Date | undefined>()
	const [dateTo, setDateTo] = useState<Date | undefined>()
	const [activePreset, setActivePreset] = useState<DatePreset>(null)

	const { setFilter, clearFilters, fetchResponses } = useAdminStore()

	const applyDatePreset = (preset: DatePreset) => {
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
	}

	const handleApplyFilters = () => {
		setFilter({
			search: nameFilter.trim() || undefined,
			email: emailFilter.trim() || undefined,
			licenseCode: licenseCodeFilter.trim() || undefined,
			dateFrom: dateFrom ? startOfDay(dateFrom).toISOString() : undefined,
			dateTo: dateTo ? endOfDay(dateTo).toISOString() : undefined,
		})
		fetchResponses(1)
	}

	const handleClearFilters = () => {
		setNameFilter('')
		setEmailFilter('')
		setLicenseCodeFilter('')
		setDateFrom(undefined)
		setDateTo(undefined)
		setActivePreset(null)
		clearFilters()
		fetchResponses(1)
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleApplyFilters()
		}
	}

	return (
		<div className="space-y-4 mb-6">
			{/* Text filters row */}
			<div className="flex flex-wrap items-end gap-4">
				<div className="flex-1 min-w-[200px]">
					<label
						htmlFor="name-filter"
						className="text-sm font-medium mb-1.5 block"
					>
						Name
					</label>
					<Input
						id="name-filter"
						type="text"
						placeholder="Search by first or last name"
						value={nameFilter}
						onChange={(e) => setNameFilter(e.target.value)}
						onKeyDown={handleKeyDown}
					/>
				</div>

				<div className="flex-1 min-w-[200px]">
					<label
						htmlFor="email-filter"
						className="text-sm font-medium mb-1.5 block"
					>
						Email
					</label>
					<Input
						id="email-filter"
						type="text"
						placeholder="Search by email"
						value={emailFilter}
						onChange={(e) => setEmailFilter(e.target.value)}
						onKeyDown={handleKeyDown}
					/>
				</div>

				<div className="flex-1 min-w-[200px]">
					<label
						htmlFor="license-filter"
						className="text-sm font-medium mb-1.5 block"
					>
						License Code
					</label>
					<Input
						id="license-filter"
						type="text"
						placeholder="Search by license code"
						value={licenseCodeFilter}
						onChange={(e) => setLicenseCodeFilter(e.target.value)}
						onKeyDown={handleKeyDown}
					/>
				</div>
			</div>

			{/* Date filters row */}
			<div className="flex flex-wrap items-center gap-2">
				<span className="text-sm text-muted-foreground mr-2">Date:</span>

				<Button
					variant={activePreset === 'week' ? 'default' : 'outline'}
					size="sm"
					onClick={() => applyDatePreset('week')}
				>
					Last 7 days
				</Button>
				<Button
					variant={activePreset === '30days' ? 'default' : 'outline'}
					size="sm"
					onClick={() => applyDatePreset('30days')}
				>
					Last 30 days
				</Button>
				<Button
					variant={activePreset === '60days' ? 'default' : 'outline'}
					size="sm"
					onClick={() => applyDatePreset('60days')}
				>
					Last 60 days
				</Button>
				<Button
					variant={activePreset === '90days' ? 'default' : 'outline'}
					size="sm"
					onClick={() => applyDatePreset('90days')}
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
						<PopoverContent className="dark w-[250px] p-0 bg-popover" align="start">
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
						<PopoverContent className="dark w-[250px] p-0 bg-popover" align="start">
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
				</div>

				<div className="flex gap-2 ml-auto">
					<Button onClick={handleApplyFilters}>Apply</Button>
					<Button onClick={handleClearFilters} variant="outline">
						Clear
					</Button>
				</div>
			</div>
		</div>
	)
}
