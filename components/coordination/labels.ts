// Rótulos em português compartilhados pelas abas da Coordenação.

export const PROFILE_LABEL: Record<string, string> = {
  COORDINATOR: "Coordenador",
  ASSISTANT_COORDINATOR: "Assistente de coordenação",
  ADMIN_ANALYST: "Analista",
  PARTICIPANT: "Participante",
  CAPTAIN: "Capitão (perfil antigo)",
  ASSISTANT_CAPTAIN: "Assistente (perfil antigo)",
}

// perfis que o coordenador pode atribuir (o cargo de capitão vive no grupo)
export const ASSIGNABLE_PROFILES = ["COORDINATOR", "ASSISTANT_COORDINATOR", "ADMIN_ANALYST", "PARTICIPANT"] as const

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
}

export const inputClass =
  "h-9 rounded-lg border border-gray-200 px-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#374192]/30"

/** yyyy-MM-dd (ou ISO) -> dd/MM/yyyy, sem passar por fuso horário. */
export function formatDateOnly(value: string | null | undefined): string {
  if (!value) return "sem data"
  const [y, m, d] = value.slice(0, 10).split("-")
  return `${d}/${m}/${y}`
}
