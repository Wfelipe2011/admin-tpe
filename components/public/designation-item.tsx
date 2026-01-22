"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { type WeekDesignation, DesignationStatusMap } from "@/types/week-designation"

interface DesignationItemProps {
  designation: WeekDesignation
  isLast: boolean
  participantId?: string
  onRefuse: () => void
  showRefuseButton?: boolean
}

export function DesignationItem({
  designation,
  isLast,
  participantId,
  onRefuse,
  showRefuseButton = true,
}: DesignationItemProps) {
  const getStatusClass = (status: string) => {
    switch (status) {
      case "OPEN":
        return "border-[#374192] text-[#374192] bg-[#374192]/10"
      case "CANCELLED":
        return "border-[#E74C3C] text-[#E74C3C] bg-[#E74C3C]/10"
      case "CLOSED":
        return "border-[#2ECC71] text-[#2ECC71] bg-[#2ECC71]/10"
      case "IN_PROGRESS":
        return "border-[#F1C40F] text-[#F1C40F] bg-[#F1C40F]/10"
      default:
        return "border-gray-300 text-gray-600 bg-gray-50"
    }
  }

  return (
    <div className="flex flex-col">
      {/* Status Badge */}
      <div className="flex justify-end mb-3">
        {participantId && (
          <span
            className={`text-xs px-3 py-1 rounded-full font-medium border ${getStatusClass(
              designation.status,
            )}`}
          >
            {DesignationStatusMap[designation.status]}
          </span>
        )}
      </div>

      {/* Point and Cart Info */}
      <div className="flex flex-col gap-1 mb-4">
        <h3 className="text-lg font-semibold text-[#333333] leading-tight">
          {designation.point}
        </h3>
        {designation.publication_carts?.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#374192]">
              {designation.publication_carts.join(", ")}
            </span>
          </div>
        )}
      </div>

      {/* Participants List */}
      <div className="space-y-3 mb-4">
        {designation?.participants?.length
          ? designation.participants.map((participant, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="relative">
                <div className="rounded-full h-10 w-10 overflow-hidden bg-gray-200 ring-2 ring-white shadow-sm">
                  {participant.profile_photo ? (
                    <Image
                      src={participant.profile_photo || "/placeholder.svg"}
                      alt={`Foto de ${participant.name}`}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#374192]/20 text-[#374192] font-semibold text-sm">
                      {participant.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <span className="text-[#333333] font-medium flex-1 truncate">
                {participant.name}
              </span>
            </div>
          ))
          : null}
      </div>

      {/* Action Button */}
      {participantId && showRefuseButton && (
        <div className="flex justify-end">
          <Button
            className={`${designation?.incident_history?.status === "OPEN"
              ? "bg-[#374192] hover:bg-[#46607F] text-white"
              : "bg-[#E74C3C] hover:bg-[#C0392B] text-white"
              } px-6 py-2 rounded-lg font-medium shadow-sm`}
            onClick={onRefuse}
            disabled={designation?.incident_history?.status === "OPEN"}
          >
            {designation?.incident_history?.status === "OPEN"
              ? "Recusado"
              : designation.status === "CLOSED"
                ? "Justificar"
                : "Recusar"}
          </Button>
        </div>
      )}

      {/* Divider */}
      {!isLast && (
        <div className="border-t border-gray-200 my-6"></div>
      )}
    </div>
  )
}
