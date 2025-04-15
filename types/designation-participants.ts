export interface IDesignationParticipants {
  incidents: Incident[]
  assignmentsFiltered: any[]
  cancellationJustification: string
  mandatoryPresence: boolean
  total: Total
  id: string
  group: Group
  status: string
  assignments: Assignment[]
  participants: Incident[]
  createdAt: Date
  updatedAt: Date
}

export interface Assignment {
  id: string
  point: Point
  publication_carts: PublicationCart[]
  participants: any[]
  config: AssignmentConfig
  error: string
}

export interface AssignmentConfig {
  max: number
  min: number
}

export interface Point {
  id: string
  name: string
  status: boolean
}

export interface PublicationCart {
  id: string
  name: string
}

export interface Group {
  config: GroupConfig
  id: string
  name: string
}

export interface GroupConfig {
  weekday: string
  startHour: string
  endHour: string
  minParticipants: number
  maxParticipants: number
}

export interface Incident {
  id: string
  name: string
  cpf: null
  phone: string
  profile_photo: string
  sex: Sex
  incident_history: IncidentHistory | null
  profile: Profile
}

export interface IncidentHistory {
  id: string
  reason: string
  status: string
}

export enum Profile {
  AdminAnalyst = "ADMIN_ANALYST",
  Captain = "CAPTAIN",
  Coordinator = "COORDINATOR",
  Participant = "PARTICIPANT",
}

export enum Sex {
  Female = "FEMALE",
  Male = "MALE",
}

export interface Total {
  participants: number
  vacancies: number
}
