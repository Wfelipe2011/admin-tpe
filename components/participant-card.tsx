"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
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

interface ParticipantCardProps {
  participant: Participant
  groupId: string
  groupType: string
  onUpdate: () => void
}

export function ParticipantCard({ participant, groupId, onUpdate }: ParticipantCardProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

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
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={participant.profilePhoto || undefined} alt={participant.name} />
            <AvatarFallback>{participant.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{participant.name}</p>
              {participant.profile === "COORDINATOR" && (
                <Badge variant="secondary" className="text-xs">
                  Coordenador
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Tel: {participant.phone || "Não informado"}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={isLoading}>
            <Button variant="ghost" size="icon" className="-m-2">
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
            <DropdownMenuItem disabled>Trocar de dia</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleRemoveParticipant}>
              Remover do grupo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  )
}
