// "Quer trocar de grupo": tipos e rótulos compartilhados (card do capitão, ficha, Lista de Espera, Histórico).

export type ChangePeriod = "morning" | "afternoon" | "evening"

export interface DesiredSlot {
  weekDay: number // 0 = domingo ... 6 = sábado
  period: ChangePeriod
}

export type ChangeReason = "SCHEDULE" | "DISTANCE" | "HEALTH_FAMILY" | "WORK_STUDY" | "OTHER"

export interface ChangeRequestSummary {
  id: string
  reason: ChangeReason | string
  note: string | null
  desiredSlots: DesiredSlot[]
  requestedByName: string | null
  createdAt: string
}

export const CHANGE_REASON_LABEL: Record<string, string> = {
  SCHEDULE: "Horário",
  DISTANCE: "Distância",
  HEALTH_FAMILY: "Saúde ou família",
  WORK_STUDY: "Trabalho ou estudo",
  OTHER: "Outro",
}

export const WEEKDAY_FULL = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]
export const WEEKDAY_SHORT = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"]
export const PERIOD_LABEL: Record<ChangePeriod, string> = { morning: "Manhã", afternoon: "Tarde", evening: "Noite" }
export const PERIODS: ChangePeriod[] = ["morning", "afternoon", "evening"]

/** "qua manhã, sex tarde" */
export function slotsLabel(slots: DesiredSlot[]): string {
  return slots.map((s) => `${WEEKDAY_SHORT[s.weekDay] ?? "?"} ${PERIOD_LABEL[s.period]?.toLowerCase() ?? s.period}`).join(", ")
}
