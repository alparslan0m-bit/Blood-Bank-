# Emergency Blood Bank — Admin Dashboard

Build a production-quality admin dashboard for an Emergency Blood Bank Management System, communicating directly with a pre-existing Supabase backend.

## Database Schema Summary

The migration at [000001_init.sql](file:///c:/Users/METRO/Bloody/supabase/migrations/000001_init.sql) defines:

| Table | Key Columns | Notes |
|---|---|---|
| `roles` | `id`, `name`, `label` | Seeded: receiver, lab, distributor, **admin** |
| `users` | `id (uuid)`, `username`, `email`, `full_name`, `disabled` | Linked to `auth.uid()` |
| `user_roles` | `user_id`, `role_id` | Many-to-many |
| `blood_types` | `id`, `code`, `label`, `is_rare` | Seeded: A+, A-, B+, B-, AB+, AB-, O+, O- |
| `donors` | `id`, `full_name`, `national_id`, `phone`, `age`, `gender`, `address`, `blood_type_id`, `notes`, `last_donation_date`, `total_donations` | FK → blood_types |
| `patients` | `id`, `full_name`, `national_id`, `phone`, `department`, `file_number`, `address`, `social_notes`, `medical_notes` | |
| `donation_checks` | `id`, `serial`, `status`, `donor_id`, `patient_id`, `blood_type_id`, `created_by`, `distributor_id`, `transferred_to_distributor_at`, `distributed_at`, `blood_recorded_by`, `blood_recorded_at` | Serial format: BD-YYYY-000001 |
| `check_images` | `id`, `donation_check_id`, `file_path`, `type` | |
| `notifications` | `id`, `user_id`, `title`, `description`, `entity_type`, `entity_id`, `read` | |
| `audit_logs` | `id`, `user_id`, `action`, `entity`, `entity_id`, `metadata (jsonb)` | Admin-only |
| `activities` | `id`, `user_id`, `action`, `entity`, `entity_id`, `details` | Admin-only |

**Functions**: `user_has_role(text)`, `next_check_serial()`, `report_rare_blood_checks(from, to)`

**RLS**: All tables have row-level security. Admin role has the broadest access.

---

## User Review Required

> [!IMPORTANT]
> **Tailwind CSS**: The user request explicitly asks for Tailwind CSS. The design system spec (DESIGN-vercel.md) provides exact tokens. I will map these into Tailwind's `tailwind.config.ts` `extend` section — **not** use arbitrary Tailwind defaults.

> [!IMPORTANT]
> **shadcn/ui**: Will be used as the component primitive layer (Dialog, DropdownMenu, Table, Command, etc.) and re-themed to match the Vercel-inspired design system. No default shadcn colors will leak through.

> [!WARNING]
> **Auth Flow**: The `users` table links to Supabase Auth via `auth.uid()`. Login will use `supabase.auth.signInWithPassword()`. After auth, the app queries `users` + `user_roles` + `roles` to determine the admin role. If the logged-in auth user has no matching row in `users` or lacks the `admin` role → Unauthorized page.

## Open Questions

> [!IMPORTANT]
> **User creation**: The "Create User" feature requires creating a Supabase Auth user + a `users` row + `user_roles` entry. Creating auth users from the client requires the **service role key** (which is blank in .env). Two options:
> 1. Use a Supabase Edge Function for user creation (recommended for production)
> 2. Use `supabase.auth.admin.createUser()` with the service role key (requires you to fill in `SUPABASE_SERVICE_ROLE_KEY` in .env)
>
> **I'll implement the UI and form, but user creation will call a placeholder service function that can be wired to either approach. The rest of user management (disable/enable/role assignment) works via direct table updates.**

> [!IMPORTANT]
> **Check images**: `check_images.file_path` stores paths. Are these Supabase Storage bucket paths? I'll assume they are and will generate public URLs via `supabase.storage.from('checks').getPublicUrl(file_path)`. If the bucket name differs, one constant change is needed.

---

## Proposed Changes

### Phase 1: Project Scaffolding

#### [NEW] Vite + React + TypeScript project

Initialize with `npx -y create-vite@latest ./ --template react-ts`, install dependencies:

```
react-router-dom, @tanstack/react-query, react-hook-form, @hookform/resolvers,
zod, @supabase/supabase-js, recharts, lucide-react, tailwindcss, postcss,
autoprefixer, @radix-ui/react-*, class-variance-authority, clsx, tailwind-merge
```

#### [NEW] tailwind.config.ts
Map all design tokens from DESIGN-vercel.md:
- Colors: `ink`, `body`, `mute`, `hairline`, `canvas`, `canvas-soft`, `link`, `error`, `warning`, `success`, `violet`, `cyan`
- Dark mode variants (inverted surfaces)
- Typography via `fontFamily` (Geist / Inter fallback + Geist Mono)
- Spacing scale matching the 4px base
- Border radius scale: `xs` through `pill`, `full`
- Box shadow levels 0–5

#### [NEW] src/index.css
Import Geist font (from CDN), Tailwind directives, CSS custom properties for the theme system (light/dark), base resets.

---

### Phase 2: Core Infrastructure

#### [NEW] src/lib/supabase.ts
Supabase client initialized from `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`.

#### [NEW] src/types/database.ts
TypeScript types mirroring every table: `User`, `Role`, `UserRole`, `BloodType`, `Donor`, `Patient`, `DonationCheck`, `CheckImage`, `Notification`, `AuditLog`, `Activity`. Plus join types like `DonorWithBloodType`, `CheckWithRelations`.

#### [NEW] src/lib/utils.ts
`cn()` utility (clsx + tailwind-merge), date formatters, status helpers.

---

### Phase 3: Design System / Shared Components

#### [NEW] shadcn/ui components (src/components/ui/*)
Install and theme: `button`, `input`, `table`, `dialog`, `dropdown-menu`, `command`, `badge`, `skeleton`, `toast`, `avatar`, `separator`, `card`, `tabs`, `select`, `label`, `textarea`, `popover`, `calendar`, `checkbox`, `sheet`.

All restyled to Vercel tokens (ink primary, hairline borders, body-sm typography, sm radius for inputs, pill radius for marketing buttons).

#### [NEW] src/components/
- `data-table.tsx` — Reusable sortable/filterable table with pagination, empty/loading states
- `kpi-card.tsx` — KPI stat card with skeleton
- `page-header.tsx` — Page title + description + actions
- `status-badge.tsx` — Check status badge (created/transferred/distributed/completed)
- `blood-type-badge.tsx` — Blood type display with rare indicator
- `empty-state.tsx` — Illustrated empty state
- `error-boundary.tsx` — React error boundary
- `loading-spinner.tsx` — Skeleton / spinner

---

### Phase 4: Authentication & Authorization

#### [NEW] src/hooks/use-auth.ts
Auth context provider using `supabase.auth.onAuthStateChange`. Stores session, user profile (from `users` table), and roles.

#### [NEW] src/features/auth/login-page.tsx
Login form with email + password, Zod validation, error display. Vercel-inspired auth card (`ex-auth-form-card` tokens).

#### [NEW] src/components/protected-route.tsx
Wraps routes — redirects to `/login` if not authenticated, shows Unauthorized page if not admin.

#### [NEW] src/features/auth/unauthorized-page.tsx
Clean "Access Denied" page for non-admin users.

---

### Phase 5: Application Shell & Routing

#### [NEW] src/layouts/dashboard-layout.tsx
Persistent shell: sidebar (left) + topbar (top) + `<Outlet />` for page content.

#### [NEW] src/layouts/sidebar.tsx
Navigation sections: Dashboard, Checks, Donors, Patients, Users, Activity Feed, Settings. Collapsible. Active route highlighting with `{colors.primary}` left-edge indicator (per `ex-app-shell-row`). Lucide icons.

#### [NEW] src/layouts/topbar.tsx
Global search trigger (Cmd+K), theme toggle, user avatar + dropdown (profile, logout).

#### [NEW] src/routes/index.tsx
React Router config with lazy-loaded routes:
```
/login
/unauthorized
/ → redirect to /dashboard
/dashboard
/checks
/checks/:id
/donors
/donors/:id
/patients
/patients/:id
/users
/activity
/settings
```

---

### Phase 6: Dashboard Page

#### [NEW] src/pages/dashboard-page.tsx

**KPI Cards** — 6 cards querying Supabase:
1. Total Donors: `donors.count()`
2. Total Patients: `patients.count()`
3. Total Checks: `donation_checks.count()`
4. Rare Blood Donors: `donors` joined with `blood_types` where `is_rare = true`
5. Today's Donations: `donation_checks` where `created_at >= today`
6. Monthly Donations: `donation_checks` where `created_at >= first of month`

**Charts** (Recharts):
- Donations per month: aggregate `donation_checks` by month
- Blood type distribution: count donors grouped by `blood_type_id`
- Top donors: `donors` ordered by `total_donations` desc, limit 5
- Departments served: count patients grouped by `department`

**Recent Activity**: Latest 10 from `activities` table, displayed as timeline.

#### [NEW] src/services/dashboard-service.ts
All Supabase queries for dashboard KPIs and chart data.

#### [NEW] src/hooks/use-dashboard.ts
TanStack Query hooks wrapping the service.

---

### Phase 7: Checks Module

#### [NEW] src/pages/checks-page.tsx
Data table with columns: Serial, Donor, Blood Type, Status, Created Date, Distributor. Search by serial/donor name. Filter by status, blood type. Pagination.

#### [NEW] src/pages/check-detail-page.tsx
Full-page detail at `/checks/:id`. Sections:
- Check info (serial, status, created date)
- Donor info (name, age, phone, national ID)
- Uploaded images (from `check_images`, with lightbox preview)
- Blood info (type, verified by, verification date)
- Patient info (name, national ID, phone, department, file number, address, social/medical notes)
- Timeline (lifecycle events derived from timestamps: `created_at`, `transferred_to_distributor_at`, `blood_recorded_at`, `distributed_at`)

#### [NEW] src/services/checks-service.ts
Supabase queries with joins: `donation_checks` → `donors`, `patients`, `blood_types`, `users` (for created_by, distributor_id, blood_recorded_by), `check_images`.

#### [NEW] src/hooks/use-checks.ts
TanStack Query hooks: `useChecks`, `useCheck`, `useCheckImages`.

---

### Phase 8: Donors Module

#### [NEW] src/pages/donors-page.tsx
Directory table: Name, Blood Type, Phone, Age, Last Donation, Total Donations. Search + filter + pagination.

#### [NEW] src/pages/donor-detail-page.tsx
Profile at `/donors/:id`: Personal info, blood type (with rare badge), donation stats, donation history (linked checks as a sub-table).

#### [NEW] src/services/donors-service.ts
#### [NEW] src/hooks/use-donors.ts

---

### Phase 9: Patients Module

#### [NEW] src/pages/patients-page.tsx
Directory table: Name, Department, Phone, Hospital File Number. Search + filter + pagination.

#### [NEW] src/pages/patient-detail-page.tsx
Profile at `/patients/:id`: Personal info, medical notes, social notes, linked checks.

#### [NEW] src/services/patients-service.ts
#### [NEW] src/hooks/use-patients.ts

---

### Phase 10: Users Module

#### [NEW] src/pages/users-page.tsx
Directory table: Username, Full Name, Roles (joined), Status (disabled flag). Actions: create, disable/enable, assign/remove roles.

#### [NEW] src/features/users/user-form-dialog.tsx
React Hook Form + Zod for creating users. Fields: username, email, full_name, role selection.

#### [NEW] src/features/users/role-management-dialog.tsx
Assign/remove roles for a user.

#### [NEW] src/services/users-service.ts
#### [NEW] src/hooks/use-users.ts

---

### Phase 11: Activity Feed

#### [NEW] src/pages/activity-page.tsx
Chronological timeline of `activities` table entries. Filterable by date range, user, action type. Displays: action icon, user name, description, timestamp.

#### [NEW] src/services/activity-service.ts
#### [NEW] src/hooks/use-activities.ts

---

### Phase 12: Global Search & Theme

#### [NEW] src/features/search/command-search.tsx
`<Command>` component (shadcn/ui, backed by cmdk). Triggered by Cmd/Ctrl+K. Searches across donors, patients, checks, users via parallel Supabase queries. Grouped results. Keyboard navigation. Direct navigation on select.

#### [NEW] src/hooks/use-theme.ts
Theme provider reading/writing `localStorage`, toggling `dark` class on `<html>`. Dark mode CSS variables defined in `index.css`.

#### [NEW] src/pages/settings-page.tsx
Theme preference, account info display.

---

## File Structure Summary

```
src/
├── app/
│   └── App.tsx
├── components/
│   ├── ui/           ← shadcn primitives
│   ├── data-table.tsx
│   ├── kpi-card.tsx
│   ├── page-header.tsx
│   ├── status-badge.tsx
│   ├── blood-type-badge.tsx
│   ├── empty-state.tsx
│   ├── error-boundary.tsx
│   ├── loading-spinner.tsx
│   └── protected-route.tsx
├── features/
│   ├── auth/
│   │   ├── login-page.tsx
│   │   ├── unauthorized-page.tsx
│   │   └── auth-provider.tsx
│   ├── search/
│   │   └── command-search.tsx
│   └── users/
│       ├── user-form-dialog.tsx
│       └── role-management-dialog.tsx
├── hooks/
│   ├── use-auth.ts
│   ├── use-theme.ts
│   ├── use-dashboard.ts
│   ├── use-checks.ts
│   ├── use-donors.ts
│   ├── use-patients.ts
│   ├── use-users.ts
│   └── use-activities.ts
├── layouts/
│   ├── dashboard-layout.tsx
│   ├── sidebar.tsx
│   └── topbar.tsx
├── lib/
│   ├── supabase.ts
│   └── utils.ts
├── pages/
│   ├── dashboard-page.tsx
│   ├── checks-page.tsx
│   ├── check-detail-page.tsx
│   ├── donors-page.tsx
│   ├── donor-detail-page.tsx
│   ├── patients-page.tsx
│   ├── patient-detail-page.tsx
│   ├── users-page.tsx
│   ├── activity-page.tsx
│   └── settings-page.tsx
├── routes/
│   └── index.tsx
├── services/
│   ├── dashboard-service.ts
│   ├── checks-service.ts
│   ├── donors-service.ts
│   ├── patients-service.ts
│   ├── users-service.ts
│   └── activity-service.ts
├── types/
│   └── database.ts
├── index.css
└── main.tsx
```

---

## Verification Plan

### Automated
```bash
npm run build    # TypeScript compilation + Vite build — zero errors
npm run lint     # ESLint passes
```

### Manual
1. `npm run dev` → login page renders
2. Login with valid admin credentials → dashboard loads
3. Navigate all sidebar routes — no full-page reloads
4. Verify KPI cards load real data from Supabase
5. Check detail page shows all sections
6. Cmd+K search returns grouped results
7. Theme toggle switches light ↔ dark without visual regressions
8. Non-admin login → Unauthorized page
9. Browser refresh → session persists
