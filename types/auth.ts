export enum ParticipantProfile {
  COORDINATOR = "COORDINATOR",
  CAPTAIN = "CAPTAIN",
  PARTICIPANT = "PARTICIPANT",
  ADMIN_ANALYST = "ADMIN_ANALYST",
  ASSISTANT_CAPTAIN = "ASSISTANT_CAPTAIN",
}

export interface IToken {
  sub: string
  name: string
  exp: number
  profile: ParticipantProfile | string
  profile_photo?: string
  groupId?: string
}
