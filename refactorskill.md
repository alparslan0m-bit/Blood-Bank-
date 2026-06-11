# Vite React Dashboard Refactor Skill

```yaml
---
name: vite-react-dashboard-refactor
description: >
  Refactor React Vite dashboard applications into a highly modular,
  scalable, maintainable enterprise-grade architecture WITHOUT changing functionality.

  Trigger this skill whenever the user wants to:
  - clean up React code
  - reorganize a Vite project
  - improve maintainability
  - improve scalability
  - make code modular
  - remove technical debt
  - standardize architecture
  - prepare for team development

  This skill is especially useful for AI-generated projects that work but
  have become messy, duplicated, inconsistent, or difficult to maintain.
---
```

# React Vite Dashboard Refactor Skill

## Mission

Transform an existing React + Vite dashboard into an enterprise-grade codebase.

Primary goal:

**NEVER change functionality.**

The application must behave exactly the same after refactoring.

Only improve:

* architecture
* readability
* maintainability
* modularity
* scalability
* consistency

---

# Phase 0 — Analyze First

Before changing anything:

Request:

1. Current folder structure
2. package.json
3. Tech stack

Examples:

* React Router
* TanStack Query
* Zustand
* Redux
* Supabase
* Firebase
* Tailwind
* Shadcn
* Material UI
* Ant Design

4. Existing coding conventions
5. Any architecture constraints

Then generate:

## Refactor Plan

* Current issues
* Proposed structure
* Files affected
* Components to extract
* Hooks to extract
* Services to extract
* Risks

**WAIT FOR APPROVAL**

before making changes.

---

# Phase 1 — Target Architecture

Use Feature-Based Architecture.

```txt
src/

├── app/
│   ├── router/
│   ├── providers/
│   ├── layouts/
│   └── config/
│
├── features/
│   ├── auth/
│   ├── users/
│   ├── donors/
│   ├── patients/
│   ├── inventory/
│   ├── dashboard/
│   └── reports/
│
├── components/
│   ├── ui/
│   ├── forms/
│   ├── feedback/
│   └── data-display/
│
├── hooks/
│
├── services/
│
├── lib/
│
├── store/
│
├── constants/
│
├── types/
│
├── utils/
│
├── assets/
│
├── styles/
│
└── main.tsx
```

---

# Phase 2 — Feature Isolation

Every business domain belongs inside features.

Example:

```txt
features/users/

├── api/
├── hooks/
├── pages/
├── components/
├── types/
├── utils/
└── index.ts
```

Rules:

* Users code never leaks into Patients
* Patients never import Users
* Cross-feature communication only through:

  * services
  * shared hooks
  * shared components

---

# Phase 3 — Component Extraction

Extract whenever:

### JSX > 50 lines

Move to component.

### Repeated UI

Move to shared component.

### Repeated Table

Create:

```tsx
DataTable
```

### Repeated Card

Create:

```tsx
EditorialCard
```

### Repeated Modal

Create:

```tsx
BaseModal
```

### Repeated Filters

Create:

```tsx
FilterBar
```

### Repeated Loading States

Create:

```tsx
LoadingState
```

### Repeated Empty States

Create:

```tsx
EmptyState
```

---

# Phase 4 — Smart Hooks

Move business logic out of pages.

Bad:

```tsx
DashboardPage.tsx
```

contains:

* fetch logic
* mutations
* filters
* sorting
* pagination

Good:

```tsx
useDashboardMetrics()
useDashboardFilters()
usePatients()
useUsers()
```

Pages become:

```tsx
const DashboardPage = () => {
  const metrics = useDashboardMetrics();

  return (...);
};
```

---

# Phase 5 — API Layer

Never call:

```tsx
fetch()
axios()
supabase()
```

inside pages.

Never.

Instead:

```txt
services/
```

or

```txt
features/users/api/
```

Example:

```tsx
export async function getUsers() {}
export async function createUser() {}
export async function deleteUser() {}
```

Pages consume hooks.

Hooks consume services.

Services consume API.

---

# Phase 6 — Dashboard Layout System

Centralize layout.

```txt
app/layouts/
```

Example:

```tsx
DashboardLayout
AuthLayout
PublicLayout
```

Pages never implement:

* sidebars
* navigation
* headers

directly.

---

# Phase 7 — Design System

Centralize design tokens.

```txt
styles/tokens/
```

```ts
colors.ts
spacing.ts
radius.ts
typography.ts
shadows.ts
zindex.ts
```

No magic values.

Bad:

```tsx
padding: 17
margin: 23
color: "#3F62FF"
```

Good:

```tsx
padding: spacing.lg
color: colors.primary
```

