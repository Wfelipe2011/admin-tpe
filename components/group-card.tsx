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
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between bg-gray-50 p-3">
        <div className="font-medium">{group.name}</div>
        <div className="flex items-center gap-2">
          <Link href={`/grupos/editar/${group.id}`} passHref>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100">
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
          {group.participants === 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <CardContent className="p-3 pt-3">
        <div className="space-y-1 text-sm">
          <p className="text-muted-foreground">{weekday}</p>
          <p>Tipo: {group.type === "MAIN" ? "Principal" : group.type === "ADDITIONAL" ? "Adicional" : "Especial"}</p>
          <p>
            Horário: {startTime} / {endTime}
          </p>
          <p>
            Participantes: {group.participants} / {group.configMax || "∞"}
          </p>
          <p>
            Responsável: {isLoadingCoordinator ? "Carregando..." : coordinator ? coordinator.name : "Não atribuído"}
          </p>
        </div>
      </CardContent>
      <CardFooter className="w-full p-3 pt-0">
        <Link href={`/grupos/${group.id}`} passHref className="w-full">
          <Button variant="secondary" className="w-full">
            Participantes
          </Button>
        </Link>
      </CardFooter>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o grupo "{group.name}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
