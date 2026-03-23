# taoc-front — Quiz Frontend

## Quick Reference

```bash
npm run dev                # Vite dev server
npm run build              # paraglide compile + tsc + vite build
npx tsc --noEmit           # Type check (run before every commit)
npm run paraglide:compile  # Regenerate i18n runtime
npm run machine-translate  # Auto-translate missing keys
```

## Module Map

```
src/
├── App.tsx                     # React Router v7 routes (lazy-loaded)
├── main.tsx                    # Entry point
│
├── pages/
│   ├── Home.tsx                # Landing hero → /quiz-start
│   ├── QuizStart.tsx           # License + user data entry
│   ├── Quiz.tsx                # Question loop orchestrator
│   ├── Results.tsx             # Frequency results + PDF download
│   ├── EmailResults.tsx        # Token-based public results view
│   ├── UpgradeSuccess.tsx      # Stripe success page
│   ├── UpgradeCancel.tsx       # Stripe cancel page
│   ├── PDFPreview.tsx          # Debug/test page for PDF rendering
│   └── PostHogTest.tsx         # Debug/test page for analytics events
│
├── components/
│   ├── quiz/                   # Quiz flow components
│   │   ├── QuizContainer.tsx   # Main orchestrator (transitions, state)
│   │   ├── GreetingForm.tsx    # License validation + user details (debounced 500ms)
│   │   ├── QuestionCard.tsx    # Rating buttons 1-5 + slide animation
│   │   ├── FrequencyMap.tsx    # Triangular visualization (html2canvas capture)
│   │   ├── ResultsPDF.tsx      # @react-pdf/renderer document
│   │   ├── HeroSection.tsx     # Home page hero
│   │   ├── QuizProgressBar.tsx
│   │   ├── QuizButton.tsx      # Styled quiz action button
│   │   ├── QuizHeader.tsx      # Quiz page header
│   │   ├── QuizFooter.tsx      # Quiz page footer
│   │   ├── QuizLayout.tsx      # Quiz page layout wrapper
│   │   └── frequencyMapTemplate.ts  # HTML template for frequency visualization
│   │
│   ├── checkout/               # Stripe upgrade flow
│   │   ├── UpgradeCard.tsx
│   │   ├── TierFeatureList.tsx
│   │   └── PaymentErrorBoundary.tsx
│   │
│   ├── common/                 # Shared layout + utility components
│   │   ├── Layout.tsx          # Quiz page wrapper
│   │   ├── ErrorMessage.tsx    # Error + retry button
│   │   ├── LoadingSpinner.tsx  # sm/md/lg sizes
│   │   ├── PageTransition.tsx  # Route transition animation
│   │   └── ProgressBar.tsx
│   │
│   ├── layout/                 # App-level layout
│   │   └── MainLayout.tsx      # Header/nav/footer wrapper
│   │
│   ├── ui/                     # shadcn/ui primitives
│   │   ├── button, card, input, label, select, table, dialog
│   │   ├── popover, alert, calendar, command, scroll-area
│   │   ├── skeleton, tooltip, phone-input
│   │   └── (Radix UI based, installed via shadcn CLI)
│   │
│   ├── LanguageProvider.tsx    # Paraglide i18n context
│   ├── LanguageSelector.tsx    # Language dropdown switcher
│   ├── PostHogProvider.tsx     # Analytics init
│   ├── ThemeProvider.tsx       # Dark/light mode theme context
│   ├── EnglishRedirect.tsx     # /en/* → /* path normalization
│   ├── LocaleLink.tsx          # Auto-localizes href
│   └── LocaleLayout.tsx        # Locale route wrapper
│
├── stores/                     # Zustand state management
│   └── quizStore.ts            # Quiz state (persisted → sessionStorage)
│
├── services/
│   ├── api.ts                  # Ky HTTP client (publicApi with x-api-key)
│   ├── licenseApi.ts           # License validation
│   ├── posthog.ts              # Event tracking helpers
│   └── stripeService.ts        # Checkout session creation
│
├── types/
│   └── quiz.types.ts           # Question, Answer, UserData, Frequency, QuizResponse
│
├── hooks/
│   ├── useLanguage.ts          # Current language + changeLanguage()
│   ├── useLocaleNavigate.ts    # Navigate with locale prefix
│   └── useTranslation.ts       # Wrapper around paraglide messages
│
├── utils/
│   ├── chartUtils.ts           # Frequency color mapping
│   ├── captureFrequencyMap.tsx  # html2canvas → base64 PNG
│   └── lib/utils.ts            # cn() utility + language constants
│
├── paraglide/                  # Generated i18n (DO NOT edit manually)
│   ├── runtime.ts              # Locale detection, localizeHref, setLocale
│   └── messages.ts             # Typed message functions
│
└── styles/
    ├── index.css               # Tailwind + @theme (custom colors, fonts)
    ├── GreetingForm.css        # Quiz form styles
    ├── QuestionCard.css        # Rating button animations
    └── QuizProgressBar.css
```

## Routing

