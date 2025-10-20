"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import type { IGroups } from "@/types/groups"
import { Trash2, Pencil } from "lucide-react"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import type { IParticipants } from "@/types/participants"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface GroupCardProps {
  group: IGroups
  onGroupUpdated?: () => void
}

export function GroupCard({ group, onGroupUpdated }: GroupCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const [coordinator, setCoordinator] = useState<IParticipants | null>(null)
  const [isLoadingCoordinator, setIsLoadingCoordinator] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

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
    return `${hours}h${minutes !== "00" ? minutes : ""}`
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await apiClient.delete(`groups/${group.id}`, { endpoint: "new" })
      toast({
        title: "Sucesso",
        description: "Grupo excluído com sucesso",
      })
      if (onGroupUpdated) {
        onGroupUpdated()
      }
    } catch (error) {
      console.error("Erro ao excluir grupo:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível excluir o grupo",
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  const weekday = formatWeekday(group.configWeekday)
  const startTime = formatTime(group.configStartHour)
  const endTime = formatTime(group.configEndHour)

  useEffect(() => {
    const fetchCoordinator = async () => {
      if (!group.coordinatorId) return

      setIsLoadingCoordinator(true)
      try {
        const data = await apiClient.get<IParticipants>(`participants/${group.coordinatorId}`, { endpoint: "new" })
        setCoordinator(data)
      } catch (error) {
        console.error("Erro ao buscar coordenador:", error)
      } finally {
        setIsLoadingCoordinator(false)
      }
    }

    fetchCoordinator()
  }, [group.coordinatorId])

  return (
    <Card className="group overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg hover:border-[#374192] transition-all duration-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-[#374192] to-[#46607F] p-4">
        <div className="font-semibold text-white text-sm truncate pr-2">{group.name}</div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Link href={`/grupos/editar/${group.id}`} passHref>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20 transition-colors"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
          {group.participants === 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/80 hover:text-white hover:bg-red-500/20 transition-colors"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-6 space-y-4">
        <div className="space-y-3">
          {/* Day and Time */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#374192] rounded-full flex-shrink-0"></div>
            <span className="text-sm font-medium text-[#333333]">{weekday}</span>
          </div>

          <div className="space-y-2 text-sm text-[#666666]">
            <div className="flex justify-between">
              <span>Horário:</span>
              <span className="font-medium text-[#333333]">{startTime} - {endTime}</span>
            </div>

            <div className="flex justify-between">
              <span>Participantes:</span>
              <span className="font-medium text-[#333333]">
                {group.participants} / {group.configMax || "∞"}
              </span>
            </div>

            <div className="flex justify-between items-start">
              <span>Responsável:</span>
              <span className="font-medium text-[#333333] text-right max-w-[120px] truncate">
                {isLoadingCoordinator ? (
                  <span className="text-[#929BD2]">Carregando...</span>
                ) : coordinator ? (
                  coordinator.name
                ) : (
                  <span className="text-[#929BD2]">Não atribuído</span>
                )}
              </span>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="p-4 pt-0">
        <Link href={`/grupos/${group.id}`} passHref className="w-full">
          <Button
            variant="outline"
            className="w-full border-[#374192] text-[#374192] hover:bg-[#374192] hover:text-white transition-colors font-medium"
          >
            Ver Participantes
          </Button>
        </Link>
      </CardFooter>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-[#333333] font-semibold">Confirmar exclusão</DialogTitle>
            <DialogDescription className="text-[#666666]">
              Tem certeza que deseja excluir o grupo <strong>"{group.name}"</strong>? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-gray-300 text-[#666666] hover:bg-gray-50"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-[#E74C3C] hover:bg-red-600 text-white"
            >
              {isDeleting ? "Excluindo..." : "Excluir Grupo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
