/**
 * API configuration constants
 * No magic numbers - all values defined here
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

export const API_TIMEOUT = 30 * 1000; // 30 seconds

export const RETRY_ATTEMPTS = 3;

export const RETRY_DELAY_MS = 1000; // milliseconds

export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const COMMON_HEADERS = {
  "Content-Type": "application/json",
} as const;

export const RETRYABLE_STATUS_CODES = [
  HTTP_STATUS_CODES.TOO_MANY_REQUESTS,
  HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
  HTTP_STATUS_CODES.SERVICE_UNAVAILABLE,
] as const;

export const AUTH_TOKEN_KEY = "auth_token";

export const AUTH_HEADER_PREFIX = "Bearer";
