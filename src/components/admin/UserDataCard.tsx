import LoadingSpinner from '@/components/common/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { adminApi } from '@/services/api'
import { useState } from 'react'
import { toast } from 'sonner'

interface UserDataCardProps {
	responseId: number
	firstName: string
	lastName: string
	email: string
	licenseCode?: string
	licenseTier?: number
	onDataUpdated: () => void
}

export default function UserDataCard({
	responseId,
	firstName,
	lastName,
	email,
	licenseCode,
	licenseTier,
	onDataUpdated,
}: UserDataCardProps) {
	const [isEditing, setIsEditing] = useState(false)
	const [isSaving, setIsSaving] = useState(false)

	const [editedFirstName, setEditedFirstName] = useState(firstName)
	const [editedLastName, setEditedLastName] = useState(lastName)
	const [editedEmail, setEditedEmail] = useState(email)

	const validateEmail = (email: string): boolean => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		return emailRegex.test(email)
	}

	const isFormValid = (): boolean => {
		return (
			editedFirstName.trim() !== '' &&
			editedLastName.trim() !== '' &&
			editedEmail.trim() !== '' &&
			validateEmail(editedEmail)
		)
	}

	const handleEdit = () => {
		setEditedFirstName(firstName)
		setEditedLastName(lastName)
		setEditedEmail(email)
		setIsEditing(true)
	}

	const handleCancel = () => {
		setEditedFirstName(firstName)
		setEditedLastName(lastName)
		setEditedEmail(email)
		setIsEditing(false)
	}

	const handleSave = async () => {
		if (!isFormValid()) return

		setIsSaving(true)

		try {
			await adminApi
				.put(`responses/${responseId}`, {
					json: {
						firstName: editedFirstName.trim(),
						lastName: editedLastName.trim(),
						email: editedEmail.trim(),
					},
				})
				.json()

			toast.success('User data updated successfully')
			setIsEditing(false)
			onDataUpdated()
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to update user data'
			toast.error(errorMessage)
		} finally {
			setIsSaving(false)
		}
	}

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle>User Information</CardTitle>
				{!isEditing && <Button onClick={handleEdit}>Edit</Button>}
			</CardHeader>
			<CardContent>
				{!isEditing ? (
					<div className="space-y-4">
						<div>
							<label className="text-sm font-medium text-muted-foreground">
								First Name
							</label>
							<p className="text-base">{firstName}</p>
						</div>
						<div>
							<label className="text-sm font-medium text-muted-foreground">
								Last Name
							</label>
							<p className="text-base">{lastName}</p>
						</div>
						<div>
							<label className="text-sm font-medium text-muted-foreground">
								Email
							</label>
							<p className="text-base">{email}</p>
						</div>
						<div>
							<label className="text-sm font-medium text-muted-foreground">
								License Code
							</label>
							<p className="text-base">{licenseCode ?? 'Not available'}</p>
						</div>
						<div>
							<label className="text-sm font-medium text-muted-foreground">
								License Tier
							</label>
							<p className="text-base">{licenseTier ?? 'Not available'}</p>
						</div>
					</div>
				) : (
					<div className="space-y-4">
						<div>
							<label
								htmlFor="firstName"
								className="text-sm font-medium mb-1.5 block"
							>
								First Name
							</label>
							<Input
								id="firstName"
								type="text"
								value={editedFirstName}
								onChange={(e) => setEditedFirstName(e.target.value)}
								disabled={isSaving}
							/>
						</div>
						<div>
							<label
								htmlFor="lastName"
								className="text-sm font-medium mb-1.5 block"
							>
								Last Name
							</label>
							<Input
								id="lastName"
								type="text"
								value={editedLastName}
								onChange={(e) => setEditedLastName(e.target.value)}
								disabled={isSaving}
							/>
						</div>
						<div>
							<label
								htmlFor="email"
								className="text-sm font-medium mb-1.5 block"
							>
								Email
							</label>
							<Input
								id="email"
								type="email"
								value={editedEmail}
								onChange={(e) => setEditedEmail(e.target.value)}
								disabled={isSaving}
							/>
						</div>
						<div className="flex gap-2">
							<Button
								onClick={handleSave}
								disabled={!isFormValid() || isSaving}
							>
								{isSaving ? <LoadingSpinner size="sm" /> : 'Save'}
							</Button>
							<Button
								onClick={handleCancel}
								variant="outline"
								disabled={isSaving}
							>
								Cancel
							</Button>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	)
}
