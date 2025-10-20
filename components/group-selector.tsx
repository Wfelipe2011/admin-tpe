"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getUserFromToken } from "@/lib/auth-utils"
import type { IGroups } from "@/types/groups"
import { apiClient } from "@/lib/api-client"
import { cn, sortGroupsByDayAndTime } from "@/lib/utils"
import { useGroupStore } from "@/lib/stores/use-group-store"

interface GroupSelectorProps {
  className?: string
  isMobileView?: boolean
}

// Helper function to sort groups by weekday and start time
const sortGroupsByWeekdayAndTime = (groups: IGroups[]) => {
  const weekdayOrder: Record<string, number> = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
    DOMINGO: 0,
    SEGUNDA: 1,
    TERCA: 2,
    QUARTA: 3,
    QUINTA: 4,
    SEXTA: 5,
    SABADO: 6,
  }

  return [...groups].sort((a, b) => {
    // First sort by weekday
    const weekdayA = weekdayOrder[a.configWeekday] || 0
    const weekdayB = weekdayOrder[b.configWeekday] || 0

    if (weekdayA !== weekdayB) {
      return weekdayA - weekdayB
    }

    // Then sort by start time
    return a.configStartHour.localeCompare(b.configStartHour)
  })
}

// Format weekday for display
const formatWeekday = (weekday: string) => {
  const weekdayMap: Record<string, string> = {
    SUNDAY: "Domingo",
    MONDAY: "Segunda",
    TUESDAY: "Terça",
    WEDNESDAY: "Quarta",
    THURSDAY: "Quinta",
    FRIDAY: "Sexta",
    SATURDAY: "Sábado",
    DOMINGO: "Domingo",
    SEGUNDA: "Segunda",
    TERCA: "Terça",
    QUARTA: "Quarta",
    QUINTA: "Quinta",
    SEXTA: "Sexta",
    SABADO: "Sábado",
  }

  return weekdayMap[weekday] || weekday
}

export function GroupSelector({ className = "", isMobileView = false }: GroupSelectorProps) {
  const [groups, setGroups] = useState<IGroups[]>([])
  const [isLoadingGroups, setIsLoadingGroups] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isSelectDisabled, setIsSelectDisabled] = useState<boolean>(false)

  // Use the Zustand store instead of local state
  const { selectedGroupId, setSelectedGroupId } = useGroupStore()

  // Fetch groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setIsLoadingGroups(true)
        const data = await apiClient.get<IGroups[]>("/groups", { endpoint: "new" })
        const sortedGroups = sortGroupsByDayAndTime(data)
        setGroups(sortedGroups)
        setError(null)
      } catch (err) {
        console.error("Erro ao buscar grupos:", err)
        setError("Não foi possível carregar os grupos.")
      } finally {
        setIsLoadingGroups(false)
      }
    }

    fetchGroups()
  }, [])

  // Handle group selection change
  const handleGroupChange = (groupId: string) => {
    setSelectedGroupId(groupId)
  }

  // Check user profile and set select disabled state
  useEffect(() => {
    const user = getUserFromToken()

    // If user is CAPTAIN, disable the select
    if (user?.profile === "CAPTAIN") {
      setIsSelectDisabled(true)
    }
  }, [])

  // Get the selected group name for display
  const getSelectedGroupName = () => {
    if (selectedGroupId === "todos") return "Todos os Grupos"

    const selectedGroup = groups.find((group) => group.id === selectedGroupId)
    if (!selectedGroup) return isLoadingGroups ? "Carregando..." : "Selecione um grupo"

    return `${selectedGroup.name} - ${formatWeekday(selectedGroup.configWeekday)} ${selectedGroup.configStartHour}`
  }

  return (
    <div className={className}>
      <Select value={selectedGroupId} onValueChange={handleGroupChange} disabled={isLoadingGroups || isSelectDisabled}>
        <SelectTrigger
          className={cn(
            isMobileView
              ? "bg-transparent border-gray-300 text-gray-800 focus:ring-gray-300 h-8 px-0 w-full"
              : "bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground focus:ring-primary-foreground/30 min-w-[180px] h-9",
          )}
        >
          <SelectValue placeholder={isLoadingGroups ? "Carregando grupos..." : "Selecione um grupo"}>
            {isMobileView ? <span className="truncate block">{getSelectedGroupName()}</span> : getSelectedGroupName()}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className={isMobileView ? "w-[260px]" : ""}>
          {/* Only show "Todos os Grupos" option if user is not CAPTAIN */}
          {!isSelectDisabled && <SelectItem value="todos">Todos os Grupos</SelectItem>}

          {/* Filter groups if user is CAPTAIN */}
          {groups
            .filter((group) => {
              const user = getUserFromToken()
              return !isSelectDisabled || group.id === user?.groupId
            })
            .map((group) => (
              <SelectItem key={group.id} value={group.id}>
                {group.name} - {formatWeekday(group.configWeekday)} {group.configStartHour}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
      {error && <p className={cn("text-xs mt-1", isMobileView ? "text-red-600" : "text-red-300")}>{error}</p>}
    </div>
  )
}
