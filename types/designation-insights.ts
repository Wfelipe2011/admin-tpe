// Hints de histórico (não-bloqueantes) — GET /designations/:id/insights (api-v2)
export interface PointHistoryHint {
  id: string
  name: string
  pointCountLast12m: number
  pointLastAt: string
}

export interface PairHistoryHint {
  participantIds: [string, string]
  names: [string, string]
  countLast12m: number
  lastAt: string
}

export interface AssignmentInsights {
  pointId: string
  pointName: string
  participants: PointHistoryHint[]
  pairs: PairHistoryHint[]
}

export interface DesignationInsights {
  assignments: AssignmentInsights[]
}

// POST /designations/:id/suggest-assignment (api-v2)
export interface SuggestAssignmentWarning {
  pointId: string
  pointName: string
  type: "repeat-pair" | "repeat-point" | "below-min"
  participantIds: string[]
  detail: string
}

export interface SuggestAssignmentResponse {
  assignments: { pointId: string; participantIds: string[] }[]
  unassignedParticipantIds: string[]
  warnings: SuggestAssignmentWarning[]
}
