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
import { MoreHorizontal, User, UserCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"
import type { Participant } from "@/types/group-participants"
import { ChangeGroupDialog } from "@/components/change-group-dialog"

// Add this function before the ParticipantListItem component
function getTrainingStatus(lastTrainingDate: string | null): "valid" | "expired" | "none" {
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
      <div className="flex items-start justify-between rounded-lg border-gray-200 bg-white p-6 hover:bg-[#F8F8F8] transition-colors">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 ring-2 ring-gray-100">
            <AvatarImage src={participant.profilePhoto || undefined} alt={participant.name} />
            <AvatarFallback className="bg-[#374192]/10 text-[#374192] font-semibold">
              {participant.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-semibold text-[#333333] flex items-center gap-2">{participant.name}</span>

              {/* Indicador de Gênero */}
              {participant.sex === "MALE" ? (
                <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2 py-1 flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Irmão
                </Badge>
              ) : participant.sex === "FEMALE" ? (
                <Badge className="bg-pink-50 text-pink-700 border-pink-200 text-xs px-2 py-1 flex items-center gap-1">
                  <UserCheck className="h-3 w-3" />
                  Irmã
                </Badge>
              ) : (
                <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs px-2 py-1">
                  Não informado
                </Badge>
              )}

              {/* Badge de Perfil/Função */}
              <Badge className="text-xs font-medium px-2 py-1 bg-[#F8F8F8] text-[#333333] border-gray-200">
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
                    <Badge className="text-xs font-medium px-2 py-1 bg-[#2ECC71]/10 text-[#2ECC71] border-[#2ECC71]/20">
                      Treinamento Válido
                    </Badge>
                  )
                } else if (trainingStatus === "expired") {
                  return (
                    <Badge className="text-xs font-medium px-2 py-1 bg-[#F1C40F]/10 text-[#F1C40F] border-[#F1C40F]/20">
                      Treinamento Expirado
                    </Badge>
                  )
                } else {
                  return (
                    <Badge className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 border-gray-200">
                      Sem Treinamento
                    </Badge>
                  )
                }
              })()}
            </div>
            <p className="text-sm text-[#666666]">
              <strong className="text-[#333333]">Congregação:</strong> {participant.congregation?.name || "Não informada"}
            </p>
            <p className="text-sm text-[#666666]">
              <strong className="text-[#333333]">Atribuições:</strong>{" "}
              {participant.attributions.length > 0 ? participant.attributions.join(", ") : "Nenhuma"}
            </p>
            <p className="text-sm text-[#666666]">
              <strong className="text-[#333333]">Tel:</strong> {participant.phone || "Não informado"}
            </p>
          </div>
        </div>
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild disabled={isLoading}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[#666666] hover:text-[#374192] hover:bg-[#374192]/10 transition-colors"
              ref={dropdownTriggerRef}
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
            <DropdownMenuItem
              onSelect={() => setIsChangeGroupDialogOpen(true)}
              className="text-[#333333] focus:bg-[#374192]/10"
            >
              Trocar de grupo
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-200" />
            <DropdownMenuItem
              className="text-[#E74C3C] focus:text-[#E74C3C] focus:bg-[#E74C3C]/10"
              onSelect={handleRemoveParticipant}
            >
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
