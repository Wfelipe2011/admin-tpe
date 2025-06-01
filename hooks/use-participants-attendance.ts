"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient } from "@/lib/api-client"
import { toast } from "@/components/ui/use-toast"
import type { Participant } from "@/types/participants" // Assuming this type exists
import type { Incident } from "@/types/designation" // Assuming this type exists

// Interface para os participantes
// export interface IParticipant {
//   id: string
//   name: string
//   profile: string
//   profile_photo?: string
//   isAbsent?: boolean
//   incident_history?: any[] // Array de incidentes do participante
// }

interface UseParticipantsAttendanceOptions {
  groupId?: string
}

interface ParticipantWithAttendance extends Participant {
  isAbsent?: boolean
  incidents?: Incident[] // Or some structure for incident history
}

export const useParticipantsAttendance = (options?: UseParticipantsAttendanceOptions) => {
  const { groupId } = options || {}
  const [participants, setParticipants] = useState<ParticipantWithAttendance[]>([])
  const [loading, setLoading] = useState(true)
  // Add other necessary states, e.g., for error handling
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchParticipants = useCallback(async () => {
    setLoading(true)
    try {
      // Example: Adjust API endpoint or query params based on groupId
      const endpoint = groupId
        ? `/api/participants?groupId=${groupId}&attendance=true`
        : "/api/participants?attendance=true"
      // Or, if groupId is for client-side filtering after a general fetch:
      // const endpoint = "/api/all-participants-for-attendance";

      const response = await apiClient.get<ParticipantWithAttendance[]>(endpoint) // Replace with your actual API call

      // If filtering client-side based on a property within participant data:
      // let fetchedParticipants = response.data;
      // if (groupId) {
      //   fetchedParticipants = fetchedParticipants.filter(p => p.someGroupIdProperty === groupId);
      // }
      // setParticipants(fetchedParticipants);

      setParticipants(response.data) // Assuming API handles filtering or groupId is for other purpose
    } catch (error) {
      console.error("Failed to fetch participants for attendance:", error)
      toast({
        title: "Erro ao carregar participantes",
        description: "Não foi possível carregar a lista de participantes.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [groupId]) // Refetch if groupId changes

  useEffect(() => {
    fetchParticipants()
  }, [fetchParticipants])

  const registerAbsence = useCallback(
    async (participantId: string) => {
      setLoading(true) // Certifique-se de que o estado de loading é ativado
      try {
        await apiClient.post(`/participants/${participantId}/incidences`, {
          reason: "Não estava presente",
        })

        toast({
          title: "Ausência registrada",
          description: "A ausência do participante foi registrada com sucesso.",
        })

        // Atualizar a lista de participantes, forçando um refetch
        setRefreshKey((prev) => prev + 1)
      } catch (error) {
        console.error("Error registering absence:", error)
        toast({
          title: "Erro ao registrar ausência",
          description: "Não foi possível registrar a ausência do participante.",
          variant: "destructive",
        })
      } finally {
        setLoading(false) // Certifique-se de que o estado de loading é desativado
      }
    },
    [groupId], // Mantenha groupId nas dependências se ele for usado em algum lugar ou se a lógica de refresh depender dele
  )

  const hasIncidentHistory = useCallback((participant: ParticipantWithAttendance): boolean => {
    // Your logic to determine if a participant has incident history
    // This might check a property on the participant object
    return !!(participant.incidents && participant.incidents.length > 0)
  }, [])

  return {
    participants,
    loading,
    registerAbsence,
    hasIncidentHistory,
    refetchParticipants: fetchParticipants, // Expose refetch if needed
  }
}
