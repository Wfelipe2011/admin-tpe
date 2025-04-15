export interface DesignationParticipant {
  event?: string
  createdAt?: Date
  updatedAt?: Date
  expirationDate?: Date
  point?: string
  participants?: Participant[]
  publication_carts?: any[]
  incident_history?: null
  status?: string
}

export interface Participant {
  name: string
  profile_photo?: string
}
