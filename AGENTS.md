# taoc-front — Codex Review Guidelines

## Type Check

```bash
cd taoc-front && npx tsc --noEmit
```

Must pass with zero errors before approving.

## Review Checklist

### Components

- [ ] Every component has an explicit `Props` interface (not inline types)
- [ ] Loading state handled (LoadingSpinner or skeleton)
- [ ] Error state handled (ErrorMessage with retry, or conditional render)
- [ ] Empty state handled (meaningful message when data array is empty)
- [ ] `cn()` used for conditional classnames — not string concatenation
- [ ] No `any` types — TypeScript strict mode

### State Management (Zustand)

- [ ] New store state is minimal — no derived data stored (compute it)
- [ ] Async actions have try/catch with `error` state set on failure
- [ ] `isLoading` set to `true` before async call, `false` in finally
- [ ] Store actions don't call other stores directly — use component-level coordination
- [ ] quizStore: answers array is sparse (indexed by question) — no off-by-one bugs

### API Layer (Ky)

- [ ] All endpoints use `publicApi` (API key auth) — there is no admin API in this project
- [ ] Error responses handled — not just swallowed
- [ ] Response types match backend DTOs

### Routing

- [ ] Public quiz routes inside `LocaleLayout` wrapper
- [ ] Lazy-loaded with `React.lazy()` + `Suspense`
- [ ] Navigation uses `useLocaleNavigate()` for quiz routes (preserves locale prefix)
- [ ] No hardcoded locale paths (use `localizeHref()` or `LocaleLink`)

### i18n (Paraglide)

- [ ] All user-facing strings use `m['key']()` from paraglide/messages — no hardcoded text
- [ ] Keys added to both `messages/en.json` AND `messages/es.json`
- [ ] Parameterized messages use correct variable names: `m['key']({ firstName: '...' })`
- [ ] `npm run paraglide:compile` run after adding new keys

### Styling

- [ ] Mobile-first Tailwind (base styles for mobile, `sm:`/`md:`/`lg:` for larger)
- [ ] Colors use theme tokens (`text-main`, `bg-off-white`) — not hardcoded hex
- [ ] Frequency colors from `chartUtils.ts` — don't define new color maps
- [ ] shadcn/ui primitives used where available (Button, Card, Dialog, etc.)
- [ ] Custom CSS only in dedicated `.css` files — not inline `<style>` blocks

### PDF Generation

- [ ] Uses `@react-pdf/renderer`
- [ ] Contact footer shows `info@thesevenfrequencies.com`
- [ ] Frequency images from S3 base URL — not local assets
- [ ] Workbook links tier-aware (tier 1/3: frequency-specific, tier 7: full workbook)

### Security

- [ ] No secrets in client code (API keys via `VITE_*` env vars only)
- [ ] Access tokens from URL params (quiz results) validated server-side
- [ ] No `dangerouslySetInnerHTML` without sanitization

## Common Patterns to Verify

### Store action pattern
```ts
fetchData: async () => {
  set({ isLoading: true, error: null });
  try {
    const data = await api.get(...).json();
    set({ data, isLoading: false });
  } catch (err) {
    set({ error: handleApiError(err), isLoading: false });
  }
}
```

### Component with all three states
```tsx
function DataList({ items, isLoading, error }: Props) {
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={...} />;
  if (!items.length) return <p>{m['common.noResults']()}</p>;
  return <ul>...</ul>;
}
```

### Locale-aware navigation
```tsx
const navigate = useLocaleNavigate();
navigate('/results');  // auto-prefixes with current locale
// or
<LocaleLink to="/quiz-start">Start</LocaleLink>
```

## File Structure Expectations

| Change Type | Expected Location |
|-------------|-------------------|
| New page | `src/pages/{Name}.tsx` + route in `App.tsx` |
| New shared component | `src/components/common/{Name}.tsx` |
| Quiz component | `src/components/quiz/{Name}.tsx` |
| Layout component | `src/components/layout/{Name}.tsx` |
| shadcn primitive | `src/components/ui/{name}.tsx` (via CLI) |
| New store | `src/stores/{name}Store.ts` |
| API function | `src/services/api.ts` or new file in `src/services/` |
| Type definition | `src/types/{domain}.types.ts` |
| i18n keys | `messages/en.json` + `messages/es.json` |
