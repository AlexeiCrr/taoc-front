import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../stores/authStore'
import useAdminStore from '../stores/adminStore'
import { toast } from 'sonner'

export default function Dashboard() {
	const navigate = useNavigate()
	const user = useAuthStore((s) => s.user)
	const logout = useAuthStore((s) => s.logout)

	const {
		responses,
		pagination,
		filters,
		isLoading,
		error,
		fetchResponses,
		setFilter,
		setPage,
		clearFilters,
		exportCSV,
	} = useAdminStore()

	// Local state for inputs
	const [nameEmailInput, setNameEmailInput] = useState('')
	const [licenseCodeInput, setLicenseCodeInput] = useState('')
	const [dateInput, setDateInput] = useState('')

	// Fetch responses on mount and when filters change
	useEffect(() => {
		fetchResponses().catch((err) => {
			toast.error(err.message || 'Failed to load responses')
		})
	}, [filters])

	// Handle filter changes
	const handleApplyFilters = () => {
		if (nameEmailInput) {
			setFilter('name', nameEmailInput)
		} else {
			setFilter('name', undefined)
		}

		if (licenseCodeInput) {
			setFilter('licenseCode', licenseCodeInput)
		} else {
			setFilter('licenseCode', undefined)
		}

		if (dateInput) {
			setFilter('date', dateInput)
		} else {
			setFilter('date', undefined)
		}
	}

	const handleResetFilters = () => {
		setNameEmailInput('')
		setLicenseCodeInput('')
		setDateInput('')
		clearFilters()
	}

	const handleExportCSV = async () => {
		try {
			await exportCSV()
			toast.success('CSV exported successfully')
		} catch (err: any) {
			toast.error(err.message || 'Failed to export CSV')
		}
	}

	const handleViewReport = () => {
		// TODO: Navigate to statistics view
		toast.info('Statistics view coming soon')
	}

	// Format date for display
	const formatDate = (dateString: string) => {
		const date = new Date(dateString)
		return date.toLocaleString('en-US', {
			month: '2-digit',
			day: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			hour12: true,
		})
	}

	// Get frequency columns in specific order
	const frequencyColumns = [
		'Maven',
		'Challenger',
		'Commander',
		'Motivator',
		'Seer',
		'Professor',
		'Healer',
	]

	return (
		<div className="min-h-screen bg-[#f3f0e8] p-6">
			{/* Header */}
			<div className="mb-8 flex items-start justify-between">
				<h1 className="text-4xl font-semibold font-['PompeiPro'] text-[#212121]">
					Quiz Responses
				</h1>
				<div className="flex flex-col items-end gap-2">
					<div className="text-sm text-gray-600">
						Authorized as: <span className="font-semibold">{user?.username || user?.email}</span>
					</div>
					<button
						onClick={logout}
						className="px-4 py-2 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50"
					>
						Logout
					</button>
				</div>
			</div>

			{/* Filters */}
			<div className="mb-6 flex flex-wrap items-end gap-4">
				<div className="flex-1 min-w-[200px]">
					<input
						type="text"
						placeholder="Name/Email"
						value={nameEmailInput}
						onChange={(e) => setNameEmailInput(e.target.value)}
						onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
						className="w-full px-4 py-2 border border-gray-300 rounded bg-white"
					/>
				</div>
				<div className="flex-1 min-w-[200px]">
					<input
						type="text"
						placeholder="License Code"
						value={licenseCodeInput}
						onChange={(e) => setLicenseCodeInput(e.target.value)}
						onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
						className="w-full px-4 py-2 border border-gray-300 rounded bg-white"
					/>
				</div>
				<div className="flex-1 min-w-[200px] relative">
					<input
						type="date"
						value={dateInput}
						onChange={(e) => setDateInput(e.target.value)}
						onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
						placeholder="Choose a Date"
						className="w-full px-4 py-2 border border-gray-300 rounded bg-white"
					/>
				</div>
				<button
					onClick={handleApplyFilters}
					className="px-4 py-2 bg-[#5e6153] text-white rounded hover:bg-[#4a4c40]"
				>
					Apply
				</button>
				<button
					onClick={handleResetFilters}
					className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
				>
					Reset Filters
				</button>
			</div>

			{/* Action Buttons */}
			<div className="mb-6 flex gap-4">
				<button
					onClick={handleExportCSV}
					disabled={isLoading}
					className="px-6 py-2 bg-[#4855c4] text-white rounded hover:bg-[#3a46a8] disabled:opacity-50"
				>
					Download All Results
				</button>
				<button
					onClick={handleViewReport}
					disabled={isLoading}
					className="px-6 py-2 bg-[#4855c4] text-white rounded hover:bg-[#3a46a8] disabled:opacity-50"
				>
					View Report
				</button>
			</div>

			{/* Loading/Error State */}
			{isLoading && (
				<div className="text-center py-8">
					<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
					<p className="mt-2 text-gray-600">Loading...</p>
				</div>
			)}

			{error && (
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
					{error}
				</div>
			)}

			{/* Data Grid */}
			{!isLoading && !error && (
				<>
					<div className="bg-white border border-gray-300 rounded overflow-hidden">
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead className="bg-gray-100 border-b border-gray-300">
									<tr>
										<th
											colSpan={5}
											className="px-4 py-3 text-left font-semibold text-gray-700 border-r border-gray-300"
										>
											User Data
										</th>
										<th
											colSpan={7}
											className="px-4 py-3 text-center font-semibold text-gray-700"
										>
											Frequencies
										</th>
									</tr>
									<tr className="border-b border-gray-300">
										<th className="px-4 py-2 text-left font-medium text-gray-700">
											First Name
										</th>
										<th className="px-4 py-2 text-left font-medium text-gray-700">
											Last Name
										</th>
										<th className="px-4 py-2 text-left font-medium text-gray-700">
											Email
										</th>
										<th className="px-4 py-2 text-left font-medium text-gray-700">
											License Code
										</th>
										<th className="px-4 py-2 text-left font-medium text-gray-700 border-r border-gray-300">
											Created At
										</th>
										{frequencyColumns.map((freq) => (
											<th
												key={freq}
												className="px-4 py-2 text-center font-medium text-gray-700"
											>
												{freq}
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{responses.length === 0 ? (
										<tr>
											<td colSpan={12} className="px-4 py-8 text-center text-gray-500">
												No responses found
											</td>
										</tr>
									) : (
										responses.map((response) => (
											<tr
												key={response.id}
												onClick={() => navigate(`/dashboard/response/${response.id}`)}
												className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
											>
												<td className="px-4 py-3">{response.firstName}</td>
												<td className="px-4 py-3">{response.lastName}</td>
												<td className="px-4 py-3">{response.email}</td>
												<td className="px-4 py-3">{response.licenseCode || '-'}</td>
												<td className="px-4 py-3 border-r border-gray-200">
													{formatDate(response.createdOn)}
												</td>
												{frequencyColumns.map((freq) => (
													<td key={freq} className="px-4 py-3 text-center">
														{response.frequencies[freq] || '-'}
													</td>
												))}
											</tr>
										))
									)}
								</tbody>
							</table>
						</div>
					</div>

					{/* Pagination */}
					{pagination.totalPages > 1 && (
						<div className="mt-6 flex items-center justify-between">
							<div className="text-sm text-gray-600">
								Showing {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
								{Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
								{pagination.total} results
							</div>
							<div className="flex gap-2">
								<button
									onClick={() => setPage(pagination.page - 1)}
									disabled={pagination.page === 1}
									className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Previous
								</button>
								<div className="flex items-center gap-1">
									{Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
										.filter(
											(page) =>
												page === 1 ||
												page === pagination.totalPages ||
												Math.abs(page - pagination.page) <= 2
										)
										.map((page, index, array) => {
											const prevPage = array[index - 1]
											const showEllipsis = prevPage && page - prevPage > 1

											return (
												<div key={page} className="flex items-center gap-1">
													{showEllipsis && (
														<span className="px-2 text-gray-500">...</span>
													)}
													<button
														onClick={() => setPage(page)}
														className={`px-3 py-2 rounded ${
															page === pagination.page
																? 'bg-[#4855c4] text-white'
																: 'bg-white border border-gray-300 hover:bg-gray-50'
														}`}
													>
														{page}
													</button>
												</div>
											)
										})}
								</div>
								<button
									onClick={() => setPage(pagination.page + 1)}
									disabled={pagination.page === pagination.totalPages}
									className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Next
								</button>
							</div>
						</div>
					)}
				</>
			)}
		</div>
	)
}
