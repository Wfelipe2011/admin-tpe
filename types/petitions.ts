export type Status = "WAITING_INFORMATION" | "WAITING" | "ACTIVE" | "SUSPENDED" | "EXCLUDED" | "CREATED" | "ALL"

export interface ParticipantGroup {
  id: string
  participantId: string
  groupId: string
  profile: string
  group: {
    id: string
    name: string
    configEndHour: string
    configMax: number
    configMin: number
    configStartHour: string
    configWeekday: string
    coordinatorId: string
    additionalInfo: string | null
    type: string
    status: string
  }
}

export interface Participant {
  id: string
  name: string
  phone: string
  profilePhoto?: string
  participantsGroup: ParticipantGroup[]
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
