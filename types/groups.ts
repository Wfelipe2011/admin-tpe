export interface IGroups {
  id: string
  name: string
  configEndHour: string
  configMax: number
  configMin: number
  configStartHour: string
  configWeekday: string
  coordinatorId: null | string
  type: "MAIN" | "ADDITIONAL" | "SPECIAL"
  status: string
  participants: number
}
