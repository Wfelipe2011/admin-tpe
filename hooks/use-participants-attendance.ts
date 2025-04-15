"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { toast } from "@/components/ui/use-toast"
import Cookies from "js-cookie"
import { getUserFromToken } from "@/lib/auth-utils"

// Interface para os participantes
export interface IParticipant {
  id: string
  name: string
  profile: string
  profile_photo?: string
  isAbsent?: boolean
  incident_history?: any[] // Array de incidentes do participante
}

export function useParticipantsAttendance() {
  const [participants, setParticipants] = useState<IParticipant[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  // Função para buscar os participantes
  const fetchParticipants = async () => {
    setLoading(true)
    try {
      const user = getUserFromToken()
      if (!user || !user.groupId) {
        console.error("User or groupId not found in token")
        setLoading(false)
        return
      }

      // First try to get groupId from cookies, then fall back to user.groupId
      const cookieGroupId = Cookies.get("selectedGroupId")
      const groupId = cookieGroupId || user.groupId

      const participantsData = await apiClient.get<IParticipant[]>(`/participants?groupId=${groupId}`)

      // Processar os dados para identificar participantes ausentes
      const processedParticipants = participantsData.map((participant) => ({
        ...participant,
        isAbsent: participant.isAbsent || false,
      }))

      setParticipants(processedParticipants)
    } catch (error) {
      console.error("Error fetching participants:", error)
      toast({
        title: "Erro ao carregar participantes",
        description: "Não foi possível carregar a lista de participantes.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Função para registrar ausência
  const registerAbsence = async (participantId: string) => {
    setLoading(true)
    try {
      await apiClient.post(`/participants/${participantId}/incidences`, {
        reason: "Não estava presente",
      })

      toast({
        title: "Ausência registrada",
        description: "A ausência do participante foi registrada com sucesso.",
      })

      // Atualizar a lista de participantes
      setRefreshKey((prev) => prev + 1)
    } catch (error) {
      console.error("Error registering absence:", error)
      toast({
        title: "Erro ao registrar ausência",
        description: "Não foi possível registrar a ausência do participante.",
        variant: "destructive",
      })
    }
  }

  // Verificar se o participante tem histórico de incidentes
  const hasIncidentHistory = (participant: IParticipant): boolean => {
    return !!(participant.incident_history)
  }

  // Buscar participantes quando o componente montar ou quando refreshKey mudar
  useEffect(() => {
    fetchParticipants()
  }, [refreshKey])

  return {
    participants,
    loading,
    registerAbsence,
    refreshParticipants: () => setRefreshKey((prev) => prev + 1),
    hasIncidentHistory,
  }
}
