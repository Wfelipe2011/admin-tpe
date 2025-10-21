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
      <Card className="overflow-hidden relative p-2 sm:p-3">
        {/* Colored bookmark - mobile optimized */}
        <div
          className={`absolute top-0 right-0 w-2.5 h-5 sm:w-3 sm:h-6 ${isAbsent ? "bg-red-500" : "bg-green-600"}`}
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%)" }}
        />

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
            {participant.profile_photo ? (
              <Image
                src={participant.profile_photo || "/placeholder.svg"}
                alt={participant.name}
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-primary text-xs sm:text-sm font-medium">{participant.name.charAt(0)}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="font-medium text-[#333333] text-sm sm:text-base truncate">{participant.name}</span>
              {participant.profile === "CAPTAIN" && (
                <span className="text-xs text-[#666666] flex-shrink-0">(Capitão)</span>
              )}
            </div>
            <div className="text-xs sm:text-sm text-[#666666] truncate">{participant.phone}</div>
          </div>

          {isAbsent && (
            <button
              className="p-1 sm:p-1.5 rounded-full hover:bg-gray-100 flex-shrink-0"
              aria-label="Ver motivo da ausência"
              onClick={() => setIsReasonModalOpen(true)}
            >
              <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
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
