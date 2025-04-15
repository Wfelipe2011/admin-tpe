export interface IDesignationHistory {
  id: string
  name: Name
  groupId: string
  status: Status
  createdAt: Date
  updatedAt: Date
  designationDate: Date
  designationEndDate: Date
  mandatoryPresence: boolean
  cancellationJustification: null | string
}

export enum Name {
  DesignacaoQuartaFeiraManha = "Designação Quarta-feira (Manhã)",
}

export enum Status {
  Archived = "ARCHIVED",
  Open = "OPEN",
  Completed = "COMPLETED",
  Cancelled = "CANCELLED",
  InProgress = "IN_PROGRESS",
}
