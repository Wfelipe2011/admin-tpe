"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import Image from "next/image"
import { AbsenceModal } from "./absence-modal"
import { ReasonModal } from "./reason-modal"
import { apiClient } from "@/lib/api-client"
import type { IParticipants } from "@/types/designation"

interface ParticipantCardLargeProps {
  participant: IParticipants
  designationId?: string
  onStatusChange: () => void
}

export function ParticipantCardLarge({ participant, designationId, onStatusChange }: ParticipantCardLargeProps) {
  const [isAbsenceModalOpen, setIsAbsenceModalOpen] = useState(false)
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Check if participant is absent (status can be "ACTIVE" or "OPEN")
  const isAbsent =
    participant.incident_history !== null &&
    (participant.incident_history.status === "ACTIVE" || participant.incident_history.status === "OPEN")

  const handleRevertAbsence = async () => {
    if (!participant.incident_history?.id) return

    setIsLoading(true)
    try {
      await apiClient.delete(`/designations/${designationId}/participants/${participant.id}/incidences/${participant.incident_history.id}`)
      onStatusChange()
    } catch (error) {
      console.error("Error reverting absence:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return ""
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  return (
    <>
      <Card className="overflow-hidden relative">
        {/* Colored bookmark - smaller size */}
        <div
          className={`absolute top-0 right-0 w-4 h-8 ${isAbsent ? "bg-red-500" : "bg-green-600"}`}
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%)" }}
        />

        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
              {participant.profile_photo ? (
                <Image
                  src={participant.profile_photo || "/placeholder.svg"}
                  alt={participant.name}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-primary text-lg font-medium">{participant.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <h3 className="font-medium text-lg">{participant.name}</h3>
              <p className="text-gray-500">{participant.phone}</p>
            </div>
          </div>

          <div className="mt-6 min-h-[24px]">
            {isAbsent && participant.incident_history ? (
              <p className="text-gray-700">{truncateText(participant.incident_history.reason, 50)}</p>
            ) : (
              <p className="text-gray-500">-</p>
            )}
          </div>

          <div className="flex gap-2 mt-6">
            {isAbsent && participant.incident_history ? (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 flex items-center justify-center gap-1.5"
                onClick={() => setIsReasonModalOpen(true)}
              >
                <Eye className="h-4 w-4" />
                Ver mais
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="flex-1 flex items-center justify-center gap-1.5" disabled>
                <Eye className="h-4 w-4" />
                Ver mais
              </Button>
            )}

            {isAbsent ? (
              <Button variant="default" size="sm" className="flex-1" onClick={handleRevertAbsence} disabled={isLoading}>
                {isLoading ? "Processando..." : "Reverter"}
              </Button>
            ) : (
              <Button variant="default" size="sm" className="flex-1" onClick={() => setIsAbsenceModalOpen(true)}>
                Ausentar
              </Button>
            )}
          </div>
        </div>
      </Card>

      {designationId && (
        <AbsenceModal
          isOpen={isAbsenceModalOpen}
          onClose={() => setIsAbsenceModalOpen(false)}
          participantId={participant.id}
          designationId={designationId}
          onSuccess={onStatusChange}
        />
      )}

      {participant.incident_history && (
        <ReasonModal
          isOpen={isReasonModalOpen}
          onClose={() => setIsReasonModalOpen(false)}
          participantName={participant.name}
          reason={participant.incident_history.reason}
        />
      )}
    </>
  )
}
