export interface Availability {
  Monday: DayAvailability
  Tuesday: DayAvailability
  Wednesday: DayAvailability
  Thursday: DayAvailability
  Friday: DayAvailability
  Saturday: DayAvailability
  Sunday: DayAvailability
}

export interface DayAvailability {
  morning: boolean
  afternoon: boolean
  evening: boolean
}

export interface PetitionFormData {
  image?: string
  petitionId: string
  name: string
  birthDate: string
  sex: "MALE" | "FEMALE"
  civilStatus: string
  languages: string[]
  address: string
  city: string
  state: string
  zipCode: string
  phone: string
  email: string
  congregation: string
  baptismDate: string
  attributions: string[]
  hasMinorChild: boolean
  spouseParticipant: boolean
  availability: Availability
}

export interface PetitionDetail {
  id: string
  name: string
  protocol: string
  status: string
  publicUrl: string
  privateUrl: string
  createdAt: Date
  updatedAt: Date
}
