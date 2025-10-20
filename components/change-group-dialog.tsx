"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import type { IGroups } from "@/types/groups"
import type { Participant } from "@/types/group-participants"
import { apiClient } from "@/lib/api-client"

interface ChangeGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  participant: Participant
  currentGroupId: string
  groupType: string
  onGroupChanged: () => void
}

export function ChangeGroupDialog({
  open,
  onOpenChange,
  participant,
  currentGroupId,
  groupType,
  onGroupChanged,
}: ChangeGroupDialogProps) {
  const [groups, setGroups] = useState<IGroups[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      fetchGroups()
    } else {
      // Reset state when dialog closes
      setGroups([])
      setSearchQuery("")
      setIsLoading(true)
    }
  }, [open])

  const fetchGroups = async () => {
    try {
      const data = await apiClient.get<IGroups[]>("/groups", { endpoint: "new" })
      // Filtra apenas grupos do mesmo tipo
      const filteredGroups = data.filter((group: IGroups) => group.type === groupType)
      setGroups(filteredGroups)
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching groups:", error)
      setIsLoading(false)
    }
  }

  const handleChangeGroup = async (newGroup: IGroups) => {
    try {
      // Remove do grupo atual
      await apiClient.delete(`/groups/${currentGroupId}/participants/${participant.id}`, { endpoint: "new" })

      // Adiciona ao novo grupo
      const result = await apiClient.patch(`/groups/${newGroup.id}/participants/${participant.id}`, null, {
        endpoint: "new",
      })

      toast({
        title: "Sucesso",
        description: `Participante movido para o grupo ${newGroup.name}`,
      })

      onGroupChanged()
      onOpenChange(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao trocar de grupo",
      })
    }
  }

  const filteredGroups = groups
    .filter((group) => group.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((groupA, groupB) => {
      const availableSlotsA = groupA.configMax - groupA.participants
      const availableSlotsB = groupB.configMax - groupB.participants
      const fillRatioA = groupA.configMax === 0 ? 0 : availableSlotsA / groupA.configMax
      const fillRatioB = groupB.configMax === 0 ? 0 : availableSlotsB / groupB.configMax

      if (fillRatioA === fillRatioB) {
        return groupA.name.localeCompare(groupB.name)
      }

      return fillRatioB - fillRatioA
    })

  // Helper function to format weekday in Portuguese
  const formatWeekday = (weekday: string) => {
    const weekdays: Record<string, string> = {
      MONDAY: "Segunda-feira",
      TUESDAY: "Terça-feira",
      WEDNESDAY: "Quarta-feira",
      THURSDAY: "Quinta-feira",
      FRIDAY: "Sexta-feira",
      SATURDAY: "Sábado",
      SUNDAY: "Domingo",
    }
    return weekdays[weekday] || weekday
  }

  // Format time (from "HH:MM:SS" to "HH:MM")
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    return `${hours}:${minutes}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white border-gray-200 shadow-lg">
        <DialogHeader className="pb-4 border-b border-gray-100">
          <DialogTitle className="text-lg font-semibold text-[#333333]">Trocar de grupo</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 pt-4">
          <p className="text-sm text-[#666666]">
            Escolha o Grupo que deseja adicionar <span className="font-medium text-[#374192]">{participant.name}</span>
          </p>

          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Buscar grupo"
              className="pl-10 h-11 border-gray-200 focus:border-[#374192] focus:ring-[#374192] rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-8 h-8 border-4 border-[#374192] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-[#666666] font-medium">Carregando grupos...</p>
              </div>
            </div>
          ) : (
            <div className="max-h-[400px] space-y-3 overflow-y-auto">
              {filteredGroups.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#F8F8F8] mb-3">
                    <Search className="h-6 w-6 text-[#929BD2]" />
                  </div>
                  <p className="text-[#333333] font-medium">Nenhum grupo encontrado</p>
                  <p className="text-sm text-[#666666] mt-1">Tente ajustar os filtros de busca</p>
                </div>
              ) : (
                filteredGroups.map((group) => {
                  const isCurrentGroup = group.id === currentGroupId
                  const isFull = group.participants >= group.configMax

                  return (
                    <div
                      key={group.id}
                      className={`rounded-lg border border-gray-200 p-4 bg-white transition-colors ${isCurrentGroup || isFull ? "opacity-60 bg-gray-50" : "hover:bg-[#F8F8F8]"
                        }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <p className="font-semibold text-[#333333]">
                              <span className="text-sm text-[#666666] font-normal">Nome:</span> {group.name}
                            </p>
                            <p className="text-sm text-[#666666]">
                              <span className="font-medium text-[#333333]">Dia:</span> {formatWeekday(group.configWeekday)}
                            </p>
                            <p className="text-sm text-[#666666]">
                              <span className="font-medium text-[#333333]">Hora:</span> {formatTime(group.configStartHour)} às {formatTime(group.configEndHour)}
                            </p>
                            <p className="text-sm text-[#666666]">
                              <span className="font-medium text-[#333333]">Participantes:</span> {group.participants}/{group.configMax}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-[#333333]">Tipo Grupo:</span>
                              <Badge className="text-xs font-medium px-2 py-1 bg-[#374192]/10 text-[#374192] border-[#374192]/20">
                                {group.type === "MAIN"
                                  ? "Principal"
                                  : group.type === "ADDITIONAL"
                                    ? "Adicional"
                                    : "Especial"}
                              </Badge>
                            </div>
                          </div>
                          <div className="ml-4">
                            {isCurrentGroup ? (
                              <Badge className="text-xs font-medium px-3 py-2 bg-[#2ECC71]/10 text-[#2ECC71] border-[#2ECC71]/20 rounded-lg">
                                Já incluso
                              </Badge>
                            ) : isFull ? (
                              <Badge className="text-xs font-medium px-3 py-2 bg-[#F1C40F]/10 text-[#F1C40F] border-[#F1C40F]/20 rounded-lg">
                                Lotado
                              </Badge>
                            ) : (
                              <Button
                                onClick={() => handleChangeGroup(group)}
                                className="h-9 px-4 bg-[#374192] hover:bg-[#46607F] text-white rounded-lg font-medium transition-colors"
                              >
                                Substituir
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
