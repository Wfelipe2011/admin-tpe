"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import type { IGroups } from "@/types/groups"
import type { IParticipants, Group } from "@/types/participants"
import { apiClient } from "@/lib/api-client"

interface AssignParticipantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group: IGroups
  onParticipantAssigned: () => void
}

export function AssignParticipantDialog({
  open,
  onOpenChange,
  group,
  onParticipantAssigned,
}: AssignParticipantDialogProps) {
  const [participants, setParticipants] = useState<IParticipants[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      fetchParticipants()
    }
  }, [open, searchQuery])

  const fetchParticipants = async () => {
    try {
      const url = searchQuery ? `/participants?name=${encodeURIComponent(searchQuery)}` : "/participants"

      const data = await apiClient.get(url, { endpoint: "new" })
      setParticipants(data)
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching participants:", error)
      setIsLoading(false)
    }
  }

  const handleAssignParticipant = async (participant: IParticipants) => {
    try {
      // Check if participant is already in a group of the same type
      const sameTypeGroup = participant.groups?.find((g) => g.type === group.type)

      if (sameTypeGroup) {
        // If yes, remove from that group first
        await apiClient.delete(`/groups/${sameTypeGroup.id}/participants/${participant.id}`, { endpoint: "new" })
      }

      // Assign to new group
      const result = await apiClient.patch(`/groups/${group.id}/participants/${participant.id}`, null, {
        endpoint: "new",
      })

      toast({
        title: "Sucesso",
        description: result.message,
      })

      onParticipantAssigned()
      onOpenChange(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao atribuir participante",
      })
    }
  }

  // Helper function to get participant's current group of the same type as our target group
  const getSameTypeGroup = (participant: IParticipants): Group | undefined => {
    return participant.groups?.find((g) => g.type === group.type)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Atribuir participante</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Escolha o voluntário que deseja adicionar ao Grupo {group.name}
          </p>

          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome"
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <p>Carregando participantes...</p>
            </div>
          ) : (
            <div className="max-h-[400px] space-y-2 overflow-y-auto">
              {participants.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground">Nenhum participante encontrado</p>
              ) : (
                participants
                  .filter((participant) => {
                    if (participant.petitions) {
                      if (participant.petitions.status === "CREATED") return false
                      if (participant.petitions.status === "WAITING_INFORMATION") return false
                      return true
                    }
                    return true
                  })
                  .sort((a, b) => {
                    const aSameTypeGroup = getSameTypeGroup(a)
                    const bSameTypeGroup = getSameTypeGroup(b)
                    if (!aSameTypeGroup && !bSameTypeGroup) return 0
                    if (!aSameTypeGroup) return -1
                    if (!bSameTypeGroup) return 1
                    if (aSameTypeGroup.id === group.id && bSameTypeGroup.id !== group.id) return 1
                    if (aSameTypeGroup.id !== group.id && bSameTypeGroup.id === group.id) return -1
                    return 0
                  })
                  .map((participant) => {
                    const sameTypeGroup = getSameTypeGroup(participant)
                    const isInSameGroup = sameTypeGroup?.id === group.id

                    return (
                      <div key={participant.id} className="flex items-start justify-between rounded-lg border p-3">
                        <div className="flex gap-3">
                          <Avatar>
                            <AvatarImage src={participant.profilePhoto} alt={participant.name} />
                            <AvatarFallback>{participant.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">Nome: {participant.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Congregação: {participant.congregation?.name || "Não informada"}
                            </p>
                            {sameTypeGroup && (
                              <p className="text-sm text-muted-foreground">Grupo: {sameTypeGroup.name}</p>
                            )}
                            <div className="mt-1 flex flex-wrap gap-1">
                              {participant.attributions?.map((attr, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {attr}
                                </Badge>
                              ))}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Tel: {participant.phone || "Não informado"}
                            </p>
                          </div>
                        </div>
                        <div>
                          <Button
                            variant="secondary"
                            disabled={isInSameGroup}
                            onClick={() => handleAssignParticipant(participant)}
                          >
                            {sameTypeGroup ? "Substituir" : "Atribuir"}
                          </Button>
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
