import type { AuditItem } from "@/types/coordination"
import { CHANGE_REASON_LABEL, slotsLabel } from "@/lib/group-change"
import { FIELD_LABEL, GROUP_ROLE_LABEL, MENU_LABEL, PROFILE_LABEL, formatDateOnly } from "@/components/coordination/labels"

/** Texto curto do que mudou, a partir do metadata de cada tipo de ação (usado no Histórico de ações e no histórico do voluntário). */
export function describeAudit(item: Pick<AuditItem, "action" | "metadata">): string {
  const m = item.metadata ?? {}
  switch (item.action) {
    case "PROFILE_CHANGE":
      return `${PROFILE_LABEL[m.from] ?? m.from ?? "—"} → ${PROFILE_LABEL[m.to] ?? m.to ?? "—"}`
    case "GROUP_JOIN":
    case "GROUP_LEAVE":
      return m.groupName ?? ""
    case "GROUP_ROLE_CHANGE":
      return `${m.groupName ?? ""}: ${GROUP_ROLE_LABEL[m.from] ?? m.from} → ${GROUP_ROLE_LABEL[m.to] ?? m.to}`
    case "TRAINING_CHANGE":
      return `${formatDateOnly(m.from)} → ${formatDateOnly(m.to)}`
    case "GROUP_TRANSFER":
      return `${m.fromGroupName ?? "?"} → ${m.toGroupName ?? "?"}`
    case "GROUP_CHANGE_REQUESTED":
      return `quer ir: ${slotsLabel(m.slots ?? [])} · ${CHANGE_REASON_LABEL[m.reason] ?? m.reason ?? ""}${m.note ? ` · ${m.note}` : ""}`
    case "GROUP_CHANGE_RESOLVED": {
      const how: Record<string, string> = { MOVED: "trocou de grupo", ADDED: "entrou no dia e horário que queria", LEFT: "saiu de todos os grupos" }
      return `${how[m.resolution] ?? m.resolution ?? ""}${m.groupName ? ` (${m.groupName})` : ""}`
    }
    case "SETTING_CHANGE":
      return m.label ?? m.key ?? ""
    case "PERMISSIONS_CHANGE": {
      const profiles: Record<string, string> = { ADMIN_ANALYST: "Analista", CAPTAIN: "Capitão", ASSISTANT_CAPTAIN: "Assistente de capitão" }
      return Object.entries((m.changes ?? {}) as Record<string, { added: string[]; removed: string[] }>)
        .map(([p, c]) => `${profiles[p] ?? p}: ${[...c.added.map((x) => `+${MENU_LABEL[x] ?? x}`), ...c.removed.map((x) => `−${MENU_LABEL[x] ?? x}`)].join(", ")}`)
        .join(" · ")
    }
    case "PARTICIPANT_UPDATE":
    case "GROUP_UPDATE":
    case "POINT_UPDATE":
      // só os NOMES dos campos enviados (os valores não são guardados no histórico)
      return Array.isArray(m.fields) && m.fields.length ? `campos: ${m.fields.map((k: string) => FIELD_LABEL[k] ?? k).join(", ")}` : ""
    default:
      return ""
  }
}
