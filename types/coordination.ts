export type AlertLevel = "high" | "medium" | "info"

export interface OverviewAlert {
  key: string
  level: AlertLevel
  title: string
  description: string
  count: number
  href: string
  items: string[]
}

export interface GroupTypeTotals {
  groups: number
  capacity: number
  members: number
  vacancies: number
}

export interface CoordinationOverview {
  generatedAt: string
  volunteers: {
    total: number
    bySex: { MALE: number; FEMALE: number }
    active: { total: number; bySex: { MALE: number; FEMALE: number } }
    byPetition: Record<string, number>
    training: {
      withTraining: number
      withoutTraining: number
      activeWithTraining: number
      activeWithoutTraining: number
    }
    incomplete: { noAvailability: number; noCongregation: number }
  }
  roles: {
    coordinators: number
    assistantCoordinators: number
    adminAnalysts: number
    captains: number
    assistantCaptains: number
  }
  groups: {
    total: number
    open: number
    closed: number
    byType: { MAIN: GroupTypeTotals; ADDITIONAL: GroupTypeTotals; SPECIAL: GroupTypeTotals }
  }
  waitlist: {
    total: number
    bySex: { MALE: number; FEMALE: number }
    inMainGroups: number
    inAdditionalGroups: number
    groupsWithVacancies: number
    oldestWaitingSince: string | null
  }
  incidents: { total: number; last30Days: number }
  alerts: OverviewAlert[]
}
