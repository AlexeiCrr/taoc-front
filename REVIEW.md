# Implementation Review — CU-86c8n30q5

## Task
**ClickUp:** https://app.clickup.com/t/86c8n30q5
**Title:** Show assigned coach on person's profile in Admin Dashboard
**Description:** In the admin dashboard, add a field on the person's profile to show which coach their results are assigned to. Only display this if the result is actually assigned to a coach.

## Files Changed
- `taoc-backend/src/taoc/responses/responses.service.ts` — Added `ResponseDetailCoachDto` interface, `coach` field to `ResponseDetailDto`, and a `LEFT JOIN coaches` in `getById()` to fetch coach name and email
- `taoc-front/src/utils/responseDetailUtils.ts` — Added `ResponseDetailCoach` interface and `coach` field to the frontend `ResponseDetailDto`
- `taoc-front/src/components/admin/UserDataCard.tsx` — Added `coach` prop (optional) and conditional "Assigned Coach" display block in view mode
- `taoc-front/src/pages/ResponseDetail.tsx` — Passes `response.coach` through to `UserDataCard`

## What Was Implemented
The `responses` table already stores a `coach_id` FK referencing the `coaches` table, but the admin `GET responses/:id` endpoint never exposed that relationship. The backend `getById()` method was updated with a `LEFT JOIN coaches` to select `coach_id`, `first_name`, `last_name`, and `email` from the coaches table when present. The service returns a typed `ResponseDetailCoachDto | null` object. On the frontend, the `UserDataCard` component gains an optional `coach` prop and renders an "Assigned Coach" row (name + email) only when the value is non-null.

## Key Decisions
- **`LEFT JOIN` not `INNER JOIN`** — Most responses won't have a coach; using `LEFT JOIN` ensures uncoached responses still load correctly.
- **`coach: null` in the return object (not `undefined`)** — The field is always present in the DTO so the frontend can rely on a strict null check rather than optional chaining; avoids potential issues with TypeScript's `exactOptionalPropertyTypes`.
- **Display both name and email** — Gives admins enough context to identify the coach and contact them without leaving the page.
- **Conditional rendering via `coach != null`** — The field is hidden entirely when no coach is assigned, matching the task requirement ("only display this if the result is actually assigned to a coach").
- **Backend `ResponseDetailCoachDto` is a separate named interface** — Makes it reusable if other endpoints need to expose coach identity in the same shape.

## Edge Cases Handled
- Response with no coach (`coach_id IS NULL`) → `coach` field returns `null`; the UI block is hidden
- Coach columns could theoretically be NULL in the DB even if `coach_id` is set (data integrity issue) → guarded with `?? ''` fallback on `firstName`, `lastName`, `email` to avoid runtime errors
- Component renders coach in view-only mode only — the edit form is not extended since coach assignment is managed through a separate coach workflow, not directly editable here

## Verification
- [x] `npx tsc --noEmit` passes (taoc-front — zero errors)
- [x] `npx tsc --noEmit --skipLibCheck` passes (taoc-backend — zero errors; `--skipLibCheck` is the project standard for NestJS)
- [x] Loading state handled (inherited from parent `ResponseDetail.tsx` — spinner shown while fetch is in flight)
- [x] Error state handled (inherited from parent — error card displayed on fetch failure)
- [x] Empty state handled — coach field hidden when `null`; no "Not available" placeholder since the task specifies only showing when assigned

---
<!-- Codex and Claude append their sections below during the review loop -->
