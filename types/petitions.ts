export type Status = "WAITING_INFORMATION" | "WAITING" | "ACTIVE" | "SUSPENDED" | "EXCLUDED" | "CREATED" | "ALL"

export interface Participant {
  id: string
  name: string
  phone: string
}

export interface IPetitions {
  id: string
  name: string
  protocol: string
  status: Status
  createdAt: Date
  updatedAt: Date
  participants: Participant[]
  publicUrl?: string
}
