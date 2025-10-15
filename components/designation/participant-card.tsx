"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Eye } from "lucide-react"
import Image from "next/image"
import { AbsenceModal } from "./absence-modal"
import { ReasonModal } from "./reason-modal"
import { apiClient } from "@/lib/api-client"
import type { IParticipants } from "@/types/designation"

interface ParticipantCardProps {
  participant: IParticipants
  designationId?: string
  onStatusChange?: () => void
}

export function ParticipantCard({ participant, designationId, onStatusChange }: ParticipantCardProps) {
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
      if (onStatusChange) onStatusChange()
    } catch (error) {
      console.error("Error reverting absence:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card className="overflow-hidden relative p-3">
        {/* Colored bookmark - smaller size */}
        <div
          className={`absolute top-0 right-0 w-3 h-6 ${isAbsent ? "bg-red-500" : "bg-green-600"}`}
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%)" }}
        />

        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
            {participant.profile_photo ? (
              <Image
                src={participant.profile_photo || "/placeholder.svg"}
                alt={participant.name}
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-primary text-sm font-medium">{participant.name.charAt(0)}</span>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{participant.name}</span>
              {participant.profile === "CAPTAIN" && <span className="text-xs text-muted-foreground">(Capitão)</span>}
            </div>
            <div className="text-sm text-gray-500">{participant.phone}</div>
          </div>

          {isAbsent && (
            <button
              className="p-1.5 rounded-full hover:bg-gray-100"
              aria-label="Ver motivo da ausência"
              onClick={() => setIsReasonModalOpen(true)}
            >
              <Eye className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </Card>

      {onStatusChange && designationId && (
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
