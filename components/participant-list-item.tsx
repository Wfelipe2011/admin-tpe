"use client"

import { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"
import type { Participant } from "@/types/group-participants"
import { ChangeGroupDialog } from "@/components/change-group-dialog"

// Add this function before the ParticipantListItem component
function getTrainingStatus(lastTrainingDate: Date | null): "valid" | "expired" | "none" {
  if (!lastTrainingDate) {
    return "none"
  }

  const trainingDate = new Date(lastTrainingDate)
  const currentDate = new Date()

  // Calculate the difference in years
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(currentDate.getFullYear() - 1)

  return trainingDate >= oneYearAgo ? "valid" : "expired"
}

interface ParticipantListItemProps {
  participant: Participant
  groupId: string
  groupType: string
  onUpdate: () => void
}

export function ParticipantListItem({ participant, groupId, groupType, onUpdate }: ParticipantListItemProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isChangeGroupDialogOpen, setIsChangeGroupDialogOpen] = useState(false)
  const dropdownTriggerRef = useRef<HTMLButtonElement>(null)

  const handleRemoveParticipant = async () => {
    try {
      setIsLoading(true)
      await apiClient.delete(`/groups/${groupId}/participants/${participant.id}`, { endpoint: "new" })

      toast({
        title: "Sucesso",
        description: "Participante removido do grupo",
      })

      onUpdate()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao remover participante",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangeProfile = async (profile: string) => {
    try {
      setIsLoading(true)
      await apiClient.put(`/groups/${groupId}/participants/${participant.id}`, { profile }, { endpoint: "new" })

      toast({
        title: "Sucesso",
        description: "Função alterada com sucesso",
      })

      onUpdate()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao alterar função",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-start justify-between rounded-lg border bg-white p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={participant.profilePhoto || undefined} alt={participant.name} />
            <AvatarFallback>{participant.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium">{participant.name}</span>
              <Badge variant="secondary" className="text-xs">
                {participant.profile === "COORDINATOR"
                  ? "Coordenador"
                  : participant.profile === "CAPTAIN"
                    ? "Capitão"
                    : participant.profile === "ASSISTANT_CAPTAIN"
                      ? "Capitão Assistente"
                      : "Participante"}
              </Badge>
              {(() => {
                const trainingStatus = getTrainingStatus(participant.lastTrainingDate)

                if (trainingStatus === "valid") {
                  return (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      Treinamento Válido
                    </Badge>
                  )
                } else if (trainingStatus === "expired") {
                  return (
                    <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                      Treinamento Expirado
                    </Badge>
                  )
                } else {
                  return (
                    <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">
                      Sem Treinamento
                    </Badge>
                  )
                }
              })()}
            </div>
            <p className="text-sm text-muted-foreground">
              <strong>Congregação:</strong> {participant.congregationId || "Não informada"}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Grupo:</strong> {participant.computed || "Não informado"}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Atribuições:</strong>{" "}
              {participant.attributions.length > 0 ? participant.attributions.join(", ") : "Nenhuma"}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Tel:</strong> {participant.phone || "Não informado"}
            </p>
          </div>
        </div>
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild disabled={isLoading}>
            <Button variant="ghost" size="icon" className="-m-2" ref={dropdownTriggerRef}>
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Função</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => handleChangeProfile("CAPTAIN")}>Capitão</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleChangeProfile("ASSISTANT_CAPTAIN")}>
                    Capitão Assistente
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleChangeProfile("PARTICIPANT")}>Participante</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuItem onSelect={() => setIsChangeGroupDialogOpen(true)}>Trocar de grupo</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={handleRemoveParticipant}>
              Remover do grupo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {isChangeGroupDialogOpen && (
        <ChangeGroupDialog
          open={isChangeGroupDialogOpen}
          onOpenChange={setIsChangeGroupDialogOpen}
          participant={participant}
          currentGroupId={groupId}
          groupType={groupType}
          onGroupChanged={onUpdate}
        />
      )}
    </>
  )
}
