# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev        # Start Next.js dev server on port 3000
npm run build      # Build production bundle
npm run start      # Start production server
npm lint           # Run ESLint
```

## Project Overview

**Gymio** is a Next.js 16 + React 19 web application with TypeScript. The project follows a modern full-stack setup with client-side data fetching and state management.

### Tech Stack
- **Framework**: Next.js 16 (App Router), React 19
- **HTTP Client**: Axios with interceptors for authentication
- **State Management**: Zustand (for global state)
- **Data Fetching**: TanStack Query (React Query) v5 with custom hooks
- **Styling**: Tailwind CSS v4, dark mode support
- **Backend**: Supabase for authentication and data
- **UI Icons**: Lucide React
- **Form Utils**: Class Variance Authority (CVA)

## Architecture

### Directory Structure
```
src/
├── app/               # Next.js App Router pages and layout
├── components/        # React components (currently empty, ready for use)
├── constants/         # Configuration constants (API, query settings)
├── hooks/            # Custom React hooks (useApiQuery, useApiMutation)
├── lib/
│   ├── axios/        # HTTP client setup with auth interceptors
│   ├── query-client.ts # TanStack Query client configuration
│   ├── supabase.ts    # Supabase client initialization
│   └── utils.ts       # Utility functions
├── providers/         # React context providers (QueryProvider)
└── stores/           # Zustand stores (for global state)
```

### Core Patterns

**HTTP Requests via Axios**: All API calls go through `src/lib/axios/` with:
- Automatic Bearer token injection from localStorage (`AUTH_TOKEN_KEY`)
- Configurable error handling
- Request/response interceptors
- Support for protected and unprotected endpoints

**Data Fetching with TanStack Query**: Use `useApiQuery` and `useApiMutation` hooks (`src/hooks/use-api-query.ts`) instead of raw `useQuery`/`useMutation`. These hooks integrate Axios automatically:
```typescript
const { data } = useApiQuery<UserType>(
  ["user"],
  "GET",
  "/api/users/me",
  true,  // isProtected
  undefined,
  { staleTime: 1000 * 60 } // optional query options
);

const mutation = useApiMutation<ResponseType, BodyType>(
  "POST",
  "/api/users",
  true,
  undefined,
  { onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }) }
);
```

**Query Configuration**: All TanStack Query defaults (stale time, retry, refetch behavior) are configured in `src/constants/query.ts` and applied globally.

**Environment Variables**: Controlled via `.env.local`:
- `NEXT_PUBLIC_API_BASE_URL` - Base URL for API requests (default: http://localhost:3000/api)
- Other secrets should be prefixed with `NEXT_PUBLIC_` only if they need to be exposed to the browser

## Key Files

- `src/lib/axios/instance.ts` - Axios instance with auth interceptors
- `src/lib/axios/config.ts` - Configure token retrieval strategy
- `src/hooks/use-api-query.ts` - Drop-in replacements for `useQuery`/`useMutation`
- `src/constants/api.ts` - API configuration (timeouts, status codes, retry logic)
- `src/constants/query.ts` - TanStack Query defaults
