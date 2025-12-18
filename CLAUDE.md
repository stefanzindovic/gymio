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

**Gymio** is a Next.js 16 + React 19 web application with TypeScript, featuring a full authentication system powered by Supabase.

### Tech Stack
- **Framework**: Next.js 16 (App Router), React 19
- **Authentication**: Supabase Auth with custom session management
- **HTTP Client**: Axios with interceptors for authentication
- **State Management**: Zustand for global auth state
- **Data Fetching**: TanStack Query (React Query) v5 with custom hooks
- **Styling**: Tailwind CSS v4, dark mode support
- **UI Icons**: Lucide React
- **Form Utils**: Class Variance Authority (CVA)

## Architecture

### Directory Structure
```
src/
├── app/
│   ├── (auth)/           # Route group for auth pages (login, register)
│   ├── dashboard/        # Protected dashboard page
│   ├── layout.tsx        # Root layout with QueryProvider & AuthProvider
│   └── page.tsx          # Home page
├── components/
│   └── auth/             # Auth-related components (forms, redirect wrappers)
├── constants/
│   ├── api.ts            # API config (timeouts, status codes, retry logic)
│   └── query.ts          # TanStack Query defaults
├── hooks/
│   ├── use-api-query.ts  # TanStack Query + Axios integration
│   ├── use-auth.ts       # Auth store access hook
│   └── use-auth-redirect.ts # Client-side auth redirect logic
├── lib/
│   ├── auth/
│   │   ├── config.ts     # Initialize Axios auth config
│   │   └── session-sync.ts # Sync Supabase session to localStorage
│   ├── axios/
│   │   ├── instance.ts   # Axios instance with interceptors
│   │   ├── config.ts     # Token retrieval configuration
│   │   ├── errors.ts     # API error classes
│   │   ├── types.ts      # TypeScript types
│   │   └── index.ts      # Public exports (sendRequest)
│   ├── supabase/
│   │   ├── client.ts     # Supabase client instance
│   │   ├── auth.ts       # Auth methods (signIn, signUp, signOut, etc.)
│   │   └── types.ts      # Auth-related types
│   ├── query-client.ts   # TanStack Query client configuration
│   └── utils.ts          # Utility functions (cn, etc.)
├── providers/
│   ├── query-provider.tsx # TanStack Query provider
│   └── auth-provider.tsx  # Auth initialization & state sync
└── stores/
    └── auth-store.ts      # Zustand store for auth state
```

### Authentication Flow

**Key Pattern**: Dual auth system using Supabase Auth + Zustand state management with localStorage token sync.

1. **Initial Load** (src/providers/auth-provider.tsx:21):
   - `AuthProvider` calls `initializeAuthConfig()` to configure Axios token retrieval
   - Calls `initialize()` from auth store to restore session from Supabase
   - Sets up `onAuthStateChange` listener for real-time auth updates

2. **Session Synchronization** (src/lib/auth/session-sync.ts):
   - When user logs in, Supabase session's `access_token` is stored in `localStorage` under key `auth_token`
   - This token is used by Axios interceptor for API authentication
   - On logout, token is removed from localStorage

3. **Auth State Management** (src/stores/auth-store.ts):
   - Zustand store holds `user`, `session`, `isLoading`, `isAuthenticated`
   - Provides methods: `login()`, `register()`, `logout()`, `initialize()`
   - All auth operations sync session to localStorage via `syncSessionToLocalStorage()`

4. **Protected API Requests** (src/lib/axios/instance.ts:24):
   - Axios request interceptor automatically injects Bearer token from localStorage
   - Requests marked with `skipAuth: true` bypass token injection
   - Failed token retrievals are logged but don't block requests

### Data Fetching Pattern

**DO NOT** use raw `useQuery` or `useMutation`. Always use the custom hooks from `src/hooks/use-api-query.ts`:

```typescript
// For GET requests
const { data, isLoading } = useApiQuery<UserType>(
  ["user"],           // query key
  "GET",              // method
  "/api/users/me",    // endpoint
  true,               // isProtected (adds auth token)
  undefined,          // optional axios config
  { staleTime: 60000 } // optional react-query options
);

// For mutations (POST, PUT, PATCH, DELETE)
const mutation = useApiMutation<ResponseType, BodyType>(
  "POST",
  "/api/users",
  true,
  undefined,
  {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    }
  }
);

// Call mutation with data
mutation.mutate({ name: "John" });
```

These hooks automatically handle:
- Bearer token injection for protected endpoints
- Error handling via Axios interceptors
- Retry logic with exponential backoff (3 attempts, 1s initial delay)
- Request timeout (30s default)

### HTTP Client Details

**Axios Configuration** (src/lib/axios/instance.ts):
- Base URL: `NEXT_PUBLIC_API_BASE_URL` (default: http://localhost:3000/api)
- Timeout: 30 seconds
- Automatic retries on 429, 500, 503 status codes
- Exponential backoff: 1s, 2s, 4s
- Custom error classes: `ApiError`, `NetworkError`, `ValidationError`, `UnauthorizedError`, etc.

**Token Injection** (src/lib/auth/config.ts:4):
- Configured via `initializeAuthConfig()` in AuthProvider
- Retrieves token from localStorage using `AUTH_TOKEN_KEY` constant
- Only runs client-side (`typeof window !== "undefined"`)

### Environment Variables

Required in `.env.local` (see `.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `NEXT_PUBLIC_API_BASE_URL` - API base URL (optional, defaults to http://localhost:3000/api)

### Route Structure

- `src/app/(auth)/` - Route group for authentication pages (login, register)
  - Does not add `/auth` to URL path
  - Used for layout/middleware organization
- `src/app/dashboard/` - Protected dashboard page
- Protected routes should check `isAuthenticated` from auth store or use redirect wrappers

### TanStack Query Configuration

Global defaults set in `src/constants/query.ts` and applied in `src/lib/query-client.ts`:
- Stale time, refetch behavior, retry logic configured centrally
- All queries wrapped in `QueryProvider` at root layout

## Key Implementation Notes

1. **Auth initialization order matters**: `initializeAuthConfig()` must run before any protected API calls
2. **Client-side only**: Auth store and localStorage operations only work in browser context
3. **Session persistence**: Supabase session is source of truth; localStorage token is for Axios convenience
4. **Error handling**: Axios interceptors provide consistent error format across all API calls
5. **Route groups**: `(auth)` folder doesn't affect URL structure, used for organization
