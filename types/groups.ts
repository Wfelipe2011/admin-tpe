export interface IGroups {
  id: string
  name: string
  configEndHour: string
  configMax: number
  configMin: number
  configStartHour: string
  configWeekday: string
  coordinatorId: null | string
  additionalInfo: AdditionalInfo | null
  type: "MAIN" | "ADDITIONAL" | "SPECIAL"
  status: string
  participants: number
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
