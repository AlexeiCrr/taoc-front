import * as React from 'react'
import { CheckIcon, ChevronsUpDown, Search } from 'lucide-react'
import * as RPNInput from 'react-phone-number-input'
import flags from 'react-phone-number-input/flags'

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

type PhoneInputProps = Omit<
	React.ComponentProps<'input'>,
	'onChange' | 'value' | 'ref'
> &
	Omit<RPNInput.Props<typeof RPNInput.default>, 'onChange'> & {
		onChange?: (value: RPNInput.Value) => void
	}

const PhoneInput: React.ForwardRefExoticComponent<PhoneInputProps> =
	React.forwardRef<
		React.ComponentRef<typeof RPNInput.default>,
		PhoneInputProps
	>(({ className, onChange, value, ...props }, ref) => {
		return (
			<RPNInput.default
				ref={ref}
				className={cn('flex', className)}
				flagComponent={FlagComponent}
				countrySelectComponent={CountrySelect}
				inputComponent={InputComponent}
				smartCaret={false}
				value={value || undefined}
				onChange={(value) => onChange?.(value || ('' as RPNInput.Value))}
				{...props}
			/>
		)
	})
PhoneInput.displayName = 'PhoneInput'

const InputComponent = React.forwardRef<
	HTMLInputElement,
	React.ComponentProps<'input'>
>(({ className, ...props }, ref) => (
	<input
		className={cn(
			'flex h-auto w-full bg-transparent py-3 px-4 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
			className
		)}
		{...props}
		ref={ref}
	/>
))
InputComponent.displayName = 'InputComponent'

type CountryEntry = { label: string; value: RPNInput.Country | undefined }

type CountrySelectProps = {
	disabled?: boolean
	value: RPNInput.Country
	options: CountryEntry[]
	onChange: (country: RPNInput.Country) => void
}

// Memoized country item to prevent re-renders
const CountryItem = React.memo(
	({
		country,
		label,
		isSelected,
		onSelect,
	}: {
		country: RPNInput.Country
		label: string
		isSelected: boolean
		onSelect: () => void
	}) => (
		<button
			type="button"
			className={cn(
				'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none',
				'cursor-pointer hover:bg-accent hover:text-accent-foreground',
				isSelected && 'bg-accent'
			)}
			onClick={onSelect}
		>
			<FlagComponent country={country} countryName={label} />
			<span className="flex-1 text-left">{label}</span>
			<span className="text-foreground/50">{`+${RPNInput.getCountryCallingCode(country)}`}</span>
			{isSelected && <CheckIcon className="ml-auto size-4" />}
		</button>
	)
)
CountryItem.displayName = 'CountryItem'

const CountrySelect = ({
	disabled,
	value: selectedCountry,
	options: countryList,
	onChange,
}: CountrySelectProps) => {
	const [searchValue, setSearchValue] = React.useState('')
	const [isOpen, setIsOpen] = React.useState(false)
	const [visibleCount, setVisibleCount] = React.useState(20)
	const searchInputRef = React.useRef<HTMLInputElement>(null)
	const listRef = React.useRef<HTMLDivElement>(null)

	const filteredCountries = React.useMemo(() => {
		if (!searchValue) return countryList
		const lower = searchValue.toLowerCase()
		return countryList.filter(
			({ label, value }) =>
				value &&
				(label.toLowerCase().includes(lower) ||
					`+${RPNInput.getCountryCallingCode(value)}`.includes(lower))
		)
	}, [countryList, searchValue])

	// Reset visible count when search changes or dropdown opens
	React.useEffect(() => {
		setVisibleCount(20)
	}, [searchValue, isOpen])

	// Load more items on scroll
	const handleScroll = React.useCallback(() => {
		const list = listRef.current
		if (!list) return
		const { scrollTop, scrollHeight, clientHeight } = list
		// Load more when scrolled to 80% of the list
		if (scrollTop + clientHeight >= scrollHeight * 0.8) {
			setVisibleCount((prev) =>
				Math.min(prev + 20, filteredCountries.length)
			)
		}
	}, [filteredCountries.length])

	const visibleCountries = filteredCountries.slice(0, visibleCount)

	return (
		<Popover
			open={isOpen}
			modal
			onOpenChange={(open) => {
				setIsOpen(open)
				if (open) {
					setSearchValue('')
					setVisibleCount(20)
					setTimeout(() => searchInputRef.current?.focus(), 0)
				}
			}}
		>
			<PopoverTrigger asChild>
				<button
					type="button"
					className={cn(
						'flex items-center gap-1 px-3 outline-none transition-colors',
						'border-r border-border-input',
						disabled && 'pointer-events-none opacity-50'
					)}
					disabled={disabled}
				>
					<FlagComponent
						country={selectedCountry}
						countryName={selectedCountry}
					/>
					<ChevronsUpDown
						className={cn(
							'size-4 opacity-50',
							disabled ? 'hidden' : 'opacity-100'
						)}
					/>
				</button>
			</PopoverTrigger>
			<PopoverContent className="w-[300px] p-0" align="start">
				<div className="flex items-center border-b px-3">
					<Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
					<input
						ref={searchInputRef}
						value={searchValue}
						onChange={(e) => setSearchValue(e.target.value)}
						placeholder="Search country..."
						className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
					/>
				</div>
				<div
					ref={listRef}
					className="max-h-72 overflow-y-auto p-1"
					onScroll={handleScroll}
				>
					{filteredCountries.length === 0 ? (
						<p className="py-6 text-center text-sm text-muted-foreground">
							No country found.
						</p>
					) : (
						visibleCountries.map(
							({ value, label }) =>
								value && (
									<CountryItem
										key={value}
										country={value}
										label={label}
										isSelected={value === selectedCountry}
										onSelect={() => {
											onChange(value)
											setIsOpen(false)
										}}
									/>
								)
						)
					)}
				</div>
			</PopoverContent>
		</Popover>
	)
}

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
	const Flag = flags[country]

	return (
		<span className="flex h-4 w-6 overflow-hidden rounded-sm bg-foreground/20 [&_svg:not([class*='size-'])]:size-full">
			{Flag && <Flag title={countryName} />}
		</span>
	)
}

export { PhoneInput }
