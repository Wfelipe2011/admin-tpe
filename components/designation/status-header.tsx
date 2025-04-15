"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import type { IDesignationParticipants } from "@/types/designation-participants"

interface StatusHeaderProps {
  designationData: IDesignationParticipants | null
  isSticky: boolean
}

export const StatusHeader: React.FC<StatusHeaderProps> = ({ designationData, isSticky }) => {
  return (
    <div
      className={cn(
        "duration-200 flex items-center justify-between gap-2 rounded-md bg-background p-2 text-sm transition-all",
        "bg-background/95 backdrop-blur-sm border-b",
      )}
    >
      <div>
        {designationData?.group?.name && (
          <span className="font-medium">
            {designationData.group.name} - {designationData.group.configWeekday}
          </span>
        )}
      </div>
    </div>
  )
}
