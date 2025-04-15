"use client"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Incident } from "@/types/designation-participants"

interface ParticipantAvatarsProps {
  presentParticipants?: Incident[]
  incidents?: Incident[]
  maxVisible?: number
}

export function ParticipantAvatars({
  presentParticipants = [],
  incidents = [],
  maxVisible = 5,
}: ParticipantAvatarsProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const renderAvatarGroup = (participants: Incident[] | undefined, isAbsent = false) => {
    // Se participants for undefined, use um array vazio
    const safeParticipants = participants || []
    const visibleParticipants = safeParticipants.slice(0, maxVisible)
    const remainingCount = safeParticipants.length - maxVisible

    return (
      <div className="flex items-center -space-x-1.5 sm:-space-x-2 flex-wrap">
        {visibleParticipants.map((participant, index) => (
          <TooltipProvider key={participant.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`
                    relative inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full 
                    text-[10px] sm:text-xs font-medium border-2 border-white
                    ${isAbsent ? "bg-gray-400" : "bg-primary"}
                    text-white cursor-help
                  `}
                  style={{ zIndex: visibleParticipants.length - index }}
                >
                  {getInitials(participant.name)}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs sm:text-sm">{participant.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
        {remainingCount > 0 && (
          <div
            className={`
              relative inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full 
              text-[10px] sm:text-xs font-medium border-2 border-white
              ${isAbsent ? "bg-gray-400" : "bg-primary"}
              text-white
            `}
            style={{ zIndex: 0 }}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-1 sm:space-y-2 w-full">
      <div className="flex flex-col xs:flex-row xs:items-center gap-1 sm:gap-2">
        <span className="text-[10px] xs:text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Presentes:</span>
        {renderAvatarGroup(presentParticipants)}
      </div>
      <div className="flex flex-col xs:flex-row xs:items-center gap-1 sm:gap-2">
        <span className="text-[10px] xs:text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Ausentes:</span>
        {renderAvatarGroup(incidents, true)}
      </div>
    </div>
  )
}
