export interface IParticipants {
  id: string
  name: string
  phone: string
  email: string
  profilePhoto: string
  profile: string
  computed: null | string
  sex: string
  address: null | string
  attributions: string[]
  availability: Availability[]
  baptismDate: Date | null
  birthDate: Date | null
  lastTrainingDate: Date | null
  city: null | string
  congregationId: null
  hasMinorChild: boolean | null
  languages: string[]
  petitionId: null
  spouseParticipant: boolean | null
  state: null | string
  zipCode: null | string
  cpf: null
  civilStatus: null | string
  petitions: null
  congregation: Congregations | null
  groups: Group[]
}

export interface Availability {
  evening: boolean
  morning: boolean
  weekDay: number
  afternoon: boolean
  updatedAt: string | null
}

export interface Group {
  id: string
  name: string
  configEndHour: string
  configMax: number
  configMin: number
  configStartHour: string
  configWeekday: string
  coordinatorId: null | string
  additionalInfo: AdditionalInfo | null
  type: string
  status: string
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

export interface Congregations {
  id: number
  name: string
  city: string
  state: string
}
