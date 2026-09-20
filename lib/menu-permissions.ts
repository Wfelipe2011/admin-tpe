import { apiClient } from "@/lib/api-client"
import { setCustomMenuPermissions } from "@/lib/role-utils"

export interface MenuPermissionsResponse {
  permissions: Record<"ADMIN_ANALYST" | "CAPTAIN" | "ASSISTANT_CAPTAIN", string[]>
  /** true = o coordenador nunca mexeu; vale o padrão do código */
  isDefault: boolean
}

let loaded = false
let inFlight: Promise<void> | null = null

/**
 * Busca o menu por perfil configurado pelo coordenador e entrega pro role-utils.
 * Uma vez por carregamento da página (fica em memória); se falhar, segue o padrão do código.
 */
export function loadMenuPermissions(force = false): Promise<void> {
  if (loaded && !force) return Promise.resolve()
  if (inFlight && !force) return inFlight

  inFlight = apiClient
    .get<MenuPermissionsResponse>("/settings/menu-permissions", { endpoint: "new" })
    .then((res) => {
      setCustomMenuPermissions(res.isDefault ? null : res.permissions)
      loaded = true
    })
    .catch(() => {
      // sem resposta: mantém o padrão (não trava o app)
    })
    .finally(() => {
      inFlight = null
    })
  return inFlight
}
