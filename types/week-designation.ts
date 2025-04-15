export enum DesignationStatus {
  OPEN = "OPEN",
  CANCELLED = "CANCELLED",
  CLOSED = "CLOSED",
  IN_PROGRESS = "IN_PROGRESS",
}

export interface WeekDesignation {
  event: string
  point: string
  publication_carts: string[]
  participants?: {
    name: string
    profile_photo: string
  }[]
  createdAt: Date
  updatedAt: Date
  expirationDate: Date
  incident_history: IncidentHistory | null
  status: DesignationStatus
}

export interface IncidentHistory {
  id: string
  reason: string
  status: string
}

export const DesignationStatusMap = {
  OPEN: "Aberto",
  CANCELLED: "Cancelado",
  CLOSED: "Fechado",
  IN_PROGRESS: "Em Progresso",
}
