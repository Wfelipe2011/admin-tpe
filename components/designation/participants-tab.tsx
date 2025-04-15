"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, UserX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useParticipantsAttendance } from "@/hooks/use-participants-attendance"

export const ParticipantsTab = () => {
  const { participants, loading, registerAbsence, hasIncidentHistory } = useParticipantsAttendance()

  // Separar participantes em dois grupos: sem histórico e com histórico
  const participantsWithoutHistory = participants.filter((p) => !hasIncidentHistory(p))
  const participantsWithHistory = participants.filter((p) => hasIncidentHistory(p))

  // Concatenar os dois grupos para que os com histórico apareçam por último
  const sortedParticipants = [...participantsWithoutHistory, ...participantsWithHistory]

  return (
    <Card className="max-w-5xl mx-auto border-none shadow-none">
      <CardHeader className="pb-2 sm:pb-4 flex flex-row items-center justify-between">
        <CardTitle className="text-base sm:text-lg">Chamada de Voluntários</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
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
                    participant.isAbsent ? "bg-red-50 border-red-200" : ""
                  } ${hasIncidentHistory(participant) ? "opacity-60" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-8 w-8 rounded-full ${
                        participant.isAbsent ? "bg-red-100" : "bg-primary/10"
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
                          className={`${participant.isAbsent ? "text-red-500" : "text-primary"} text-sm font-medium`}
                        >
                          {participant.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium flex items-center gap-1 truncate">
                        {participant.name}
                        {participant.isAbsent && (
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
                      variant={participant.isAbsent ? "outline" : "destructive"}
                      size="sm"
                      onClick={() => registerAbsence(participant.id)}
                      disabled={loading || participant.isAbsent}
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
