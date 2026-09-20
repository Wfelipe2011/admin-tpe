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

export type SystemProfile = "COORDINATOR" | "ASSISTANT_COORDINATOR" | "ADMIN_ANALYST" | "PARTICIPANT" | "CAPTAIN" | "ASSISTANT_CAPTAIN"
export type GroupRole = "CAPTAIN" | "ASSISTANT_CAPTAIN" | "PARTICIPANT"

export interface PersonGroup {
  groupId: string
  name: string
  type: "MAIN" | "ADDITIONAL" | "SPECIAL"
  role: GroupRole
}

export interface Person {
  id: string
  name: string
  phone: string
  email: string
  sex: "MALE" | "FEMALE"
  profile: SystemProfile | null
  profilePhoto: string | null
  lastTrainingDate: string | null
  congregation: { id: number; name: string } | null
  petitions: { id: string; status: string } | null
  groups: PersonGroup[]
}

export interface PeopleResponse {
  total: number
  page: number
  pageSize: number
  items: Person[]
}

export interface AuditItem {
  id: string
  createdAt: string
  actorId: string | null
  actorName: string | null
  action: string
  entity: string
  entityId: string | null
  entityName: string | null
  metadata: Record<string, any> | null
}

export interface AuditResponse {
  total: number
  page: number
  pageSize: number
  items: AuditItem[]
}
