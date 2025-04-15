export interface IDashboard {
  waitingList: number
  groups: number
  points: number
  averagePresence: number
  participants: Participants
  vacancies: number
  incidents: Incident[]
  trainings: Trainings
}

export interface Trainings {
  valid: number
  expired: number
}

export interface Incident {
  profilePhoto: string
  name: string
  count: number
}

export interface Participants {
  MALE: number
  FEMALE: number
}
