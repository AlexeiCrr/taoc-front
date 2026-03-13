# Admin Components Architecture

## Component Separation Rationale

- AdminFilters maintains independent draft state (local React state) until "Apply" clicked
- AdminDataGrid encapsulates table logic (column definitions, sorting, rendering)
- Separation enables testing filter logic without mounting entire grid
- Matches common data table UX pattern (filters above grid)

**Why Not Inline in Dashboard.tsx:**
- Dashboard page may gain additional sections (stats cards, charts from /responses/statistics endpoint)
- Encapsulation maintains single responsibility principle
- Grid can be reused elsewhere without filters if needed

## Data Flow

### Quiz Response Grid Flow
```
User types in AdminFilters inputs → local state updates (no API call)
User clicks "Apply Filters" → adminStore.setFilter() → store.filters updated → pagination reset to page 1
AdminDataGrid detects store.filters change → calls fetchResponses(1)
adminStore.fetchResponses() → builds query params from filters → API GET /responses?page=1&name=X&email=Y
API returns PaginatedResponse → store updates responses, pagination metadata
React Table re-renders → formats dates, generates dynamic frequency columns, displays data
```

### License Generation Flow
```
User clicks "Manage Licenses" in Dashboard → ManageLicensesDialog opens
User inputs amount (1-10000), selects tier (1/3/7) → local state updates
User clicks "Generate & Download" → dialog locked (prevents closure during API call)
apiService.generateLicenses() → adminApi POST /tac-generate-codes with JWT
API validates JWT, generates codes → returns CSV blob with headers "code,license_tier"
Content-type validated (text/csv or application/octet-stream) → blob downloaded
Browser downloads file: license_codes_YYYY-MM-DD.csv → dialog closes, state resets
```

## Invariants

- **Column order:** User Data columns (firstName, lastName, email, licenseCode, createdAt) BEFORE Frequency columns. Frequencies sorted alphabetically.
- **Pagination reset:** Current page resets to 1 when filters change (prevents showing page 5 of 2 total after filter reduces results).
- **Filter omission:** Empty filter values not included in API request (avoids sending `?name=` which might be interpreted as empty string search).
- **No auto-refresh:** Grid does not auto-refresh on interval (avoids unexpected pagination jumps while user viewing data). User must manually refresh page.
- **Dynamic frequency columns:** Frequency column list generated from first response item's `frequencies` object keys. If API adds new frequency type, frontend adapts without code changes.
