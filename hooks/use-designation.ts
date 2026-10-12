"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { getUserFromToken } from "@/lib/auth-utils"
import { apiClient } from "@/lib/api-client"
import { useGroupStore } from "@/lib/stores/use-group-store"
import type { IDesignationParticipants, Assignment, Incident } from "@/types/designation-participants"
import type { DesignationInsights, SuggestAssignmentResponse } from "@/types/designation-insights"
import toast from "react-hot-toast"
import axios from "axios"

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
  const [showRecreateModal, setShowRecreateModal] = useState(false)
  const [insights, setInsights] = useState<DesignationInsights | null>(null)
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date())
  const requestIdRef = useRef(0)
  const creationRef = useRef(false)
  const [creatingDesignation, setCreatingDesignation] = useState(false)
  const [designationLoadState, setDesignationLoadState] = useState<"idle" | "ready" | "missing" | "error">("idle")
  const [designationLoadError, setDesignationLoadError] = useState<string | null>(null)
  const [missingGroupClosed, setMissingGroupClosed] = useState(false)
  const { selectedGroupId } = useGroupStore()

  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  // Fetch designation data from API
  const fetchDesignationData = async (isLoading = true) => {
    const requestId = ++requestIdRef.current
    setDesignationData(null)
    setAssignments([])
    setParticipants([])
    setFilteredParticipants([])
    setFilteredAssignments([])
    setInsights(null)
    setIsOptional(false)
    setDesignationLoadState("idle")
    setDesignationLoadError(null)
    setMissingGroupClosed(false)
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

    if (isLoading) setLoading(true)

    try {
      const user = getUserFromToken()

      if (!user) {
        console.error("User not found in token")
        setLoading(false)
        return
      }

      // Use o groupId do Zustand store
      const groupId = selectedGroupId || user.groupId
      if (!groupId) throw new Error("Selecione um grupo para carregar a designação")

      const response = await apiClient.get<IDesignationParticipants>(
        `/groups/${groupId}/designations/week?groupId=${groupId}`,
      )

      if (requestId !== requestIdRef.current) return
      setDesignationLoadState("ready")
      setDesignationData(response)
      setAssignments(response.assignments || [])
      setParticipants(response.participants || [])
      setIsOptional(!response.mandatoryPresence)
      setLastUpdateTime(new Date())
    } catch (error) {
      if (requestId !== requestIdRef.current) return
      if (axios.isAxiosError(error) && error.response?.status === 404 && error.response.data?.code === "DESIGNATION_NOT_FOUND") {
        setDesignationLoadState("missing")
        setMissingGroupClosed(error.response.data.groupStatus !== "OPEN")
        return
      }
      console.error("Error fetching designation data:", error)
      setDesignationLoadState("error")
      setDesignationLoadError("Não foi possível carregar a designação. Tente novamente.")
    } finally {
      if (requestId === requestIdRef.current) setLoading(false)
    }
  }

  // Hints de histórico (dupla/ponto) — não-bloqueante, só informativo.
  // Refaz sempre que a composição dos pontos muda (manual ou automático).
  const fetchInsights = async (designationId: string) => {
    const requestId = requestIdRef.current
    try {
      const response = await apiClient.get<DesignationInsights>(`/designations/${designationId}/insights`)
      if (requestId !== requestIdRef.current) return
      setInsights(response)
    } catch (error) {
      if (requestId !== requestIdRef.current) return
      console.error("Error fetching designation insights:", error)
      // Não bloqueia a tela por causa disso — só some o hint.
      setInsights(null)
    }
  }

  const assignmentsSignature = assignments
    .map((a) => `${a.point.id}:${a.participants.map((p) => p.id).sort().join(",")}`)
    .join("|")

  useEffect(() => {
    if (!designationData?.id) {
      setInsights(null)
      return
    }
    fetchInsights(designationData.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [designationData?.id, assignmentsSignature])

  // Configurar atualização automática a cada 30 segundos e quando o grupo mudar
  useEffect(() => {
    // Primeira chamada imediata
    fetchDesignationData()
    setSearchTerm("")
    return () => { requestIdRef.current++ }
  }, [selectedGroupId]) // Adiciona selectedGroupId como dependência

  // Fetch filtered data when search term changes
  useEffect(() => {
    const fetchFilteredData = async () => {
      const requestId = requestIdRef.current
      // Se o grupo selecionado for "todos", não exibe nada
      if (selectedGroupId === "todos" || designationLoadState !== "ready") {
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

        if (requestId !== requestIdRef.current) return
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
        if (requestId !== requestIdRef.current) return
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
  }, [debouncedSearchTerm, participants, assignments, selectedGroupId, designationLoadState])

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
    const linkToCopy = `${window.location.origin}/designacao/${designationData.id}`

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

  // Sorteio simples: só é usado quando o auto-assign inteligente falha. Continua
  // sendo um GET com `?random=true` (escrita dentro de GET, como na legacy), mas
  // agora o sorteio e a gravação acontecem direto no api-v2. A fila FIFO e
  // seus produtores/consumidores continuam disponíveis na legacy.
  const randomAssign = async (groupId: string) =>
    apiClient.get<IDesignationParticipants>(`/groups/${groupId}/designations/week?groupId=${groupId}&random=true`)

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

      // Pool completo (quem já está num ponto + quem ainda está disponível) — o
      // mesmo conjunto que a legacy usaria. O back-end novo decide quem pode ser
      // escalado (ignora capitão/coordenador), o front só repassa o que já tem.
      if (!groupId) throw new Error("Grupo não encontrado para designação automática")
      const allCandidates = [
        ...participants.map((p) => ({ id: p.id, profile: p.profile, sex: p.sex })),
        ...assignments.flatMap((a) => a.participants.map((p) => ({ id: p.id, profile: p.profile, sex: p.sex }))),
      ]

      let response: IDesignationParticipants
      try {
        const suggestion = await apiClient.post<SuggestAssignmentResponse>(
          `/designations/${designationData.id}/suggest-assignment`,
          { participants: allCandidates },
        )

        // Uma chamada e uma transação, sem um PUT sequencial por ponto.
        response = await apiClient.put<IDesignationParticipants>(
          `/designations/${designationData.id}/participants`,
          { assignments: suggestion.assignments },
        )

        if (suggestion.warnings.length > 0) {
          toast(
            `Designação automática concluída, mas o grupo é pequeno: ${suggestion.warnings.length} repetição(ões) de dupla/ponto não deu pra evitar. Confira os avisos nos pontos.`,
            { icon: "⚠️", duration: 6000 },
          )
        } else {
          toast.success("Designação automática realizada com sucesso (sem repetir dupla/ponto recente)!")
        }
      } catch (smartError) {
        // Nunca bloqueia: se a sugestão inteligente falhar, cai pro sorteio simples de sempre.
        console.error("Error on smart auto-assign, falling back to simple random assign:", smartError)
        response = await randomAssign(groupId)
        toast.success("Designação automática realizada com sucesso!")
      }

      // Atualiza o estado completo com a resposta da API
      setDesignationData(response)
      setAssignments(response.assignments || [])
      setParticipants(response.participants || [])
      setLastUpdateTime(new Date())
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
      const response = await apiClient.post<IDesignationParticipants>(
        `/designations/${designationData.id}/send`,
        { optional: isOptional },
      )

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
      const response = await apiClient.patch<IDesignationParticipants>(
        `/designations/${designationData.id}/cancel`,
        { justification: justification.trim() },
      )

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

  const reopenDesignation = async () => {
    if (!designationData?.id) return
    const loadingToast = toast.loading("Reabrindo designação...")
    setLoading(true)
    try {
      const response = await apiClient.request<IDesignationParticipants>(`/designations/${designationData.id}/reopen`, {
        method: "PATCH"
      })

      // Atualiza o estado completo com a resposta da API
      await fetchDesignationData()
      toast.success("Designação reaberta com sucesso!")
    } catch (error) {
      console.error("Error reopening designation:", error)
      toast.error("Erro ao reabrir designação. Tente novamente.")
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
        { status },
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
        { participants: participantIds },
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

  const handleRecreateClick = () => {
    setShowRecreateModal(true)
  }

  const createDesignation = async () => {
    if (creationRef.current) return
    const user = getUserFromToken()
    const groupId = selectedGroupId || user?.groupId
    if (!groupId || groupId === "todos" || user?.profile !== "COORDINATOR") return
    creationRef.current = true
    setCreatingDesignation(true)
    const requestId = requestIdRef.current
    try {
      // Cria somente o que está ausente. Nunca apaga designações arquivadas.
      await apiClient.post(`/designations?groupId=${groupId}`, {})
      if (requestId === requestIdRef.current) {
        await fetchDesignationData()
        toast.success("Designação criada com sucesso!")
      }
    } catch (error) {
      if (requestId !== requestIdRef.current) return
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        await fetchDesignationData()
        toast("A designação já foi criada. Atualizamos a tela.")
      } else {
        const message = axios.isAxiosError(error) ? error.response?.data?.message : undefined
        toast.error(typeof message === "string" ? message : "Não foi possível criar a designação. Tente novamente.")
      }
    } finally {
      creationRef.current = false
      setCreatingDesignation(false)
    }
  }

  const recreateDesignation = async () => {
    if (!designationData?.id) {
      toast.error("ID da designação não encontrado.")
      return
    }

    const loadingToast = toast.loading("Recriando designação...")
    setLoading(true)

    try {
      const user = getUserFromToken()
      if (!user) {
        console.error("User not found in token")
        toast.error("Usuário não autenticado.")
        setLoading(false)
        toast.dismiss(loadingToast)
        return
      }

      const groupId = selectedGroupId || user.groupId

      // Step 1: Delete designation (usando new API)
      await apiClient.delete(`/designations/${designationData.id}`)

      // Step 2: Create new designation
      await apiClient.post(`/designations?groupId=${groupId}`, {})

      // Step 3: Fetch designation data (buscar designação da semana)
      const response = await apiClient.get<IDesignationParticipants>(
        `/groups/${groupId}/designations/week?groupId=${groupId}`,
      )

      // Atualiza o estado completo com a resposta da API
      setDesignationData(response)
      setAssignments(response.assignments || [])
      setParticipants(response.participants || [])
      setLastUpdateTime(new Date())

      toast.success("Designação recriada com sucesso!")
      setShowRecreateModal(false)
    } catch (error) {
      console.error("Error recreating designation:", error)
      toast.error("Erro ao recriar designação. Tente novamente.")
    } finally {
      setLoading(false)
      toast.dismiss(loadingToast)
    }
  }

  const isAbsent = (participant: Incident) =>
    participant.incident_history?.status === "OPEN" || participant.incident_history?.status === "ACTIVE"

  const registerAbsence = async (participantId: string) => {
    if (!designationData?.id) return
    const loadingToast = toast.loading("Registrando ausência...")
    try {
      const response = await apiClient.post(`/designations/${designationData.id}/participants/${participantId}/incidences`, {
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

  const handleToggleOptional = async (optional: boolean) => {
    if (!designationData?.id) return

    // Optimistic update
    const previousValue = isOptional
    setIsOptional(optional)

    const loadingToast = toast.loading("Atualizando status de presença...")
    try {
      await apiClient.patch(
        `/designations/${designationData.id}/optional`,
        { optional },
      )
      toast.success(`Presença ${optional ? "opcional" : "obrigatória"} salva!`)
    } catch (error) {
      console.error("Error updating optional status:", error)
      toast.error("Erro ao atualizar status de presença.")
      setIsOptional(previousValue) // Rollback on error
    } finally {
      toast.dismiss(loadingToast)
    }
  }

  // Formatar a hora da última atualização
  const formattedLastUpdateTime = lastUpdateTime.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })

  return {
    designationLoadState,
    designationLoadError,
    missingGroupClosed,
    creatingDesignation,
    createDesignation,
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
    showRecreateModal,
    insights,
    lastUpdateTime: formattedLastUpdateTime,
    groupId: selectedGroupId,
    designationId: designationData?.id,
    setShowConfirmModal,
    setShowCancelModal,
    setShowRecreateModal,
    handleSearch,
    handleAutoAssignClick,
    handleCancelClick,
    handleRecreateClick,
    copyToClipboard,
    autoAssign,
    sendDesignation,
    cancelDesignation,
    reopenDesignation,
    recreateDesignation,
    handleUpdatePoint,
    moveParticipant,
    isAbsent,
    setIsOptional: handleToggleOptional,
    registerAbsence,
    fetchDesignationData,
  }
}
