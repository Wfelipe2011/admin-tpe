"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { getUserFromToken } from "@/lib/auth-utils"
import { apiClient } from "@/lib/api-client"
import { useGroupStore } from "@/lib/stores/use-group-store"
import type { IDesignationParticipants, Assignment, Incident } from "@/types/designation-participants"
import toast from "react-hot-toast"

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

      toast.success("Designação carregada com sucesso!")
      setDesignationData(response)
      setAssignments(response.assignments || [])
      setParticipants(response.participants || [])
      setLastUpdateTime(new Date())
    } catch (error) {
      console.error("Error fetching designation data:", error)
      toast.error("Erro ao carregar designação. Tente novamente.")
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
      toast.success("Link copiado com sucesso!")
      setTimeout(() => setCopyStatus("able"), 3000)
    } catch (error) {
      setCopyStatus("error")
      toast.error("Erro ao copiar o link. Tente novamente.")
      setTimeout(() => setCopyStatus("able"), 3000)
    }
  }

  const autoAssign = async () => {
    if (!designationData?.id) return
    const loadingToast = toast.loading("Realizando designação automática...")
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

      toast.success("Designação automática realizada com sucesso!")
    } catch (error) {
      console.error("Error auto assigning:", error)
      toast.error("Erro ao realizar designação automática. Tente novamente.")
    } finally {
      toast.dismiss(loadingToast)
      setLoading(false)
    }
  }

  const sendDesignation = async () => {
    if (!designationData?.id) return
    const loadingToast = toast.loading("Enviando designação...")
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

      toast.success("Designação enviada com sucesso!")
    } catch (error) {
      console.error("Error sending designation:", error)
      toast.error("Erro ao enviar designação. Tente novamente.")
    } finally {
      setLoading(false)
      toast.dismiss(loadingToast)
    }
  }

  const cancelDesignation = async (justification: string) => {
    if (!designationData?.id || !justification.trim()) return
    const loadingToast = toast.loading("Cancelando designação...")
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

      toast.success("Designação cancelada com sucesso!")

      // Close the modal
      setShowCancelModal(false)
    } catch (error) {
      console.error("Error cancelling designation:", error)
      toast.error("Erro ao cancelar designação. Tente novamente.")
    } finally {
      setLoading(false)
      toast.dismiss(loadingToast)
    }
  }

  const handleUpdatePoint = async (pointId: string, status: boolean) => {
    if (!designationData?.id) return
    const loadingToast = toast.loading("Atualizando ponto...")
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

      toast.success(`Ponto ${status ? "ativado" : "desativado"} com sucesso!`)
    } catch (error) {
      console.error("Error updating point:", error)
      toast.error("Erro ao atualizar ponto. Tente novamente.")
    } finally {
      setLoading(false)
      toast.dismiss(loadingToast)
    }
  }

  const handleUpdatePointParticipants = async (pointId: string, participantIds: string[]) => {
    if (!designationData?.id) return
    const loadingToast = toast.loading("Atualizando participantes do ponto...")
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

      toast.success("Participantes do ponto atualizados com sucesso!")
      toast.dismiss(loadingToast)

      return response
    } catch (error) {
      console.error("Error updating point participants:", error)
      toast.error("Erro ao atualizar participantes do ponto. Tente novamente.")
      toast.dismiss(loadingToast)
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
    const loadingToast = toast.loading("Registrando ausência...")
    try {
      const response = await apiClient.post(`/participants/${participantId}/incidences`, {
        reason: "Não estava presente na chamada",
      })

      // Atualiza os dados após registrar a ausência
      await fetchDesignationData()

      toast.success("Ausência registrada com sucesso!")
      toast.dismiss(loadingToast)

      return response
    } catch (error) {
      console.error("Error registering absence:", error)
      toast.error("Erro ao registrar ausência. Tente novamente.")
      toast.dismiss(loadingToast)
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
    groupId: selectedGroupId,
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
