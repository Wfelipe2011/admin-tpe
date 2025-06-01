"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useParticipantsAttendance } from "@/hooks/use-participants-attendance"
import type { Participant } from "@/types/participants" // Assuming this type exists

interface ParticipantsTabProps {
  participants: Participant[] // Participants from DesignarPage
  isAbsent: (participant: Participant) => boolean
  onRegisterAbsence: (participantId: string) => void
  loading: boolean
  groupId?: string // New groupId prop
}

export const ParticipantsTab = ({
  participants: propsParticipants,
  isAbsent: propsIsAbsent,
  onRegisterAbsence: propsOnRegisterAbsence,
  loading: propsLoading,
  groupId,
}: ParticipantsTabProps) => {
  // The useParticipantsAttendance hook will now be responsible for fetching based on groupId
  // or potentially using the groupId for other logic if participants are primarily from props.
  // For this example, let's assume useParticipantsAttendance will use the groupId.
  // If propsParticipants should be the primary source, this hook call might change or be conditional.
  const {
    participants: hookParticipants, // These might be different from propsParticipants
    loading: hookLoading,
    registerAbsence: hookRegisterAbsence,
    hasIncidentHistory,
  } = useParticipantsAttendance({ groupId }) // Pass groupId to the hook

  // Determine which set of participants and loading state to use.
  // This depends on whether the hook refetches based on groupId or if propsParticipants are already filtered.
  // For simplicity, let's assume the hook provides the definitive list for this tab when groupId is involved.
  // This part might need further refinement based on your exact data flow logic.
  const displayParticipants = groupId ? hookParticipants : propsParticipants
  const isLoading = groupId ? hookLoading : propsLoading

  // Separar participantes em dois grupos: sem histórico e com histórico
  const participantsWithoutHistory = displayParticipants.filter((p) => !hasIncidentHistory(p))
  const participantsWithHistory = displayParticipants.filter((p) => hasIncidentHistory(p))

  // Concatenar os dois grupos para que os com histórico apareçam por último
  const sortedParticipants = [...participantsWithoutHistory, ...participantsWithHistory]

  return (
    <Card className="max-w-5xl mx-auto border-none shadow-none">
      <CardHeader className="pb-2 sm:pb-4 flex flex-row items-center justify-between">
        <CardTitle className="text-base sm:text-lg">Chamada de Voluntários</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-primary/20 mb-4"></div>
              <div className="h-4 w-48 bg-primary/20 rounded mb-2"></div>
              <div className="h-3 w-32 bg-primary/10 rounded"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedParticipants.length > 0 ? (
              sortedParticipants.map((participant) => (
                <div
                  key={participant.id}
                  className={`flex flex-row items-center justify-between p-2 border rounded-md gap-2 ${
                    propsIsAbsent(participant) ? "bg-red-50 border-red-200" : "" // Using propsIsAbsent
                  } ${hasIncidentHistory(participant) ? "opacity-60" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-8 w-8 rounded-full ${
                        propsIsAbsent(participant) ? "bg-red-100" : "bg-primary/10"
                      } flex items-center justify-center flex-shrink-0`}
                    >
                      {participant.profile_photo ? (
                        <img
                          src={participant.profile_photo || "/placeholder.svg"}
                          alt={participant.name}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <span
                          className={`${propsIsAbsent(participant) ? "text-red-500" : "text-primary"} text-sm font-medium`}
                        >
                          {participant.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium flex items-center gap-1 truncate">
                        {participant.name}
                        {propsIsAbsent(participant) && (
                          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" title="Participante ausente" />
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {participant.profile === "CAPTAIN"
                          ? "Capitão"
                          : participant.profile === "COORDINATOR"
                            ? "Coordenador"
                            : "Voluntário"}
                      </div>
                    </div>
                  </div>
                  {!hasIncidentHistory(participant) && (
                    <Button
                      variant={propsIsAbsent(participant) ? "outline" : "destructive"}
                      size="sm"
                      onClick={() =>
                        groupId ? hookRegisterAbsence(participant.id) : propsOnRegisterAbsence(participant.id)
                      } // Decide which registerAbsence to use
                      disabled={isLoading || propsIsAbsent(participant)}
                      className="w-auto"
                    >
                      Ausentar
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">Não há voluntários disponíveis</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
