"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, LayoutGrid, List } from "lucide-react"
import { AssignParticipantDialog } from "@/components/assign-participant-dialog"
import { ParticipantCard } from "@/components/participant-card"
import { ParticipantListItem } from "@/components/participant-list-item"
import type { IGroupParticipants } from "@/types/group-participants"
import { apiClient } from "@/lib/api-client"

interface GroupParticipantsProps {
  groupId: string
}

export function GroupParticipants({ groupId }: GroupParticipantsProps) {
  const [group, setGroup] = useState<IGroupParticipants | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isGridView, setIsGridView] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)

  const fetchGroupParticipants = async () => {
    try {
      const data = await apiClient.get(`/groups/${groupId}/participants`, { endpoint: "new" })
      setGroup(data)
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching group participants:", error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGroupParticipants()
  }, [groupId])

  const filteredParticipants = group?.participants.filter((participant) =>
    participant.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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

  if (isLoading || !group) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-[#374192] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-[#666666] font-medium">Carregando participantes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Group Information Card */}
      <div className="bg-[#F8F8F8] rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-2 h-2 bg-[#374192] rounded-full"></div>
          <h2 className="text-lg font-semibold text-[#333333]">Informações do Grupo</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-5">
          <div>
            <h3 className="text-sm font-medium text-[#666666] mb-1">Tipo de grupo:</h3>
            <p className="text-[#333333] font-medium">
              {group.type === "MAIN" ? "Principal" : group.type === "ADDITIONAL" ? "Adicional" : "Especial"}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-[#666666] mb-1">Grupo:</h3>
            <p className="text-[#333333] font-medium">{group.name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-[#666666] mb-1">Dia da Semana:</h3>
            <p className="text-[#333333] font-medium">{formatWeekday(group.configWeekday)}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-[#666666] mb-1">Horário:</h3>
            <p className="text-[#333333] font-medium">
              {`${group.configStartHour.slice(0, 5)} às ${group.configEndHour.slice(0, 5)}`}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-[#666666] mb-1">Participantes:</h3>
            <p className="text-[#333333] font-medium">
              {group.participants.length}/{group.configMax}
            </p>
          </div>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Pesquisar participante..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 border-gray-200 focus:border-[#374192] focus:ring-[#374192] rounded-lg"
          />
        </div>

        <div className="flex items-center gap-4">
          {/* View Toggle - Improved Colors */}
          <div className="flex items-center bg-[#F8F8F8] rounded-lg p-1" role="tablist" aria-label="Opções de visualização">
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-md transition-all font-medium ${!isGridView
                ? 'bg-[#374192] text-white shadow-sm hover:bg-[#46607F]'
                : 'text-[#666666] hover:bg-white hover:text-[#374192]'
                }`}
              onClick={() => setIsGridView(false)}
              aria-pressed={!isGridView}
              role="tab"
              aria-selected={!isGridView}
              aria-controls="participants-content"
              title="Visualizar em lista"
            >
              <List className="h-4 w-4 mr-2" aria-hidden="true" />
              Lista
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-md transition-all font-medium ${isGridView
                ? 'bg-[#374192] text-white shadow-sm hover:bg-[#46607F]'
                : 'text-[#666666] hover:bg-white hover:text-[#374192]'
                }`}
              onClick={() => setIsGridView(true)}
              aria-pressed={isGridView}
              role="tab"
              aria-selected={isGridView}
              aria-controls="participants-content"
              title="Visualizar em grade"
            >
              <LayoutGrid className="h-4 w-4 mr-2" aria-hidden="true" />
              Grade
            </Button>
          </div>

          {/* Assign Button */}
          <Button
            onClick={() => setIsAssignDialogOpen(true)}
            className="bg-[#374192] hover:bg-[#46607F] text-white h-10 px-6 rounded-lg font-medium transition-colors"
          >
            Atribuir Participante
          </Button>
        </div>
      </div>

      {/* Participants List/Grid */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {filteredParticipants && filteredParticipants.length > 0 ? (
          <div className={isGridView ? "p-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" : ""}>
            {filteredParticipants.map((participant, index) =>
              isGridView ? (
                <ParticipantCard
                  key={participant.id}
                  participant={participant}
                  groupId={groupId}
                  groupType={group.type}
                  onUpdate={fetchGroupParticipants}
                />
              ) : (
                <div key={participant.id} className={`${index % 2 === 0 ? "bg-white" : "bg-[#F8F8F8]"} hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0`}>
                  <ParticipantListItem
                    participant={participant}
                    groupId={groupId}
                    groupType={group.type}
                    onUpdate={fetchGroupParticipants}
                  />
                </div>
              ),
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#F8F8F8]">
              <Search className="h-8 w-8 text-[#929BD2]" />
            </div>
            <p className="mt-4 text-[#333333] font-medium">Nenhum participante encontrado</p>
            <p className="text-sm text-[#666666] mt-1">Tente ajustar os filtros de busca ou atribua novos participantes</p>
          </div>
        )}
      </div>

      <AssignParticipantDialog
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        group={group}
        onParticipantAssigned={fetchGroupParticipants}
      />
    </div>
  )
}
