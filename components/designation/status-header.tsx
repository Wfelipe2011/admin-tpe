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
        "duration-200 flex items-center justify-between gap-1 sm:gap-2 rounded-md bg-background p-1.5 sm:p-2 text-xs sm:text-sm transition-all",
        "bg-background/95 backdrop-blur-sm border-b",
      )}
    >
      <div>
        {designationData?.group?.name && (
          <span className="font-medium truncate">
            {designationData.group.name} - {designationData.group.config.weekday}
          </span>
        )}
      </div>
    </div>
  )
}
