import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useAuthStore from '../stores/authStore'
import useAdminStore from '../stores/adminStore'
import { toast } from 'sonner'
import {
	Button,
	Input,
	Label,
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogTrigger,
} from '../components/ui'

export default function ResponseDetail() {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()
	const user = useAuthStore((s) => s.user)
	const logout = useAuthStore((s) => s.logout)

	const {
		selectedResponse,
		isLoading,
		error,
		fetchResponseById,
		updateUserData,
		resendEmail,
	} = useAdminStore()

	const [dialogOpen, setDialogOpen] = useState(false)
	const [firstName, setFirstName] = useState('')
	const [lastName, setLastName] = useState('')
	const [email, setEmail] = useState('')

	// Fetch response on mount
	useEffect(() => {
		if (id) {
			fetchResponseById(parseInt(id)).catch((err) => {
				toast.error(err.message || 'Failed to load response')
			})
		}
	}, [id])

	// Update form values when response is loaded
	useEffect(() => {
		if (selectedResponse) {
			setFirstName(selectedResponse.firstName)
			setLastName(selectedResponse.lastName)
			setEmail(selectedResponse.email)
		}
	}, [selectedResponse])

	const handleSaveUserData = async () => {
		if (!selectedResponse) return

		try {
			await updateUserData({
				responseId: selectedResponse.id,
				firstName,
				lastName,
				email,
			})
			setDialogOpen(false)
			toast.success('User data updated successfully')
		} catch (err: any) {
			toast.error(err.message || 'Failed to update user data')
		}
	}

	const handleCancelEdit = () => {
		if (selectedResponse) {
			setFirstName(selectedResponse.firstName)
			setLastName(selectedResponse.lastName)
			setEmail(selectedResponse.email)
		}
		setDialogOpen(false)
	}

	const handleOpenDialog = () => {
		if (selectedResponse) {
			setFirstName(selectedResponse.firstName)
			setLastName(selectedResponse.lastName)
			setEmail(selectedResponse.email)
		}
		setDialogOpen(true)
	}

	const handleResendEmail = async () => {
		if (!selectedResponse) return

		try {
			await resendEmail(selectedResponse.id)
			toast.success('Email resent successfully')
		} catch (err: any) {
			toast.error(err.message || 'Failed to resend email')
		}
	}

	const handleDownloadPDF = () => {
		// TODO: Implement PDF download
		toast.info('PDF download coming soon')
	}

	// Sort frequencies by value (descending)
	const getSortedFrequencies = () => {
		if (!selectedResponse?.frequencies) return []

		return Object.entries(selectedResponse.frequencies)
			.map(([name, value]) => ({ name, value: parseInt(value) }))
			.sort((a, b) => b.value - a.value)
	}

	if (isLoading) {
		return (
			<div className="min-h-screen bg-[#f3f0e8] p-6">
				<div className="text-center py-8">
					<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
					<p className="mt-2 text-gray-600">Loading...</p>
				</div>
			</div>
		)
	}

	if (error || !selectedResponse) {
		return (
			<div className="min-h-screen bg-[#f3f0e8] p-6">
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
					{error || 'Response not found'}
				</div>
				<Button onClick={() => navigate('/dashboard')} variant="outline">
					Back to Dashboard
				</Button>
			</div>
		)
	}

	const sortedFrequencies = getSortedFrequencies()

	return (
		<div className="min-h-screen bg-[#f3f0e8] p-6">
			{/* Header */}
			<div className="mb-8 flex items-start justify-between">
				<button
					onClick={() => navigate('/dashboard')}
					className="flex items-center gap-2 text-[#4855c4] hover:text-[#3a46a8] font-medium"
				>
					<svg
						width="20"
						height="20"
						viewBox="0 0 20 20"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M12.5 15L7.5 10L12.5 5"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
					RESPONSES LIST
				</button>
				<div className="flex items-center gap-4">
					<div className="text-sm text-gray-600">
						Authorized as: <span className="font-semibold">{user?.username || user?.email}</span>
					</div>
					<Button onClick={logout} variant="outline" size="sm">
						Logout
					</Button>
				</div>
			</div>

			<div className="max-w-5xl">
				<div className="grid md:grid-cols-2 gap-6">
					{/* User Data Section */}
					<div className="bg-white border border-gray-300 rounded p-6">
						<h2 className="text-xl font-semibold mb-4">User Data</h2>
						<div className="space-y-3">
							<div>
								<span className="text-gray-600">First Name: </span>
								<span className="font-semibold">{selectedResponse.firstName}</span>
							</div>
							<div>
								<span className="text-gray-600">Last Name: </span>
								<span className="font-semibold">{selectedResponse.lastName}</span>
							</div>
							<div>
								<span className="text-gray-600">Email: </span>
								<span className="font-semibold">{selectedResponse.email}</span>
							</div>
						</div>

						<div className="mt-6 space-y-3">
							<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
								<DialogTrigger asChild>
									<Button
										onClick={handleOpenDialog}
										variant="outline"
										className="w-full"
									>
										CHANGE USER DATA
									</Button>
								</DialogTrigger>
								<DialogContent className="sm:max-w-md">
									<DialogHeader>
										<DialogTitle>Edit User Data</DialogTitle>
									</DialogHeader>
									<div className="space-y-4">
										<div>
											<Label htmlFor="edit-firstName" required>
												First Name
											</Label>
											<Input
												id="edit-firstName"
												type="text"
												value={firstName}
												onChange={(e) => setFirstName(e.target.value)}
											/>
										</div>
										<div>
											<Label htmlFor="edit-lastName" required>
												Last Name
											</Label>
											<Input
												id="edit-lastName"
												type="text"
												value={lastName}
												onChange={(e) => setLastName(e.target.value)}
											/>
										</div>
										<div>
											<Label htmlFor="edit-email" required>
												Email
											</Label>
											<Input
												id="edit-email"
												type="email"
												value={email}
												onChange={(e) => setEmail(e.target.value)}
											/>
										</div>
									</div>
									<DialogFooter>
										<Button onClick={handleCancelEdit} variant="outline">
											Cancel
										</Button>
										<Button
											onClick={handleSaveUserData}
											disabled={isLoading}
											variant="primary"
										>
											Save
										</Button>
									</DialogFooter>
								</DialogContent>
							</Dialog>

							<Button
								onClick={handleResendEmail}
								disabled={isLoading}
								variant="outline"
								className="w-full"
							>
								RESEND RESULTS EMAIL
							</Button>

							<Button
								onClick={handleDownloadPDF}
								variant="outline"
								className="w-full"
							>
								DOWNLOAD RESULTS PDF
							</Button>
						</div>
					</div>

					{/* Frequencies Section */}
					<div className="bg-white border border-gray-300 rounded p-6">
						<h2 className="text-xl font-semibold mb-4">Frequencies</h2>
						<div className="space-y-2">
							{sortedFrequencies.map(({ name, value }) => (
								<div
									key={name}
									className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0"
								>
									<span className="text-gray-700">{name}</span>
									<span className="font-semibold">{value}</span>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Answers Section */}
				{selectedResponse.answers && selectedResponse.answers.length > 0 && (
					<div className="mt-6 bg-white border border-gray-300 rounded p-6">
						<h2 className="text-xl font-semibold mb-4">Answers</h2>
						<div className="space-y-4">
							{selectedResponse.answers.map((answer, index) => (
								<div key={answer.id} className="border-b border-gray-200 pb-4 last:border-0">
									<div className="flex justify-between items-start mb-2">
										<span className="text-sm font-medium text-gray-600">
											Question {index + 1}
										</span>
										<span className="text-sm font-semibold text-[#4855c4]">
											{answer.frequencyName}
										</span>
									</div>
									<p className="text-gray-700 mb-2">{answer.description}</p>
									<div className="text-sm text-gray-600">
										Value: <span className="font-semibold">{answer.value}</span>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
