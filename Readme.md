# Emergency Blood Bank — Admin Dashboard

## Role

You are a Principal Frontend Engineer, Principal Product Designer, Senior React Architect, Senior Supabase Engineer, and Design Systems Engineer.

Your task is to build a **production-quality Admin Dashboard** for an Emergency Blood Bank Management System.

The mobile application is **NOT** part of this task.

This prompt focuses exclusively on the **Admin Dashboard**.

You will receive:

- Supabase project credentials (`.env`)
- SQL migration files
- Database schema

You must analyze them and build the application directly on top of the provided schema.

### Important Rules

- Do NOT redesign the database.
- Do NOT invent new tables if existing tables already satisfy the requirements.
- Adapt the frontend to the provided schema.
- Use the migration files as the source of truth.

---

# Project Goal

Build a hospital-grade administration dashboard used by administrators to:

- Monitor system activity
- Manage donors
- Manage patients
- Manage blood donation checks
- Manage users and roles
- Search across the entire system
- Review complete operational history

The application should feel similar to:

- Vercel Dashboard
- Linear
- Stripe Dashboard

while remaining appropriate for a healthcare environment.

This is an internal operations platform, not a public website.

---

# Design System (Strict Requirement)

A complete design system will be provided.

You MUST follow it exactly.

Use it as the single source of truth.

### Visual Principles

- Minimal
- Technical
- Quiet
- Professional
- Information-dense
- Fast
- Clean
- Enterprise-grade

### Forbidden Styles

- Material Design aesthetics
- Glassmorphism
- Neumorphism
- Excessive gradients
- Decorative UI patterns
- Arbitrary colors

The interface should prioritize:

- Data hierarchy
- Fast scanning
- Operational efficiency
- Readability

over decoration.

---

# Technology Stack

Use:

- Vite
- React
- TypeScript
- React Router
- TanStack Query
- React Hook Form
- Zod
- Tailwind CSS
- Shadcn UI
- Lucide Icons
- Recharts

Backend:

- Supabase

No backend server.

Do NOT use:

- Express
- NestJS
- Node backend APIs
- Custom servers

The application must communicate directly with Supabase.

---

# Architecture

Use a feature-based architecture.

Example:

```txt
src/

app/
components/
features/
hooks/
layouts/
lib/
pages/
routes/
services/
types/
```

Requirements:

- Separate UI from business logic
- Reusable components
- Strong TypeScript typing
- Feature-oriented structure
- Clean architecture principles

Avoid:

- Massive pages
- Massive components
- Duplicated logic
- Hardcoded values

---

# Authentication

Use Supabase Authentication.

The database already contains users and roles.

Implement:

- Login page
- Session persistence
- Logout
- Protected routes
- Auth state restoration

Requirements:

- Unauthenticated users cannot access dashboard routes
- Refreshing the page must restore the session
- Proper loading states during auth initialization

---

# Authorization

This dashboard is intended for Admin users.

Validate user roles.

If the current user is not an administrator:

- Show Unauthorized page
- Prevent dashboard access
- Do not render protected content

---

# Application Shell

Create a professional application shell.

Layout:

```txt
Top Navigation

Left Sidebar

Main Content Area
```

Requirements:

- Persistent layout
- React Router navigation
- No full page reloads

---

# Sidebar Navigation

Sections:

```txt
Dashboard

Checks

Donors

Patients

Users

Activity Feed

Settings
```

Requirements:

- Active route highlighting
- Collapsible sidebar
- Responsive behavior
- Keyboard accessibility

---

# Top Navigation

Contains:

```txt
Global Search

Theme Switcher

Current User

Profile Menu
```

Requirements:

- Sticky header
- Lightweight
- Fast
- Consistent with design system

---

# Dashboard Page

This is the operational overview page.

## KPI Cards

Display:

```txt
Total Donors

Total Patients

Total Checks

Rare Blood Donors

Today's Donations

Monthly Donations
```

Requirements:

- Realtime-friendly
- Skeleton loaders
- Responsive cards
- Elegant empty states

---

## Analytics

Create:

### Donations Per Month

Visualize donation activity.

### Blood Type Distribution

Visualize donor blood type distribution.

### Top Donors

Display highest donation counts.

### Departments Served

Display patient department distribution.

Requirements:

- Responsive
- Accessible
- Consistent with design system

---

## Recent Activity

Display latest system activities.

Examples:

```txt
Donor registered

Check created

Patient recorded

Blood type verified
```

Display chronologically.

---

