import "server-only"
import axios from "axios"
import { newApiBaseUrl } from "@/lib/api-config"

// Server actions não podem executar getAuthToken(), que pertence ao cliente.
// A URL é a mesma do ApiClient do navegador; não existe fallback para a legacy.
export const serverApiClient = axios.create({
  baseURL: newApiBaseUrl,
  timeout: 30000,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
})
