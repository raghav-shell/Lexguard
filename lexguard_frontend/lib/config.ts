/**
 * Centralized API configuration for LEXGUARD frontend.
 * Automatically switches between local dev and deployed production backend.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://127.0.0.1:8000"
