# Shortlet Admin Dashboard

Next.js admin for the Shortlet Apartment Booking Platform.

## Stack

- Next.js 14 (App Router)
- Chakra UI
- TanStack React Query
- Zustand (auth/session + UI chrome only)
- Jest + Testing Library

## Architecture

Feature-folder layout:

```
src/
  app/                 # Thin Next.js routes
  features/            # Domain features (dashboard, bookings, …)
  shared/              # Theme, API client, reusable UI, stores
  mocks/               # Mock JSON + mock API (until Nest backend is ready)
```

DTOs under `src/shared/types/hospitable.ts` follow Hospitable Public API v2 / Airbnb channel field names (`snake_case`) so frontend mocks and future Hospitable sync stay aligned.

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

```bash
npm test
```

Set `NEXT_PUBLIC_USE_MOCKS=false` when the Nest API is available.
