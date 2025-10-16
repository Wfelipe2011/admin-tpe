export interface Point {
  id: string
  name: string
  locationPhoto?: string
}

export interface PointPublicationCart {
  id: string
  pointId: string
  minParticipants: number
  maxParticipants: number
  status: boolean
  publicationCartId: string
  groupId: string
  point: Point
}

export interface GroupPoint {
  id: string
  pointId: string
  pointName: string
  cartName?: string
  minParticipants: number
  maxParticipants: number
  status: boolean
  groupId: string
  locationPhoto?: string
}

export interface CreateGroupPointRequest {
  pointName: string
  cartName: string
  minParticipants: number
  maxParticipants: number
  status: boolean
  groupId: string
}

export interface UpdateGroupPointRequest {
  pointName: string
  cartName: string
  minParticipants: number
  maxParticipants: number
  status: boolean
}

// API-specific interfaces for request payloads
export interface CreatePointApiPayload {
  pointName: string
  cartName: string
  minParticipants: number
  maxParticipants: number
  status: boolean
}

export interface UpdatePointApiPayload {
  pointName: string
  cartName: string
  minParticipants: number
  maxParticipants: number
  status: boolean
}