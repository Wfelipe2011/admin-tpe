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
    <div className="space-y-6">
      <div className="rounded-lg border bg-white p-4">
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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 sm:w-64 sm:flex-none">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar Voluntário"
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center rounded-md border">
            <Button
              variant={isGridView ? "ghost" : "secondary"}
              size="icon"
              className="rounded-r-none"
              onClick={() => setIsGridView(false)}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={isGridView ? "secondary" : "ghost"}
              size="icon"
              className="rounded-l-none"
              onClick={() => setIsGridView(true)}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div>
          <Button onClick={() => setIsAssignDialogOpen(true)}>Atribuir Participante</Button>
        </div>
      </div>

      <div className={isGridView ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "space-y-2"}>
        {filteredParticipants?.map((participant) =>
          isGridView ? (
            <ParticipantCard
              key={participant.id}
              participant={participant}
              groupId={groupId}
              groupType={group.type}
              onUpdate={fetchGroupParticipants}
            />
          ) : (
            <ParticipantListItem
              key={participant.id}
              participant={participant}
              groupId={groupId}
              groupType={group.type}
              onUpdate={fetchGroupParticipants}
            />
          ),
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
