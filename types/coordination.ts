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
  incidents: {
    total: number
    last30Days: number
    // média de faltas por dia trabalhado, separada por tipo de grupo
    averages: { MAIN: { avg: number | null; groups: number } | null; ADDITIONAL: { avg: number | null; groups: number } | null }
  }
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

export interface WorkedGroup {
  groupId: string
  name: string
  type: "MAIN" | "ADDITIONAL" | "SPECIAL"
  firstAt: string
  lastAt: string
  /** dias (designações) em que a pessoa esteve envolvida nesse grupo */
  designations: number
  faltas: number
}

export interface PersonHistory {
  participant: { id: string; name: string }
  periodMonths: number
  currentGroups: { groupId: string; name: string; type: string; role: string }[]
  groupsWorked: WorkedGroup[]
  distinctGroups: number
  estimatedDepartures: number
  faltas: { total: number; daysWorked: number; perDay: number | null; baselinePerDay: number }
  events: { id: string; at: string; action: string; actorName: string | null; metadata: Record<string, any> | null }[]
  eventsSince: string | null
}

export interface TurnoverItem {
  participantId: string
  name: string
  currentGroups: string[]
  groupsWorked: WorkedGroup[]
  distinctGroups: number
  estimatedDepartures: number
  registeredMoves: number
  faltas: number
  daysWorked: number
  faltasPerDay: number | null
  attention: boolean
}

export interface TurnoverResponse {
  periodMonths: number
  baselinePerDay: number
  attentionFactor: number
  items: TurnoverItem[]
}