```
# Locale-aware: /es/quiz, /en/quiz → redirects via EnglishRedirect
# LocaleLayout wraps all quiz routes

# Public (quiz flow)
/{locale}/                    → Home (hero)
/{locale}/quiz-start          → QuizStart (greeting form)
/{locale}/quiz                → Quiz (question loop)
/{locale}/results             → Results (PDF download)
/{locale}/results/:token      → EmailResults (public via token)
/{locale}/upgrade/success     → Stripe success
/{locale}/upgrade/cancel      → Stripe cancel

# Debug (lazy-loaded, no locale)
/pdf-preview                  → PDFPreview (PDF rendering test)
/posthog-test                 → PostHogTest (analytics test)
```

## State Management (Zustand)

### quizStore (persisted → sessionStorage `quiz-storage`)
```ts
// State
questions: Question[], currentQuestionIndex, answers: Answer[]
userData: UserData | null, quizResponse: QuizResponse | null

// Key actions
fetchQuestions(locale?)          // GET /questions → resets answers
setUserData(userData)            // From GreetingForm
answerQuestion(value)            // 1-5 rating for current question
goToPreviousQuestion() / goToNextQuestion()
submitQuiz()                     // POST /responses → stores quizResponse
resetQuiz()                      // Clears everything + sessionStorage

// Computed
progress(), currentQuestion(), isComplete(), canGoBack(), canGoForward()
```

## API Layer (Ky HTTP Client)

Single Ky instance in `services/api.ts`:

| Client | Auth | Use |
|--------|------|-----|
| `publicApi` | `x-api-key` header | Quiz endpoints (questions, responses, license check) |

Retry 2x on GET (408, 429, 5xx), 30s timeout.

## i18n — Paraglide.js

**Locales:** en (default), es, fr
**Message files:** `messages/en.json`, `messages/es.json`, `messages/fr.json`
**Build step:** `paraglide-js compile` generates `src/paraglide/`

**Usage:**
```tsx
import * as m from '@/paraglide/messages'

<h1>{m['quiz.greeting.title']()}</h1>
<p>{m['pdf.greeting']({ firstName: 'John', lastName: 'Doe' })}</p>
```

**Locale detection:** derived from URL path (`/es/quiz` → es). LanguageProvider wraps app, provides `changeLanguage()`.

**Components:** `LocaleLink` (auto-localizes href), `useLocaleNavigate()` (locale-aware navigate), `LanguageSelector` (dropdown).

## Theme & Styling

**Tailwind CSS 4** with custom `@theme` in index.css:

| Token | Value | Use |
|-------|-------|-----|
| `--color-main` | #5e6153 | Primary olive/brown |
| `--color-off-white` | #f3f0e8 | Background |
| `--color-black` | #212121 | Text |
| `--color-error` | #dc2626 | Error states |
| `--color-success` | #10b981 | Success states |

**Fonts:** PompeiPro (display), Helvetica (forms), Silka (headings), Roboto (admin)

**Frequency colors** (chartUtils.ts):
```ts
{ Motivator: '#E4892E', Maven: '#C7933A', Commander: '#BDBCC1',
  Challenger: '#B84C35', Healer: '#676652', Professor: '#9D8266', Seer: '#B6CEE8' }
```

## Key Patterns

### Forms
- GreetingForm: local state + manual validation (no Zod), debounced license check (500ms)
- Disabled submit until all validations pass

### Loading / Error / Empty states
- `LoadingSpinner` (sm/md/lg) for loading
- `ErrorMessage` (message + retry button) for errors
- Conditional rendering: `if (error && !data) → ErrorMessage`

### PDF Generation
- `@react-pdf/renderer` generates in-memory blob
- ResultsPDF: greeting, frequency grid with S3 images, descriptions, workbook link, footer
- Optional 2nd page: frequency map (captured via html2canvas)
- Download: blob URL → click link → revoke URL

### Quiz Flow
1. Home → /quiz-start → GreetingForm (license + user data)
2. Quiz → QuestionCard × N with slide animation (200ms transition)
3. Submit → POST /responses → Results page
4. Results → PDF download + frequency map visualization

## Environment Variables

```
VITE_API_URL                    # Backend API base URL
VITE_API_KEY                    # API key for publicApi
VITE_PUBLIC_POSTHOG_KEY         # PostHog API key (optional)
VITE_PUBLIC_POSTHOG_HOST        # PostHog host (optional)
```

## Vite Config

```ts
// Path alias: '@' → src/
// Plugins: paraglideVitePlugin, react (SWC)
// Polyfills: global → globalThis, buffer
// Pre-bundled: buffer, pako (for PDF/CSV)
```

## Adding a New Page — Checklist

1. Create page component in `pages/` with loading + error + empty states
2. Add lazy-loaded route in `App.tsx` (inside LocaleLayout for public)
3. Add i18n keys to `messages/en.json` + `messages/es.json`
4. Run `npm run paraglide:compile` to regenerate runtime
5. Use existing stores or create new Zustand store if needed
6. Use `publicApi` from `services/api.ts`
7. Follow existing component patterns (Props interface, cn() for classnames)
8. Run `npx tsc --noEmit`
