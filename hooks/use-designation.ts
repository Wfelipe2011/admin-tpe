"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { getUserFromToken } from "@/lib/auth-utils"
import { apiClient } from "@/lib/api-client"
import { toast } from "@/components/ui/use-toast"
import { useGroupStore } from "@/lib/stores/use-group-store"
import type { IDesignationParticipants, Assignment, Incident } from "@/types/designation-participants"

// Hook para debounce de valores
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function useDesignation() {
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isOptional, setIsOptional] = useState(false)
  const [isSticky, setIsSticky] = useState(false)
  const [copyStatus, setCopyStatus] = useState<"able" | "copied" | "error">("able")
  const [designationData, setDesignationData] = useState<IDesignationParticipants | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [participants, setParticipants] = useState<Incident[]>([])
  const [filteredParticipants, setFilteredParticipants] = useState<Incident[]>([])
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([])
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date())
  const isUpdatingRef = useRef(false)
  const { selectedGroupId } = useGroupStore()

  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  // Fetch designation data from API
  const fetchDesignationData = async (isLoading = true) => {
    // Se o grupo selecionado for "todos", não exibe nada
    if (selectedGroupId === "todos") {
      setDesignationData(null)
      setAssignments([])
      setParticipants([])
      setFilteredParticipants([])
      setFilteredAssignments([])
      setLoading(false)
      return
    }

    // Evita múltiplas chamadas simultâneas
    if (isUpdatingRef.current) return

    isUpdatingRef.current = true
    if (isLoading) setLoading(true)

    try {
      const user = getUserFromToken()

      if (!user) {
        console.error("User not found in token")
        setLoading(false)
        isUpdatingRef.current = false
        return
      }

      // Use o groupId do Zustand store
      const groupId = selectedGroupId || user.groupId

      const response = await apiClient.get<IDesignationParticipants>(
        `/groups/${groupId}/designations/week?groupId=${groupId}`,
      )

      setDesignationData(response)
      setAssignments(response.assignments || [])
      setParticipants(response.participants || [])
      setLastUpdateTime(new Date())
    } catch (error) {
      console.error("Error fetching designation data:", error)
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados da designação.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      isUpdatingRef.current = false
    }
  }

  // Configurar atualização automática a cada 30 segundos e quando o grupo mudar
  useEffect(() => {
    // Primeira chamada imediata
    fetchDesignationData()

    // Configurar intervalo para atualizações subsequentes
    const intervalId = setInterval(() => {
      console.log("Auto-updating designation data...")
      fetchDesignationData(false)
    }, 30000) // 30 segundos

    // Limpar intervalo quando o componente for desmontado
    return () => {
      clearInterval(intervalId)
    }
  }, [selectedGroupId]) // Adiciona selectedGroupId como dependência

  // Fetch filtered data when search term changes
  useEffect(() => {
    const fetchFilteredData = async () => {
      // Se o grupo selecionado for "todos", não exibe nada
      if (selectedGroupId === "todos") {
        setFilteredParticipants([])
        setFilteredAssignments([])
        return
      }

      if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
        // Reset to local filtering if search term is too short
        if (searchTerm) {
          const filtered = participants.filter((participant) =>
            participant.name.toLowerCase().includes(searchTerm.toLowerCase()),
          )
          setFilteredParticipants(filtered)

          const filteredAssigns = assignments.filter((assignment) =>
            assignment.participants.some((participant) =>
              participant.name.toLowerCase().includes(searchTerm.toLowerCase()),
            ),
          )
          setFilteredAssignments(filteredAssigns)
        } else {
          setFilteredParticipants(participants)
          setFilteredAssignments([])
        }
        return
      }

      try {
        const user = getUserFromToken()
        if (!user) {
          console.error("User not found in token")
          return
        }

        // Use o groupId do Zustand store
        const groupId = selectedGroupId || user.groupId

        const response = await apiClient.get<IDesignationParticipants>(
          `/groups/${groupId}/designations/week?groupId=${groupId}&filter=${encodeURIComponent(debouncedSearchTerm)}`,
        )

        // Update filtered assignments from API response
        if (response.assignmentsFiltered) {
          setFilteredAssignments(response.assignmentsFiltered)
        }

        // Filter participants locally based on search term
        const filtered = participants.filter((participant) =>
          participant.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
        )
        setFilteredParticipants(filtered)
      } catch (error) {
        console.error("Error fetching filtered data:", error)
        // Fallback to local filtering on error
        const filtered = participants.filter((participant) =>
          participant.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
        )
        setFilteredParticipants(filtered)

        const filteredAssigns = assignments.filter((assignment) =>
          assignment.participants.some((participant) =>
            participant.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
          ),
        )
        setFilteredAssignments(filteredAssigns)
      }
    }

    fetchFilteredData()
  }, [debouncedSearchTerm, participants, assignments, selectedGroupId]) // Adiciona selectedGroupId como dependência

  // Handle scroll for sticky counter
  useEffect(() => {
    const handleScroll = () => {
      const position = 50
      if (window.scrollY > position) {
        setIsSticky(true)
      } else {
        setIsSticky(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const copyToClipboard = async () => {
    if (!designationData?.id) return
    const linkToCopy = `${window.location.origin}/lista-designacao/${designationData.id}`

    try {
      await navigator.clipboard.writeText(linkToCopy)
      setCopyStatus("copied")
      toast({
        title: "Link copiado",
        description: "Link copiado para a área de transferência.",
      })
      setTimeout(() => setCopyStatus("able"), 3000)
    } catch (error) {
      setCopyStatus("error")
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      })
      setTimeout(() => setCopyStatus("able"), 3000)
    }
  }

  const autoAssign = async () => {
    if (!designationData?.id) return

    setLoading(true)
    try {
      const user = getUserFromToken()
      if (!user) {
        console.error("User not found in token")
        setLoading(false)
        return
      }

      // Use o groupId do Zustand store
      const groupId = selectedGroupId || user.groupId

      const response = await apiClient.get<IDesignationParticipants>(
        `/groups/${groupId}/designations/week?groupId=${groupId}&random=true`,
      )

      // Atualiza o estado completo com a resposta da API
      setDesignationData(response)
      setAssignments(response.assignments || [])
      setParticipants(response.participants || [])
      setLastUpdateTime(new Date())

      toast({
        title: "Designação automática",
        description: "A designação automática foi realizada com sucesso.",
      })
    } catch (error) {
      console.error("Error auto assigning:", error)
      toast({
        title: "Erro na designação automática",
        description: "Não foi possível realizar a designação automática.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const sendDesignation = async () => {
    if (!designationData?.id) return

    setLoading(true)
    try {
      const response = await apiClient.post<IDesignationParticipants>(`/designations/${designationData.id}/send`, {
        optional: isOptional,
      })

      // Atualiza o estado completo com a resposta da API
      setDesignationData(response)
      setAssignments(response.assignments || [])
      setParticipants(response.participants || [])
      setLastUpdateTime(new Date())

      toast({
        title: "Designação enviada",
        description: "A designação foi enviada com sucesso.",
      })
    } catch (error) {
      console.error("Error sending designation:", error)
      toast({
        title: "Erro ao enviar designação",
        description: "Não foi possível enviar a designação.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const cancelDesignation = async (justification: string) => {
    if (!designationData?.id || !justification.trim()) return

    setLoading(true)
    try {
      const response = await apiClient.patch<IDesignationParticipants>(`/designations/${designationData.id}/cancel`, {
        justification: justification.trim(),
      })

      // Atualiza o estado completo com a resposta da API
      setDesignationData(response)
      setAssignments(response.assignments || [])
      setParticipants(response.participants || [])
      setLastUpdateTime(new Date())

      toast({
        title: "Designação cancelada",
        description: "A designação foi cancelada com sucesso.",
      })

      // Close the modal
      setShowCancelModal(false)
    } catch (error) {
      console.error("Error cancelling designation:", error)
      toast({
        title: "Erro ao cancelar designação",
        description: "Não foi possível cancelar a designação.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePoint = async (pointId: string, status: boolean) => {
    if (!designationData?.id) return

    try {
      const response = await apiClient.patch<IDesignationParticipants>(
        `/designations/${designationData.id}/points/${pointId}`,
        {
          status,
        },
      )

      // Atualiza o estado completo com a resposta da API
      setDesignationData(response)
      setAssignments(response.assignments || [])
      setParticipants(response.participants || [])
      setLastUpdateTime(new Date())

      toast({
        title: "Ponto atualizado",
        description: `O ponto foi ${status ? "ativado" : "desativado"} com sucesso.`,
      })
    } catch (error) {
      console.error("Error updating point:", error)
      toast({
        title: "Erro ao atualizar ponto",
        description: "Não foi possível atualizar o status do ponto.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePointParticipants = async (pointId: string, participantIds: string[]) => {
    if (!designationData?.id) return

    try {
      const response = await apiClient.put<IDesignationParticipants>(
        `/designations/${designationData.id}/points/${pointId}/participants`,
        {
          participants: participantIds,
        },
      )

      // Atualiza o estado completo com a resposta da API
      setDesignationData(response)
      setAssignments(response.assignments || [])
      setParticipants(response.participants || [])
      setLastUpdateTime(new Date())

      toast({
        title: "Participantes atualizados",
        description: "Os participantes do ponto foram atualizados com sucesso.",
      })

      return response
    } catch (error) {
      console.error("Error updating point participants:", error)
      toast({
        title: "Erro ao atualizar participantes",
        description: "Não foi possível atualizar os participantes do ponto.",
        variant: "destructive",
      })
      throw error
    }
  }

  const moveParticipant = async (participantId: string, fromPointId: string | null, toPointId: string | null) => {
    try {
      // Se estiver movendo de um ponto para participantes disponíveis
      if (fromPointId && !toPointId) {
        const assignment = assignments.find((a) => a.point.id === fromPointId)
        if (!assignment) return

        // Obter participantes atuais excluindo o que será removido
        const currentParticipants = assignment.participants.filter((p) => p.id !== participantId).map((p) => p.id)

        // Atualizar via API
        await handleUpdatePointParticipants(fromPointId, currentParticipants)
      }
      // Se estiver movendo de participantes disponíveis para um ponto
      else if (!fromPointId && toPointId) {
        const assignment = assignments.find((a) => a.point.id === toPointId)
        if (!assignment) return

        // Obter participantes atuais e adicionar o novo
        const currentParticipants = [...assignment.participants.map((p) => p.id), participantId]

        // Atualizar via API
        await handleUpdatePointParticipants(toPointId, currentParticipants)
      }
      // Se estiver movendo de um ponto para outro
      else if (fromPointId && toPointId) {
        // Primeiro remover do ponto de origem
        const fromAssignment = assignments.find((a) => a.point.id === fromPointId)
        if (!fromAssignment) return

        const fromParticipants = fromAssignment.participants.filter((p) => p.id !== participantId).map((p) => p.id)

        await handleUpdatePointParticipants(fromPointId, fromParticipants)

        // Depois adicionar ao ponto de destino
        const toAssignment = assignments.find((a) => a.point.id === toPointId)
        if (!toAssignment) return

        const toParticipants = [...toAssignment.participants.map((p) => p.id), participantId]

        await handleUpdatePointParticipants(toPointId, toParticipants)
      }
    } catch (error) {
      console.error("Error moving participant:", error)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleAutoAssignClick = () => {
    // Verifica se há pontos com participantes
    const hasAssignedParticipants = assignments.some((assignment) => assignment.participants.length > 0)

    if (hasAssignedParticipants) {
      setShowConfirmModal(true)
    } else {
      // Se não houver participantes designados, chama a API diretamente
      autoAssign()
    }
  }

  const handleCancelClick = () => {
    setShowCancelModal(true)
  }

  const isAbsent = (participant: Incident) =>
    participant.incident_history?.status === "OPEN" || participant.incident_history?.status === "ACTIVE"

  const registerAbsence = async (participantId: string) => {
    if (!designationData?.id) return

    try {
       const response = await apiClient.post(`/participants/${participantId}/incidences`, {
          reason: "Não estava presente na chamada",
        })

      // Atualiza os dados após registrar a ausência
      await fetchDesignationData()

      toast({
        title: "Ausência registrada",
        description: "A ausência do participante foi registrada com sucesso.",
      })

      return response
    } catch (error) {
      console.error("Error registering absence:", error)
      toast({
        title: "Erro ao registrar ausência",
        description: "Não foi possível registrar a ausência do participante.",
        variant: "destructive",
      })
      throw error
    }
  }

  // Formatar a hora da última atualização
  const formattedLastUpdateTime = lastUpdateTime.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })

  return {
    loading,
    searchTerm,
    isOptional,
    isSticky,
    copyStatus,
    designationData,
    assignments,
    participants,
    filteredParticipants,
    filteredAssignments,
    showConfirmModal,
    showCancelModal,
    lastUpdateTime: formattedLastUpdateTime,
    setShowConfirmModal,
    setShowCancelModal,
    handleSearch,
    handleAutoAssignClick,
    handleCancelClick,
    copyToClipboard,
    autoAssign,
    sendDesignation,
    cancelDesignation,
    handleUpdatePoint,
    moveParticipant,
    isAbsent,
    setIsOptional,
    registerAbsence,
    fetchDesignationData,
  }
}
