import FrequencyBreakdownDialog from '@/components/admin/FrequencyBreakdownDialog'
import { Button } from '@/components/ui/button'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import useAdminStore from '@/stores/adminStore'
import type { AdminResponse, FrequencyMap } from '@/types/admin.types'
import { getFrequencyColor } from '@/utils/chartUtils'
import {
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnDef,
	type SortingState,
} from '@tanstack/react-table'
import { format } from 'date-fns'
import { BarChart3, ChevronDown, ChevronUp } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

/** Returns the primary frequency: highest score, alphabetical tiebreaker */
function getPrimaryFrequency(frequencies: FrequencyMap): { name: string; score: number } | null {
	const entries = Object.entries(frequencies)
	if (entries.length === 0) return null
	entries.sort(([nameA, scoreA], [nameB, scoreB]) => {
		if (scoreB !== scoreA) return scoreB - scoreA
		return nameA.localeCompare(nameB)
	})
	return { name: entries[0][0], score: entries[0][1] }
}

export default function AdminDataGrid() {
	const { responses, pagination, isLoading, fetchResponses } = useAdminStore()
	const navigate = useNavigate()
	const [sorting, setSorting] = useState<SortingState>([])
	const [breakdownResponse, setBreakdownResponse] = useState<AdminResponse | null>(null)

	const handleOpenBreakdown = useCallback((e: React.MouseEvent, response: AdminResponse) => {
		e.stopPropagation()
		setBreakdownResponse(response)
	}, [])

	const columns = useMemo<ColumnDef<AdminResponse>[]>(() => {
		return [
			{
				accessorKey: 'firstName',
				header: 'First Name',
				cell: (info) => info.getValue(),
			},
			{
				accessorKey: 'lastName',
				header: 'Last Name',
				cell: (info) => info.getValue(),
			},
			{
				accessorKey: 'email',
				header: 'Email',
				cell: (info) => {
					const email = info.getValue() as string
					return (
						<TooltipProvider delayDuration={300}>
							<Tooltip>
								<TooltipTrigger asChild>
									<span className="block max-w-[280px] truncate">{email}</span>
								</TooltipTrigger>
								<TooltipContent>
									<p className="font-roboto">{email}</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					)
				},
			},
			{
				accessorKey: 'licenseCode',
				header: 'License Code',
				cell: ({ row }) => {
					const code = row.original.licenseCode
					const tier = row.original.licenseTier
					if (!code) return <span className="text-muted-foreground">—</span>
					return (
						<div className="flex items-center gap-2">
							<span className="inline-block w-[6ch] font-mono">{code}</span>
							{tier != null && (
								<span
									className="text-[11px] font-roboto font-bold px-1.5 py-0.5 rounded-sm tracking-wide"
									style={{
										backgroundColor:
											tier === 7 ? 'rgba(182, 206, 232, 0.15)' :
											tier === 3 ? 'rgba(199, 147, 58, 0.15)' :
											'rgba(255, 255, 255, 0.07)',
										color:
											tier === 7 ? '#B6CEE8' :
											tier === 3 ? '#C7933A' :
											'rgba(255, 255, 255, 0.5)',
									}}
								>
									T{tier}
								</span>
							)}
						</div>
					)
				},
			},
			{
				accessorKey: 'locale',
				header: 'Language',
				cell: (info) => {
					const locale = info.getValue() as string | undefined
					if (!locale) return '—'
					const localeNames: Record<string, string> = {
						en: 'English',
						es: 'Spanish',
					}
					return localeNames[locale] || locale
				},
			},
			{
				accessorKey: 'createdOn',
				header: 'Created At',
				cell: (info) => {
					const dateValue = info.getValue() as string
					try {
						const date = new Date(dateValue)
						if (isNaN(date.getTime())) return dateValue
						return format(date, 'MMM d, yyyy h:mm a')
					} catch {
						return dateValue
					}
				},
			},
			{
				id: 'primaryFrequency',
				header: 'Primary Frequency',
				accessorFn: (row) => {
					const primary = getPrimaryFrequency(row.frequencies)
					return primary ? primary.score : 0
				},
				cell: ({ row }) => {
					const primary = getPrimaryFrequency(row.original.frequencies)
					if (!primary) return <span className="text-muted-foreground">—</span>
					const color = getFrequencyColor(primary.name)
					return (
						<div className="flex items-center gap-2">
							<span
								className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
								style={{ backgroundColor: color }}
							/>
							<span className="whitespace-nowrap">
								{primary.name}
							</span>
							<span className="tabular-nums text-muted-foreground">
								{primary.score}
							</span>
							<button
								type="button"
								onClick={(e) => handleOpenBreakdown(e, row.original)}
								className="ml-auto inline-flex items-center justify-center rounded p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
								aria-label="View all frequency scores"
							>
								<BarChart3 className="h-5 w-5" />
							</button>
						</div>
					)
				},
			},
		]
	}, [handleOpenBreakdown])

	const table = useReactTable({
		data: responses,
		columns,
		state: { sorting },
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	})

	const handlePreviousPage = () => {
		if (pagination.page > 1) {
			fetchResponses(pagination.page - 1)
		}
	}

	const handleNextPage = () => {
		if (pagination.page < pagination.totalPages) {
			fetchResponses(pagination.page + 1)
		}
	}

	// Risk Mitigation: skeleton loading state prevents brief empty state flash on initial load
	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="h-10 bg-muted animate-pulse rounded" />
				<div className="h-10 bg-muted animate-pulse rounded" />
				<div className="h-10 bg-muted animate-pulse rounded" />
			</div>
		)
	}

	// Empty state only shown when not loading and no data (prevents flashing during fetch)
	if (responses.length === 0) {
		return (
			<div className="text-center py-12 text-muted-foreground">
				<p className="text-lg">No results found</p>
				<p className="text-sm mt-2">Try adjusting your filters</p>
			</div>
		)
	}

	return (
		<div className="space-y-4">
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead
										key={header.id}
										className="cursor-pointer select-none"
										onClick={header.column.getToggleSortingHandler()}
									>
										<div className="flex items-center gap-1">
											{flexRender(
												header.column.columnDef.header,
												header.getContext()
											)}
											{/* Sort indicator icons */}
											{{
												asc: <ChevronUp className="h-4 w-4" />,
												desc: <ChevronDown className="h-4 w-4" />,
											}[header.column.getIsSorted() as string] ?? null}
										</div>
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{/* Row click navigates to detail page; header clicks toggle sort independently */}
						{table.getRowModel().rows.map((row) => (
							<TableRow
								key={row.id}
								onClick={() => navigate(`/response/${row.original.id}`)}
								className="cursor-pointer transition-colors"
							>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{/* Pagination controls */}
			<div className="flex items-center justify-between">
				<div className="text-sm text-muted-foreground">
					Page {pagination.page} of {pagination.totalPages} ({pagination.total}{' '}
					total results)
				</div>
				<div className="flex gap-2">
					<Button
						onClick={handlePreviousPage}
						disabled={pagination.page === 1}
						variant="outline"
					>
						Previous
					</Button>
					<Button
						onClick={handleNextPage}
						disabled={pagination.page >= pagination.totalPages}
						variant="outline"
					>
						Next
					</Button>
				</div>
			</div>

			{/* Frequency breakdown dialog */}
			{breakdownResponse && (
				<FrequencyBreakdownDialog
					open={!!breakdownResponse}
					onOpenChange={(open) => {
						if (!open) setBreakdownResponse(null)
					}}
					frequencies={breakdownResponse.frequencies}
					userName={`${breakdownResponse.firstName} ${breakdownResponse.lastName}`}
				/>
			)}
		</div>
	)
}
