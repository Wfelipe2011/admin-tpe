"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient } from "@/lib/api-client"
import { toast } from "@/hooks/use-toast"

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
  designationId?: string
}

export const useParticipantsAttendance = (options?: UseParticipantsAttendanceOptions) => {
  const { groupId, designationId } = options || {}
  const [participants, setParticipants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchParticipants = useCallback(async () => {
    setLoading(true)
    try {
      console.log("Fetching participants with groupId:", groupId)
      // Example: Adjust API endpoint or query params based on groupId
      const endpoint = groupId
        ? `/participants?groupId=${groupId}&attendance=true`
        : "/participants?attendance=true"
      // Or, if groupId is for client-side filtering after a general fetch:
      // const endpoint = "/api/all-participants-for-attendance";

      const response = await apiClient.get<any[]>(endpoint) // Replace with your actual API call
      // If filtering client-side based on a property within participant data:
      // let fetchedParticipants = response.data;
      // if (groupId) {
      //   fetchedParticipants = fetchedParticipants.filter(p => p.someGroupIdProperty === groupId);
      // }
      // setParticipants(fetchedParticipants);

      setParticipants(response) // Assuming API handles filtering or groupId is for other purpose
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
  }, [groupId, designationId]) // Refetch if groupId changes

  useEffect(() => {
    fetchParticipants()
  }, [fetchParticipants])

  const registerAbsence = useCallback(
    async (participantId: string) => {
      setLoading(true) // Certifique-se de que o estado de loading é ativado
      try {
        const endpoint = `/designations/${designationId}/participants/${participantId}/incidences`

        await apiClient.post(endpoint, {
          reason: "Não estava presente",
        })

        toast({
          title: "Ausência registrada",
          description: "A ausência do participante foi registrada com sucesso.",
        })

        fetchParticipants() // Refetch para atualizar a lista após registrar a ausência
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
    [groupId, designationId], // Mantenha groupId nas dependências se ele for usado em algum lugar ou se a lógica de refresh depender dele
  )

  const hasIncidentHistory = useCallback((participant: any): boolean => {
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
