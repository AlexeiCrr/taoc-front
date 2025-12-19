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
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'

export default function AdminFilters() {
	const [nameFilter, setNameFilter] = useState('')
	const [emailFilter, setEmailFilter] = useState('')
	const [licenseCodeFilter, setLicenseCodeFilter] = useState('')
	const [selectedDate, setSelectedDate] = useState<Date | undefined>()

	const { setFilter, clearFilters, fetchResponses } = useAdminStore()

	const handleApplyFilters = () => {
		// Convert empty strings to undefined (Invariant: empty filter values omitted from API request)
		// Format date to YYYY-MM-DD for API query params
		setFilter({
			search: nameFilter.trim() || undefined,
			email: emailFilter.trim() || undefined,
			licenseCode: licenseCodeFilter.trim() || undefined,
			date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined,
		})
		// Invariant: pagination resets to page 1 when filters change
		fetchResponses(1)
	}

	const handleClearFilters = () => {
		setNameFilter('')
		setEmailFilter('')
		setLicenseCodeFilter('')
		setSelectedDate(undefined)
		clearFilters()
		fetchResponses(1)
	}

	// Apply filters on Enter key press
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleApplyFilters()
		}
	}

	return (
		<div className="flex flex-wrap items-end gap-4 mb-6">
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

			<div className="flex-1 min-w-[200px]">
				<label className="text-sm font-medium mb-1.5 block">Date</label>
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							className={cn(
								'w-full justify-start text-left font-normal font-roboto',
								!selectedDate && 'text-muted-foreground'
							)}
						>
							<CalendarIcon className="mr-2 h-4 w-4" />
							{selectedDate ? (
								format(selectedDate, 'MMM d, yyyy')
							) : (
								<span>Pick a date</span>
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0 font-roboto" align="start">
						<Calendar
							mode="single"
							selected={selectedDate}
							onSelect={setSelectedDate}
							initialFocus
						/>
					</PopoverContent>
				</Popover>
			</div>

			<Button onClick={handleApplyFilters}>Apply</Button>
			<Button onClick={handleClearFilters} variant="outline">
				Clear
			</Button>
		</div>
	)
}
