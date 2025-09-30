# Paraglide JS Internationalization Setup

This project is configured with Paraglide JS for internationalization (i18n) support.

## Configuration

- **Configuration file**: `project.inlang.json`
- **Translation files**: Located in `/messages` directory
- **Generated code**: Located in `/src/paraglide` directory (auto-generated, do not edit)
- **Supported languages**: English (en), Spanish (es), French (fr)

## Available Scripts

```bash
# Compile translations (automatically runs during dev and build)
npm run paraglide:compile

# Machine translate missing translations (requires API key)
npm run machine-translate

# Development (includes auto-compilation of translations)
npm run dev

# Build (includes translation compilation)
npm run build
```

## Usage Examples

### 1. Using translations in components

```tsx
import * as m from '../paraglide/messages'

function MyComponent() {
	return (
		<div>
			<h1>{m.welcome()}</h1>
			<button>{m.quiz_start()}</button>
		</div>
	)
}
```

### 2. Using the custom hook

```tsx
import { useTranslation } from '../hooks/useTranslation'

function MyComponent() {
	const { t } = useTranslation()

	return (
		<div>
			<h1>{t.welcome()}</h1>
			<button>{t.quiz_start()}</button>
		</div>
	)
}
```

### 3. Using translations with parameters

```tsx
import * as m from '../paraglide/messages'

function QuizQuestion({ questionNumber }) {
	return <h2>{m.quiz_question({ number: questionNumber })}</h2>
}
```

### 4. Language Selector Component

The `LanguageSelector` component is available for users to switch languages:

```tsx
import LanguageSelector from '../components/LanguageSelector'

function Header() {
	return (
		<header>
			<LanguageSelector />
		</header>
	)
}
```

## Adding New Translations

1. Add the new message key and translations to all language files in `/messages`:
   - `/messages/en.json`
   - `/messages/es.json`
   - `/messages/fr.json`

2. Run the compile command:

   ```bash
   npm run paraglide:compile
   ```

3. The new translation functions will be available in `/src/paraglide/messages.js`

## Message Format

Messages support the ICU MessageFormat syntax for pluralization and formatting:

```json
{
	"items_count": "{count, plural, =0 {No items} =1 {One item} other {# items}}"
}
```

## Language Detection

The app automatically detects the user's preferred language in this order:

1. Previously saved preference (localStorage)
2. Browser language setting
3. Default to English if browser language is not supported

## Important Notes

- The `/src/paraglide` directory is auto-generated. Never edit files in this directory directly.
- Always run `npm run paraglide:compile` after modifying translation files.
- The app requires a page reload when changing languages (this is by design for consistency).
- All translation keys must exist in all language files to avoid runtime errors.

## Troubleshooting

If translations are not updating:

1. Make sure you've saved all changes to the message files
2. Run `npm run paraglide:compile`
3. Restart the dev server with `npm run dev`
4. Clear browser cache if necessary

## Resources

- [Paraglide JS Documentation](https://inlang.com/m/gerre34r/library-inlang-paraglideJs)
- [Inlang Message Format](https://inlang.com/m/reootnfj/plugin-inlang-messageFormat)
- [ICU Message Format Syntax](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