# Checks Module

Build a complete checks management experience.

---

## Checks List

Display table.

Columns:

```txt
Check Number

Donor

Blood Type

Status

Created Date

Distributor
```

Requirements:

- Search
- Sorting
- Filtering
- Pagination
- Empty states
- Loading states

---

## Check Detail Page

Route:

```txt
/checks/:id
```

Do NOT use a modal.

Use a dedicated page.

---

## Check Detail Sections

### Check Information

```txt
Check Number
Status
Created Date
```

### Donor Information

```txt
Name
Age
Phone
National ID
```

### Uploaded Images

Display:

```txt
Check Photo
Supporting Images
```

Support image preview.

### Blood Information

```txt
Blood Type
Verified By
Verification Date
```

### Patient Information

```txt
Patient Name
National ID
Phone
Department
Hospital File Number
Address
Social Notes
Medical Notes
```

### Timeline

Display lifecycle history:

```txt
Created

Transferred

Patient Recorded

Blood Type Verified

Completed
```

---

# Donors Module

Create complete donor management pages.

---

## Donor Directory

Columns:

```txt
Name

Blood Type

Phone

Age

Last Donation

Total Donations
```

Requirements:

- Search
- Filters
- Pagination

---

## Donor Profile

Route:

```txt
/Donors/:id
```

Display:

### Personal Information

### Blood Type

### Donation Statistics

### Donation History

Display all linked checks.

### Rare Blood Indicator

If donor blood type is marked as rare:

Display a visible badge.

---

# Patients Module

Create patient management pages.

---

## Patient Directory

Columns:

```txt
Name

Department

Phone

Hospital File Number
```

Requirements:

- Search
- Filters
- Pagination

---

## Patient Profile

Display:

### Personal Information

### Medical Notes

### Social Notes

### Linked Checks

---

# Users Module

Administrative user management.

---

## User Directory

Display:

```txt
Username

Full Name

Roles

Status
```

---

## User Actions

Support:

```txt
Create User

Disable User

Enable User

Assign Roles

Remove Roles
```

Requirements:

- React Hook Form
- Zod validation
- Production-quality forms
- Proper error handling

---

# Activity Feed

Create a dedicated activity page.

Purpose:

Operational visibility.

Display timeline of system activity.

Examples:

```txt
User Created

Donor Registered

Check Created

Check Assigned

Blood Type Verified
```

Support filtering by:

```txt
Date

User

Action Type
```

---

# Global Search

Implement a command-style search experience.

Search across:

```txt
Checks

Donors

Patients

Users
```

Requirements:

- Cmd/Ctrl + K shortcut
- Grouped results
- Keyboard navigation
- Direct navigation to results

Inspired by:

- Linear
- Raycast
- Vercel

---

# Theme System

Implement:

```txt
Light Mode

Dark Mode
```

Requirements:

- Complete theme support
- No visual regressions
- Follow design tokens exactly

---

# Supabase Integration

You will receive:

```txt
.env

Supabase URL

Supabase Keys

SQL Migrations
```

Requirements:

- Analyze schema before implementation
- Build queries against actual schema
- Generate database types if needed
- Use real Supabase queries
- No fake data
- Use TanStack Query everywhere
- Implement proper cache invalidation

---

# Performance Requirements

Implement:

- Route-based code splitting
- Lazy loading
- Optimized Supabase queries
- Query caching
- Skeleton loaders
- Error boundaries

The dashboard should feel fast and responsive.

---

# UX Requirements

Every page must include:

- Loading state
- Empty state
- Error state
- Success feedback

The user should never be left without feedback.

---

# Code Quality Requirements

Generate:

- Production-ready architecture
- Strong TypeScript typing
- Reusable components
- Clean abstractions
- Consistent patterns

Avoid:

- Inline business logic
- Massive files
- Hardcoded constants
- Poor state management

---

# Deliverables

Generate:

1. Complete folder structure
2. Route architecture
3. Design system integration
4. Authentication system
5. Protected routes
6. Application shell
7. Dashboard page
8. Checks module
9. Check detail page
10. Donors module
11. Donor profile page
12. Patients module
13. Patient profile page
14. Users module
15. Activity Feed
16. Global Search
17. Theme System
18. Supabase integration
19. Reusable components
20. TanStack Query data layer
21. Production-ready code

The final result must feel like a premium enterprise healthcare operations dashboard designed with the quality standards of Vercel, Linear, and Stripe while remaining appropriate for hospital administration.
"# Blood-Bank-" 