---

# Phase 8 — Forms

Forms must use shared primitives.

Create:

```txt
components/forms/
```

Examples:

```tsx
FormInput
FormSelect
FormTextarea
FormCheckbox
FormDatePicker
```

Business forms assemble primitives.

---

# Phase 9 — Tables

Centralize all table logic.

Create:

```txt
components/data-display/
```

Examples:

```tsx
DataTable
Pagination
ColumnVisibility
SortControls
```

Never duplicate table code.

---

# Phase 10 — State Management

Local state:

```tsx
useState
```

Feature state:

```tsx
custom hooks
```

Global state:

```tsx
Zustand
Redux
Context
```

Rules:

* Never create global state unless needed
* Prefer local
* Then feature
* Then global

---

# Phase 11 — Routing

All routes centralized.

```txt
app/router/
```

Example:

```tsx
routes.tsx
protected-routes.tsx
public-routes.tsx
```

Pages never declare routes.

---

# Phase 12 — Performance

Apply:

* React.memo
* useMemo
* useCallback

ONLY where beneficial.

Never add blindly.

Remove:

* unnecessary rerenders
* duplicated API requests
* duplicated calculations

without changing behavior.

---

# Phase 13 — Import Hygiene

Replace:

```tsx
../../../components/Button
```

with aliases.

```tsx
@/components
@/features
@/hooks
@/services
```

Configure:

```ts
vite.config.ts
tsconfig.json
```

---

# Phase 14 — Barrel Exports

Every folder:

```txt
index.ts
```

Example:

```ts
export * from './hooks';
export * from './components';
export * from './api';
```

Imports become:

```tsx
import { UserTable } from '@/features/users';
```

instead of:

```tsx
import UserTable from '../../../features/users/components/UserTable';
```

---

# Phase 15 — Cleanup Rules

Remove:

* dead code
* commented code
* unused imports
* duplicate helpers
* duplicate hooks
* duplicate constants

without changing behavior.

---

# Code Quality Rules

Always enforce:

* one component per file
* one responsibility per component
* one feature per folder
* no business logic in JSX
* no API calls in pages
* no giant files >300 lines when avoidable
* no duplicated state
* no duplicated constants
* no magic strings
* no magic numbers

---

# Dashboard UI Standards

All dashboards must use:

### Layout

```txt
DashboardLayout
 ├── Sidebar
 ├── Topbar
 ├── PageHeader
 ├── ContentArea
 └── Footer
```

### Cards

Use:

```tsx
EditorialCard
```

for every dashboard card.

### Tables

Use:

```tsx
DataTable
```

for every data table.

### Forms

Use shared form primitives only.

### Badges

Centralized Badge component.

### Modals

Centralized BaseModal component.

### Empty States

Centralized EmptyState component.

### Loading States

Centralized LoadingState component.

---

# Design Consistency Rules

Never allow:

* random spacing
* random colors
* random border radius
* random typography

Everything must come from tokens.

Example:

```tsx
colors.primary
spacing.md
radius.lg
typography.body
```

---

# Enterprise Dashboard Standards

Target outcome:

* Easy for a new developer to understand in under 30 minutes
* Every feature isolated
* Every API centralized
* Every component reusable
* Every page under ~150 lines
* No duplicated logic
* No architectural debt
* Ready for scaling to 100k+ users

WITHOUT changing functionality.

---

# Delivery Format

Always provide:

## 1. Architecture Review

Current issues found.

## 2. New Folder Structure

ASCII tree.

## 3. Refactor Steps

Ordered list.

## 4. Updated Files

One file at a time.

Full file contents.

## 5. Migration Checklist

Step-by-step verification.

## 6. Safety Verification

Confirm:

* Routes unchanged
* APIs unchanged
* State unchanged
* UI behavior unchanged
* Permissions unchanged

---

# Mandatory Safety Checklist

Before every refactor:

* [ ] No feature added
* [ ] No feature removed
* [ ] No route renamed
* [ ] No API changed
* [ ] No state shape changed
* [ ] No permissions changed
* [ ] No business logic changed
* [ ] No visual behavior changed
* [ ] No database queries changed
* [ ] No Supabase schema changed

If any answer is YES:

STOP and ask for approval.

---

# What This Skill Does NOT Do

* Fix bugs unless explicitly requested
* Redesign UI unless explicitly requested
* Change business logic
* Migrate frameworks
* Replace libraries
* Upgrade dependencies
* Change database schemas
* Rewrite backend systems
* Introduce breaking changes

Focus only on:

* structure
* maintainability
* modularity
* scalability
* code quality
* architecture

while preserving 100% functionality.
