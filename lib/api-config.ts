const DEFAULT_LEGACY_API_URL = "https://api.tpedigital.com.br/dev"
const DEFAULT_NEW_API_URL = "https://server.tpedigital.com.br"

function normalizeBaseUrl(value: string | undefined, fallback: string): string {
  return (value?.trim() || fallback).replace(/\/+$/, "")
}

export const legacyApiBaseUrl = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_LEGACY_API_URL,
  DEFAULT_LEGACY_API_URL,
)

export const newApiBaseUrl = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_NEW_API_URL,
  DEFAULT_NEW_API_URL,
)
