import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import type { FrequencyMap } from '@/types/admin.types'
import { getFrequencyColor } from '@/utils/chartUtils'

interface FrequencyBreakdownDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	frequencies: FrequencyMap
	userName: string
}

export default function FrequencyBreakdownDialog({
	open,
	onOpenChange,
	frequencies,
	userName,
}: FrequencyBreakdownDialogProps) {
	const sorted = Object.entries(frequencies).sort(([nameA, scoreA], [nameB, scoreB]) => {
		if (scoreB !== scoreA) return scoreB - scoreA
		return nameA.localeCompare(nameB)
	})

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="text-base font-medium">
						{userName} — Frequency Scores
					</DialogTitle>
				</DialogHeader>
				<div className="space-y-4 pt-2">
					{sorted.map(([name, score], index) => (
						<div
							key={name}
							className="space-y-1"
							style={{
								animationName: 'fadeSlideIn',
								animationDuration: '0.3s',
								animationDelay: `${index * 50}ms`,
								animationFillMode: 'both',
								animationTimingFunction: 'ease-out',
							}}
						>
							<div className="flex items-center justify-between text-sm">
								<span className="font-medium">{name}</span>
								<span className="tabular-nums text-muted-foreground">
									{score}
								</span>
							</div>
							<div className="h-2 w-full rounded-full bg-muted overflow-hidden">
								<div
									className="h-full rounded-full transition-all duration-700 ease-out"
									style={{
										width: `${score}%`,
										backgroundColor: getFrequencyColor(name),
										animationName: 'barGrow',
										animationDuration: '0.6s',
										animationDelay: `${150 + index * 50}ms`,
										animationFillMode: 'both',
										animationTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
									}}
								/>
							</div>
						</div>
					))}
				</div>
			</DialogContent>
		</Dialog>
	)
}
