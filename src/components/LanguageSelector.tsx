import { useState } from 'react'
import { useLanguage } from './LanguageProvider'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

const languageNames: Record<string, string> = {
	en: 'English',
	es: 'Español',
	fr: 'Français',
}

export const LanguageSelector: React.FC = () => {
	const { currentLanguage, changeLanguage, availableLanguages } = useLanguage()
	const [open, setOpen] = useState(false)

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					className="inline-flex items-center gap-1.5 bg-transparent border border-off-white rounded px-3 py-1.5 text-sm text-off-white cursor-pointer uppercase tracking-wider hover:opacity-80 transition-opacity"
					aria-label="Select language"
				>
					{currentLanguage.toUpperCase()}
					<svg
						className="fill-current h-3.5 w-3.5"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
					>
						<path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
					</svg>
				</button>
			</PopoverTrigger>
			<PopoverContent
				align="end"
				className="w-36 p-1 rounded-md border border-gray-200 bg-white shadow-lg"
			>
				{availableLanguages.map((lang) => (
					<button
						key={lang}
						onClick={() => {
							changeLanguage(lang)
							setOpen(false)
						}}
						className={`w-full text-left px-3 py-2 text-sm rounded-sm cursor-pointer transition-colors ${
							lang === currentLanguage
								? 'bg-gray-100 font-semibold text-gray-900'
								: 'text-gray-700 hover:bg-gray-50'
						}`}
					>
						{languageNames[lang] ?? lang}
					</button>
				))}
			</PopoverContent>
		</Popover>
	)
}

export default LanguageSelector
