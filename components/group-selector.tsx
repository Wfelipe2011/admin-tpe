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
      // setIsSelectDisabled(true)
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
            "border border-gray-200 shadow-sm transition-all duration-200",
            isMobileView
              ? "bg-white text-[#333333] focus:ring-[#374192]/20 focus:border-[#374192] h-8 px-3 w-full"
              : "bg-white/20 border-white/30 text-white focus:ring-white/30 focus:border-white/50 min-w-[200px] h-10 hover:bg-white/30 backdrop-blur-sm",
          )}
        >
          <SelectValue placeholder={isLoadingGroups ? "Carregando grupos..." : "Selecione um grupo"}>
            {isMobileView ? (
              <span className="truncate block text-sm font-medium">{getSelectedGroupName()}</span>
            ) : (
              <span className="text-sm font-medium">{getSelectedGroupName()}</span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className={cn(
          "bg-white border border-gray-200 shadow-lg rounded-lg",
          isMobileView ? "w-[260px]" : ""
        )}>
          {/* Only show "Todos os Grupos" option if user is not CAPTAIN */}
          {!isSelectDisabled && (
            <SelectItem
              value="todos"
              className="text-[#333333] hover:bg-[#374192]/10 focus:bg-[#374192]/10 font-medium"
            >
              Todos os Grupos
            </SelectItem>
          )}

          {/* Filter groups if user is CAPTAIN */}
          {groups
            .filter((group) => {
              const user = getUserFromToken()
              return !isSelectDisabled || group.id === user?.groupId
            })
            .map((group) => (
              <SelectItem
                key={group.id}
                value={group.id}
                className="text-[#333333] hover:bg-[#374192]/10 focus:bg-[#374192]/10"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{group.name}</span>
                  <span className="text-xs text-[#666666]">
                    {formatWeekday(group.configWeekday)} {group.configStartHour}
                  </span>
                </div>
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
      {error && (
        <p className={cn(
          "text-xs mt-2 font-medium",
          isMobileView ? "text-red-600" : "text-red-200"
        )}>
          {error}
        </p>
      )}
    </div>
  )
}
