/**
 * Admin dialog for generating license codes.
 *
 * Allows admins to generate 1-10,000 license codes for specified tier (1/3/7),
 * downloaded as CSV with timestamp filename. Dialog locks during generation to
 * prevent premature closure. Validates amount range and content-type before download.
 *
 * Usage:
 *   <ManageLicensesDialog>
 *     <Button>Manage Licenses</Button>
 *   </ManageLicensesDialog>
 *
 * CSV format: "code,license_tier" with one header row
 * Filename: license_codes_YYYY-MM-DD.csv
 *
 * Error handling: Range validation before API call, content-type validation after
 */
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { apiService } from '@/services/api'
import { LicenseTier } from '@/services/licenseApi'
import { toast } from 'sonner'

interface ManageLicensesDialogProps {
	children: React.ReactNode
}

export default function ManageLicensesDialog({ children }: ManageLicensesDialogProps) {
	const [open, setOpen] = useState(false)
	const [amount, setAmount] = useState(100)
	const [licenseTier, setLicenseTier] = useState<LicenseTier>(LicenseTier.TIER_3)
	const [isLoading, setIsLoading] = useState(false)

	/**
	 * Trigger browser download for blob.
	 *
	 * Creates temporary object URL, simulates link click, then cleans up.
	 * URL revocation prevents memory leak from blob references.
	 *
	 * @param blob Binary data to download (typically CSV)
	 * @param filename Download filename (e.g., "license_codes_2025-01-15.csv")
	 */
	const downloadBlob = (blob: Blob, filename: string) => {
		const url = window.URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.href = url
		link.download = filename
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
		window.URL.revokeObjectURL(url)  // Prevent memory leak
	}

	const handleGenerate = async () => {
		// Client-side validation prevents unnecessary API calls for invalid amounts
		if (amount < 1 || amount > 10000) {
			toast.error('Invalid amount', {
				description: 'Please enter a number between 1 and 10,000'
			})
			return
		}

		setIsLoading(true)
		try {
			const blob = await apiService.generateLicenses(amount, licenseTier)
			// Timestamp in filename enables chronological sorting of downloaded files
			const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]
			downloadBlob(blob, `license_codes_${timestamp}.csv`)

			toast.success('License codes generated', {
				description: `Successfully generated ${amount} license code${amount > 1 ? 's' : ''}`
			})
			// Reset to defaults after successful generation for next use
			setOpen(false)
			setAmount(100)
			setLicenseTier(LicenseTier.TIER_3)
		} catch (error) {
			console.error('Failed to generate licenses:', error)
			toast.error('Failed to generate licenses', {
				description: error instanceof Error ? error.message : 'An unexpected error occurred'
			})
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={isLoading ? undefined : setOpen}>  {/* Lock dialog during API call to prevent premature closure */}
			<DialogTrigger asChild>
				{children}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Generate License Codes</DialogTitle>
					<DialogDescription>
						Generate and download license codes as a CSV file.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="amount">Number of Licenses</Label>
						<Input
							id="amount"
							type="number"
							min={1}
							max={10000}
							value={amount}
							onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
							disabled={isLoading}
						/>
						<p className="text-sm text-muted-foreground">
							Enter a number between 1 and 10,000
						</p>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="tier">License Tier</Label>
						<Select
							value={licenseTier.toString()}
							onValueChange={(value) => setLicenseTier(parseInt(value) as LicenseTier)}
							disabled={isLoading}
						>
							<SelectTrigger id="tier">
								<SelectValue placeholder="Select tier" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value={LicenseTier.TIER_1.toString()}>Tier 1</SelectItem>
								<SelectItem value={LicenseTier.TIER_3.toString()}>Tier 3</SelectItem>
								<SelectItem value={LicenseTier.TIER_7.toString()}>Tier 7</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => setOpen(false)}
						disabled={isLoading}
					>
						Cancel
					</Button>
					<Button
						type="button"
						onClick={handleGenerate}
						disabled={isLoading}
					>
						{isLoading ? 'Generating...' : 'Generate & Download'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
