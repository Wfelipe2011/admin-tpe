const DEFAULT_NEW_API_URL = "https://server-hmg.tpedigital.com.br"

function normalizeBaseUrl(value: string | undefined, fallback: string): string {
  return (value?.trim() || fallback).replace(/\/+$/, "")
}

/**
 * Só a URL do BFF api-v2 é usada pelo front. Os handlers da legacy permanecem
 * disponíveis durante a transição, mas não são consumidos por este app.
 *
 * A página pública `/public/start/:id`, que o link do WhatsApp abre para o
 * voluntário, continua servida pela legacy, mas o front não a chama: ela é
 * aberta direto no navegador. Por isso `NEXT_PUBLIC_LEGACY_API_URL` saiu daqui.
 */
export const newApiBaseUrl = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_NEW_API_URL,
  DEFAULT_NEW_API_URL,
)
