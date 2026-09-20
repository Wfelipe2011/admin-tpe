// Rótulos em português compartilhados pelas abas da Coordenação.

export const PROFILE_LABEL: Record<string, string> = {
  COORDINATOR: "Coordenador",
  ASSISTANT_COORDINATOR: "Assistente de coordenação",
  ADMIN_ANALYST: "Analista",
  PARTICIPANT: "Participante (sem acesso)",
  CAPTAIN: "Capitão (perfil antigo)",
  ASSISTANT_CAPTAIN: "Assistente (perfil antigo)",
}

// perfis que o coordenador pode atribuir. Capitão e assistente NÃO são perfil global: vêm do cargo
// no grupo. O login só entende Coordenador e Analista (Participante não entra no sistema).
export const ASSIGNABLE_PROFILES = ["COORDINATOR", "ADMIN_ANALYST", "PARTICIPANT"] as const

export const GROUP_ROLE_LABEL: Record<string, string> = {
  CAPTAIN: "Capitão",
  ASSISTANT_CAPTAIN: "Assistente",
  PARTICIPANT: "Participante",
}

export const PETITION_STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Ativa",
  WAITING: "Na espera",
  WAITING_INFORMATION: "Aguardando informação",
  CREATED: "Criada",
  TEMPORARY: "Temporária",
  SUSPENDED: "Suspensa",
  INACTIVE: "Inativa",
  EXPIRED: "Expirada",
  EXCLUDED: "Excluída",
}

export const AUDIT_ACTION_LABEL: Record<string, string> = {
  PROFILE_CHANGE: "Mudou o perfil",
  GROUP_JOIN: "Entrou no grupo",
  GROUP_LEAVE: "Saiu do grupo",
  GROUP_ROLE_CHANGE: "Mudou o cargo no grupo",
  TRAINING_CHANGE: "Alterou o treinamento",
  SETTING_CHANGE: "Alterou uma configuração",
  PERMISSIONS_CHANGE: "Alterou permissões",
  GROUP_TRANSFER: "Trocou de grupo",
  GROUP_CHANGE_REQUESTED: "Pediu troca de grupo",
  GROUP_CHANGE_CANCELLED: "Cancelou pedido de troca",
  GROUP_CHANGE_RESOLVED: "Pedido de troca encerrado",
}

export const inputClass =
  "h-9 rounded-lg border border-gray-200 px-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#374192]/30"

/** yyyy-MM-dd (ou ISO) -> dd/MM/yyyy, sem passar por fuso horário. */
export function formatDateOnly(value: string | null | undefined): string {
  if (!value) return "sem data"
  const [y, m, d] = value.slice(0, 10).split("-")
  return `${d}/${m}/${y}`
}

// Telas do menu e quem pode ser liberado/escondido pelo coordenador (Aba "Menu por perfil").
// lock: "always" = sempre visível (página inicial); "coordinator" = só coordenador (a API dessa tela exige COORDINATOR).
export const MENU_ROWS: { path: string; label: string; lock?: "always" | "coordinator"; note?: string }[] = [
  { path: "/dashboard", label: "Dashboard", lock: "always", note: "Página inicial: sempre liberada" },
  { path: "/dashboard/lista-atencao", label: "Lista de Atenção" },
  { path: "/consultar/historico", label: "Consultar" },
  { path: "/lista-designacao", label: "Lista para Designação" },
  { path: "/peticoes", label: "Petições" },
  { path: "/grupos", label: "Grupos" },
  { path: "/pontos", label: "Pontos" },
  { path: "/lista-espera", label: "Lista de Espera", lock: "coordinator" },
  { path: "/coordenacao", label: "Coordenação", lock: "coordinator" },
]

// Só existem no token estes perfis: o login da legacy emite Coordenador, Analista e Capitão/Assistente (pelo cargo no grupo).
export const MENU_PROFILE_COLUMNS: { profile: "ADMIN_ANALYST" | "CAPTAIN" | "ASSISTANT_CAPTAIN"; label: string }[] = [
  { profile: "ADMIN_ANALYST", label: "Analista" },
  { profile: "CAPTAIN", label: "Capitão" },
  { profile: "ASSISTANT_CAPTAIN", label: "Assistente de capitão" },
]

export const MENU_LABEL: Record<string, string> = Object.fromEntries(MENU_ROWS.map((r) => [r.path, r.label]))
