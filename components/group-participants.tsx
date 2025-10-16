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
      <div className="flex h-40 items-center justify-center">
        <p>Carregando participantes...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Informações do grupo */}
      <div className="rounded-lg border bg-white p-4 mb-6">
        <div className="grid gap-4 md:grid-cols-5">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Tipo de grupo:</h3>
            <p>{group.type === "MAIN" ? "Principal" : group.type === "ADDITIONAL" ? "Adicional" : "Especial"}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Grupo</h3>
            <p>{group.name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Dia da Semana:</h3>
            <p>{formatWeekday(group.configWeekday)}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Horário:</h3>
            <p>{`${group.configStartHour.slice(0, 5)} às ${group.configEndHour.slice(0, 5)}`}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Participantes:</h3>
            <p>
              {group.participants.length}/{group.configMax}
            </p>
          </div>
        </div>
      </div>

      {/* Controles de filtro - similar à estrutura de petições */}
      <div className="grid grid-cols-1 md:grid-cols-10 gap-4 mb-8">
        <div className="md:col-span-5 lg:col-span-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Pesquisar Voluntário"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white rounded-md border-gray-200 w-full"
            />
          </div>
        </div>
        <div className="md:col-span-3 lg:col-span-3">
          <div className="flex items-center rounded-md">
            <Button
              variant={isGridView ? "outline" : "secondary"}
              size="icon"
              className="rounded-r-none"
              onClick={() => setIsGridView(false)}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={isGridView ? "secondary" : "outline"}
              size="icon"
              className="rounded-l-none"
              onClick={() => setIsGridView(true)}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="md:col-span-2 lg:col-span-2 flex justify-start md:justify-end">
          <Button onClick={() => setIsAssignDialogOpen(true)} className="w-full md:w-auto">
            Atribuir Participante
          </Button>
        </div>
      </div>

      {/* Lista de participantes - estrutura similar às petições */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredParticipants && filteredParticipants.length > 0 ? (
          <div className={isGridView ? "p-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : ""}>
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
                <div key={participant.id} className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition-colors border-b`}>
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
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <p className="mt-4 text-gray-500">Nenhum participante encontrado</p>
            <p className="text-sm text-gray-400">Tente ajustar os filtros de busca</p>
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
