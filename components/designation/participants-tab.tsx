"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useParticipantsAttendance } from "@/hooks/use-participants-attendance"
import type { IParticipants as Participant } from "@/types/participants"
import type { Incident } from "@/types/designation-participants"
import { useState, useMemo } from "react"

interface ParticipantsTabProps {
  participants: Participant[] | Incident[]
  isAbsent: (participant: Participant | Incident) => boolean
  onRegisterAbsence: (participantId: string) => void
  loading: boolean
  groupId?: string
  designationId?: string
}

export const ParticipantsTab = ({
  participants: propsParticipants,
  isAbsent: propsIsAbsent,
  onRegisterAbsence: propsOnRegisterAbsence,
  loading: propsLoading,
  groupId,
  designationId,
}: ParticipantsTabProps) => {
  const [searchTerm, setSearchTerm] = useState("")

  const {
    participants: hookParticipants,
    loading: hookLoading,
    registerAbsence: hookRegisterAbsence,
    hasIncidentHistory,
  } = useParticipantsAttendance({ groupId, designationId })

  // Garantir que sempre temos um array válido
  const displayParticipants = groupId ? hookParticipants || [] : propsParticipants || []
  const isLoading = groupId ? hookLoading : propsLoading
  // Filter participants based on search term
  const filteredParticipants = useMemo(() => {
    if (!displayParticipants || displayParticipants.length === 0) return []
    if (!searchTerm) return displayParticipants

    return displayParticipants.filter((p) => p?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [displayParticipants, searchTerm])

  // Separar participantes em dois grupos: sem histórico e com histórico
  const participantsWithoutHistory = filteredParticipants.filter((p) => p && !hasIncidentHistory(p))
  const participantsWithHistory = filteredParticipants.filter((p) => p && hasIncidentHistory(p))

  // Concatenar os dois grupos para que os com histórico apareçam por último
  const sortedParticipants = [...participantsWithoutHistory, ...participantsWithHistory]

  // Statistics
  const totalParticipants = displayParticipants?.length || 0
  const presentCount = displayParticipants?.filter((p) => p && !propsIsAbsent(p)).length || 0
  const absentCount = totalParticipants - presentCount

  return (
    <>

      <CardHeader className="space-y-2 sm:space-y-4 pb-3 sm:pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
          <CardTitle className="text-base sm:text-xl">Chamada de Voluntários</CardTitle>

          {/* Statistics - Mobile optimized */}
          <div className="flex gap-1 sm:gap-2 text-xs">
            <div className="px-2 sm:px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-200">
              Presentes: <span className="font-semibold">{presentCount}</span>
            </div>
            <div className="px-2 sm:px-3 py-1 bg-red-50 text-red-700 rounded-full border border-red-200">
              Ausentes: <span className="font-semibold">{absentCount}</span>
            </div>
          </div>
        </div>

        {/* Search bar - Mobile optimized */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar voluntário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 sm:h-10"
          />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex justify-center py-8 sm:py-12">
            <div className="animate-pulse flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/20"></div>
              <div className="h-4 w-48 bg-primary/20 rounded"></div>
              <div className="h-3 w-32 bg-primary/10 rounded"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-1 sm:space-y-2">
            {sortedParticipants.length > 0 ? (
              <div className="grid grid-cols-1 gap-1 sm:gap-2">
                {sortedParticipants.map((participant) => (
                  <div
                    key={participant.id}
                    className={`flex flex-row items-center justify-between p-3 border rounded-lg gap-3 transition-all hover:shadow-sm ${propsIsAbsent(participant) ? "bg-red-50 border-red-200" : "bg-white"
                      } ${hasIncidentHistory(participant) ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`h-8 w-8 sm:h-12 sm:w-12 rounded-full ${propsIsAbsent(participant) ? "bg-red-100" : "bg-primary/10"
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
                            className={`${propsIsAbsent(participant) ? "text-red-600" : "text-primary"
                              } text-sm sm:text-lg font-semibold`}
                          >
                            {participant.name?.charAt(0)?.toUpperCase() || "?"}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm flex items-center gap-2 truncate">
                          {participant.name}
                          {propsIsAbsent(participant) && (
                            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
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
                        }
                        disabled={isLoading || propsIsAbsent(participant)}
                        className="flex-shrink-0 h-8 px-3 text-xs"
                      >
                        {propsIsAbsent(participant) ? "Ausente" : "Ausentar"}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-12">
                <div className="text-muted-foreground text-sm">
                  {searchTerm ? "Nenhum voluntário encontrado" : "Não há voluntários disponíveis"}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

    </>
  )
}
