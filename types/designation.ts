export interface IDesignation {
  id: string
  name: string
  configWeekday: string
  coordinator: Coordinator
  designation: Designation
}

export interface Coordinator {
  id: string
  name: string
  cpf: null
  email: string
  phone: string
  profile_photo: string
  profile: string
  computed: string
  sex: string
}

export interface Designation {
  id: string
  name: string
  groupId: string
  status: string
  createdAt: Date
  updatedAt: Date
  designationDate: Date
  designationEndDate: Date
  mandatoryPresence: boolean
  cancellationJustification: null
}

export interface IParticipants {
  id: string
  name: string
  phone: string
  profile_photo: string
  profile: Profile
  incident_history: IncidentHistory | null
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
