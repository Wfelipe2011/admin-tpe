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
      <DialogContent className="sm:max-w-md bg-white border-gray-200 shadow-lg">
        <DialogHeader className="pb-4 border-b border-gray-100">
          <DialogTitle className="text-lg font-semibold text-[#333333]">Atribuir participante</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 pt-4">
          <p className="text-sm text-[#666666]">
            Escolha o voluntário que deseja adicionar ao <span className="font-medium text-[#374192]">Grupo {group.name}</span>
          </p>

          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Buscar por nome"
              className="pl-10 h-11 border-gray-200 focus:border-[#374192] focus:ring-[#374192] rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-8 h-8 border-4 border-[#374192] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-[#666666] font-medium">Carregando participantes...</p>
              </div>
            </div>
          ) : (
            <div className="max-h-[400px] space-y-3 overflow-y-auto">
              {participants.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#F8F8F8] mb-3">
                    <Search className="h-6 w-6 text-[#929BD2]" />
                  </div>
                  <p className="text-[#333333] font-medium">Nenhum participante encontrado</p>
                  <p className="text-sm text-[#666666] mt-1">Tente ajustar os filtros de busca</p>
                </div>
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
                      <div key={participant.id} className="flex items-start justify-between rounded-lg border border-gray-200 p-4 bg-white hover:bg-[#F8F8F8] transition-colors">
                        <div className="flex gap-3">
                          <Avatar className="h-10 w-10 ring-2 ring-gray-100">
                            <AvatarImage src={participant.profilePhoto} alt={participant.name} />
                            <AvatarFallback className="bg-[#374192]/10 text-[#374192] font-semibold">
                              {participant.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-[#333333] mb-1">
                              <span className="text-sm text-[#666666] font-normal">Nome:</span> {participant.name}
                            </p>
                            <p className="text-sm text-[#666666] mb-1">
                              <span className="font-medium text-[#333333]">Congregação:</span> {participant.congregation?.name || "Não informada"}
                            </p>
                            {sameTypeGroup && (
                              <p className="text-sm text-[#666666] mb-1">
                                <span className="font-medium text-[#333333]">Grupo:</span> {sameTypeGroup.name}
                              </p>
                            )}
                            <div className="mt-2 flex flex-wrap gap-1">
                              {participant.attributions?.map((attr, index) => (
                                <Badge key={index} className="text-xs font-medium px-2 py-1 bg-[#374192]/10 text-[#374192] border-[#374192]/20">
                                  {attr}
                                </Badge>
                              ))}
                            </div>
                            <p className="mt-2 text-sm text-[#666666]">
                              <span className="font-medium text-[#333333]">Tel:</span> {participant.phone || "Não informado"}
                            </p>
                          </div>
                        </div>
                        <div className="ml-3">
                          <Button
                            disabled={isInSameGroup}
                            onClick={() => handleAssignParticipant(participant)}
                            className={`h-9 px-4 rounded-lg font-medium transition-colors ${
                              isInSameGroup 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-[#374192] hover:bg-[#46607F] text-white'
                            }`}
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
