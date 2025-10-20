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
    <Card className="p-4 border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-white">
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <Avatar className="h-12 w-12 ring-2 ring-gray-100">
            <AvatarImage src={participant.profilePhoto || undefined} alt={participant.name} />
            <AvatarFallback className="bg-[#374192]/10 text-[#374192] font-semibold">
              {participant.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-[#333333] truncate">{participant.name}</p>
              {participant.profile === "COORDINATOR" && (
                <Badge className="bg-[#374192] text-white text-xs px-2 py-1">
                  Coordenador
                </Badge>
              )}
            </div>
            <p className="text-sm text-[#666666]">Tel: {participant.phone || "Não informado"}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={isLoading}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-[#666666] hover:text-[#374192] hover:bg-[#374192]/10 transition-colors"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-white border-gray-200 shadow-lg">
            {participant.sex === "MALE" && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="text-[#333333] focus:bg-[#374192]/10">
                  Função
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="bg-white border-gray-200 shadow-lg">
                    <DropdownMenuItem 
                      onClick={() => handleChangeProfile("CAPTAIN")}
                      className="text-[#333333] focus:bg-[#374192]/10"
                    >
                      Capitão
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleChangeProfile("ASSISTANT_CAPTAIN")}
                      className="text-[#333333] focus:bg-[#374192]/10"
                    >
                      Capitão Assistente
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleChangeProfile("PARTICIPANT")}
                      className="text-[#333333] focus:bg-[#374192]/10"
                    >
                      Participante
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            )}
            <DropdownMenuItem disabled className="text-[#929BD2]">
              Trocar de dia
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-200" />
            <DropdownMenuItem 
              className="text-[#E74C3C] focus:text-[#E74C3C] focus:bg-[#E74C3C]/10" 
              onClick={handleRemoveParticipant}
            >
              Remover do grupo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  )
}
