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
      const response = await fetch("https://server.tpedigital.com.br/groups")
      const data = await response.json()
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
      await fetch(`https://server.tpedigital.com.br/groups/${currentGroupId}/participants/${participant.id}`, {
        method: "DELETE",
      })

      // Adiciona ao novo grupo
      const response = await fetch(
        `https://server.tpedigital.com.br/groups/${newGroup.id}/participants/${participant.id}`,
        { method: "PATCH" },
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Erro ao trocar de grupo")
      }

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

  const filteredGroups = groups.filter((group) => group.name.toLowerCase().includes(searchQuery.toLowerCase()))

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Trocar de grupo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Escolha o Grupo que deseja adicionar {participant.name}</p>

          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar grupo"
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <p>Carregando grupos...</p>
            </div>
          ) : (
            <div className="max-h-[400px] space-y-3 overflow-y-auto">
              {filteredGroups.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground">Nenhum grupo encontrado</p>
              ) : (
                filteredGroups.map((group) => {
                  const isCurrentGroup = group.id === currentGroupId
                  const isFull = group.participants >= group.configMax

                  return (
                    <div
                      key={group.id}
                      className={`rounded-lg border p-4 ${isCurrentGroup || isFull ? "opacity-60" : ""}`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="font-medium">Nome: {group.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Dia e Hora: {formatWeekday(group.configWeekday)} / {formatTime(group.configStartHour)} às{" "}
                              {formatTime(group.configEndHour)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Participantes: {group.participants}/{group.configMax}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Atribuições:</span>
                              <Badge variant="secondary">
                                {group.type === "MAIN"
                                  ? "Principal"
                                  : group.type === "ADDITIONAL"
                                    ? "Adicional"
                                    : "Especial"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Responsável: {group.coordinatorId || "Não atribuído"}
                            </p>
                          </div>
                          {isCurrentGroup ? (
                            <Badge variant="outline">Já incluso</Badge>
                          ) : isFull ? (
                            <Badge variant="secondary">Lotado</Badge>
                          ) : (
                            <Button variant="secondary" onClick={() => handleChangeGroup(group)}>
                              Substituir
                            </Button>
                          )}
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
