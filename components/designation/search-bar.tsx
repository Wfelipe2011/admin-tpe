"use client"

import type React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RefreshCw, RotateCcw } from "lucide-react"
import { ParticipantAvatars } from "@/components/designation/participant-avatars"
import type { Incident } from "@/types/designation-participants"
import { getUserFromToken } from "@/lib/auth-utils"
import { ParticipantProfile } from "@/types/auth"

interface SearchBarProps {
  searchTerm: string
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void
  onAutoAssign: () => void
  onRecreate?: () => void
  presentParticipants: Incident[]
  absentParticipants: Incident[]
  incidents: any[]
  isDisabled: boolean
  designationStatus?: string
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearch,
  onAutoAssign,
  onRecreate,
  presentParticipants,
  incidents,
  isDisabled,
  designationStatus,
}) => {
  const user = getUserFromToken()
  const isCoordinator = user?.profile === ParticipantProfile.COORDINATOR
  const canRecreate = isCoordinator && designationStatus === "OPEN" && onRecreate

  return (
    <div className="flex flex-col xs:flex-row md:flex-row justify-between gap-2 sm:gap-4">
      <div className="flex flex-col flex-col-reverse xs:flex-row md:flex-row gap-2 sm:gap-4 flex-1">
        <div className="relative w-full xs:w-auto md:w-1/3 min-w-[200px]">
          <Input
            placeholder="Pesquisar Voluntários"
            className="pl-7 sm:pl-9 h-9 sm:h-10 text-xs sm:text-sm"
            value={searchTerm}
            onChange={onSearch}
          />
        </div>

        <div className="w-full xs:flex-1">
          <ParticipantAvatars
            presentParticipants={presentParticipants}
            incidents={incidents}
          />
        </div>
      </div>
      <div className="flex gap-2">
        {canRecreate && (
          <Button
            className="flex items-center gap-1 sm:gap-2 whitespace-nowrap h-9 sm:h-10 text-xs sm:text-sm"
            onClick={onRecreate}
            variant="outline"
          >
            <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline sm:inline">Recriar Designação</span>
            <span className="xs:hidden sm:hidden">Recriar</span>
          </Button>
        )}
        <Button
          className="flex items-center gap-1 sm:gap-2 whitespace-nowrap h-9 sm:h-10 text-xs sm:text-sm"
          onClick={onAutoAssign}
          disabled={isDisabled}
        >
          <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden xs:inline sm:inline">Designação Automática</span>
          <span className="xs:hidden sm:hidden">Auto</span>
        </Button>
      </div>
    </div>
  )
}
