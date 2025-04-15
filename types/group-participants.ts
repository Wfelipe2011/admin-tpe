export interface IGroupParticipants {
  id: string
  name: string
  configEndHour: string
  configMax: number
  configMin: number
  configStartHour: string
  configWeekday: string
  coordinatorId: null
  additionalInfo: AdditionalInfo
  type: string
  status: string
  participants: Participant[]
}

export interface AdditionalInfo {
  address: Address
  observation: string
}

export interface Address {
  number: string
  street: string
  neighborhood: string
}

export enum Profile {
  Coordinator = "COORDINATOR",
  Participant = "PARTICIPANT",
}

export enum Sex {
  Female = "FEMALE",
  Male = "MALE",
}

export interface Participant {
  id: string
  name: string
  phone: string
  profilePhoto: string
  profile: string
  computed: string | null
  sex: string
  address: string | null
  attributions: string[]
  availability: Availability[]
  baptismDate: string | null
  birthDate: string | null
  lastTrainingDate: string | null
  city: string | null
  congregationId: number | null
  hasMinorChild: boolean | null
  languages: string[]
  petitionId: string | null
  spouseParticipant: boolean | null
  state: string | null
  zipCode: string | null
  congregation: Congregations | null
  groups: Group[] | null
  petitions: any
}

export interface Availability {
  evening: boolean
  morning: boolean
  weekDay: number
  afternoon: boolean
}

export interface Congregations {
  id: number
  name: string
  city: string
  state: string
}

export interface Group {
  id: string
  name: string
  configEndHour: string
  configMax: number
  configMin: number
  configStartHour: string
  configWeekday: string
  coordinatorId: string | null
  additionalInfo: AdditionalInfo | null
  type: string
  status: string
}
