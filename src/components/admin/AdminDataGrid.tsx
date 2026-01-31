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
import type { AdminResponse } from '@/types/admin.types'
import {
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnDef,
	type SortingState,
} from '@tanstack/react-table'
import { format } from 'date-fns'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AdminDataGrid() {
	const { responses, pagination, isLoading, fetchResponses } = useAdminStore()
	const navigate = useNavigate()
	const [sorting, setSorting] = useState<SortingState>([])

	// Decision Log: Dynamic frequency columns (API schema has arbitrary keys, prevents desync)
	// Invariant: alphabetical ordering for predictable user experience
	const frequencyNames = useMemo(() => {
		if (responses.length === 0) return []
		const firstResponse = responses[0]
		return Object.keys(firstResponse.frequencies).sort()
	}, [responses])

	// Invariant: User Data columns before Frequency columns (matches requirement specification)
	const columns = useMemo<ColumnDef<AdminResponse>[]>(() => {
		const userDataColumns: ColumnDef<AdminResponse>[] = [
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
				// Em dash for null values (better visual indicator than empty cell)
				cell: (info) => info.getValue() || '—',
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
				// Decision Log: date-fns formatting (handles timezone edge cases, improves readability)
				// Error handling prevents grid crash from malformed API dates
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
		]

		// Decision Log: Dynamic generation prevents coupling frontend to backend frequency types
		const frequencyColumns: ColumnDef<AdminResponse>[] = frequencyNames.map(
			(frequencyName) => ({
				id: `frequency-${frequencyName}`,
				header: frequencyName,
				accessorFn: (row) => row.frequencies[frequencyName],
				cell: (info) => {
					const score = info.getValue() as number | null | undefined
					// Handle null/undefined gracefully (incomplete quiz responses)
					if (score === null || score === undefined)
						return <span className="text-muted-foreground">—</span>
					// Risk Mitigation: tabular-nums ensures consistent digit width for large scores
					return <span className="tabular-nums">{score}</span>
				},
				// Risk Mitigation: min-w-[80px] accommodates 4-digit scores without breaking layout
				minSize: 80,
			})
		)

		return [...userDataColumns, ...frequencyColumns]
	}, [frequencyNames])

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
		</div>
	)
}
