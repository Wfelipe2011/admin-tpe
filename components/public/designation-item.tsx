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
        return "border-blue-700 text-blue-700 bg-blue-100"
      case "CANCELLED":
        return "border-red-700 text-red-700 bg-red-100"
      case "CLOSED":
        return "border-green-700 text-green-700 bg-green-100"
      case "IN_PROGRESS":
        return "border-yellow-700 text-yellow-700 bg-yellow-100"
      default:
        return ""
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-end mb-2 relative">
        {participantId && (
          <div>
            <span
              className={`text-xs px-2 py-1 rounded-full absolute -top-4 -right-4 ${getStatusClass(
                designation.status,
              )}`}
            >
              {DesignationStatusMap[designation.status]}
            </span>
          </div>
        )}
      </div>

      <div className="flex justify-between gap-2 text-md">
        <strong className="truncate w-[80%]">{designation.point}</strong>
        {designation.publication_carts?.length > 0 && (
          <span className="flex gap-2 justify-center items-center">
            <strong>({designation.publication_carts.join(",")})</strong>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M18 8H19C20.1 8 21 8.9 21 10V12C21 13.1 20.1 14 19 14H5C3.9 14 3 13.1 3 12V10C3 8.9 3.9 8 5 8H6M18 8V6C18 4.9 17.1 4 16 4H8C6.9 4 6 4.9 6 6V8M18 8H6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7 20H9M15 20H17M8 14V17M16 14V17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {designation?.participants?.length
          ? designation.participants.map((participant, index) => (
              <div key={index} className="flex gap-2 items-center text-md">
                <div className="rounded-full h-9 w-9 overflow-hidden bg-gray-200">
                  {participant.profile_photo ? (
                    <Image
                      src={participant.profile_photo || "/placeholder.svg"}
                      alt={`Foto de ${participant.name}`}
                      width={36}
                      height={36}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600">
                      {participant.name.charAt(0)}
                    </div>
                  )}
                </div>
                <span className="w-[90%] truncate">{participant.name}</span>
              </div>
            ))
          : null}
      </div>

      {participantId && showRefuseButton && (
        <div className="flex justify-end mt-2">
          <Button
            className={`${
              designation?.incident_history?.status === "OPEN" ? "bg-blue-700" : "bg-[#c34a4a] hover:bg-[#b43e3e]"
            } text-white w-[95px]`}
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

      {!isLast && <div className="border-t-2 border-gray-200 my-2"></div>}
    </div>
  )
}
