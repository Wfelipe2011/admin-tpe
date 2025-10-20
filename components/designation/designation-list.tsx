"use client"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Search, LayoutGrid, List, Filter, ClipboardList } from "lucide-react"
import { getUserFromToken } from "@/lib/auth-utils"
import { apiClient } from "@/lib/api-client"
import { ParticipantCard } from "@/components/designation/participant-card"
import { ParticipantCardLarge } from "@/components/designation/participant-card-large"
import { DesignationCountdown } from "@/components/designation/designation-countdown"
import type { IParticipants, IDesignation } from "@/types/designation"
import Link from "next/link"
import { useGroupStore } from "@/lib/stores/use-group-store"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import toast from "react-hot-toast"

export function DesignationList({ designationId }: { designationId?: string } = {}) {
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid")
  const [participants, setParticipants] = useState<IParticipants[]>([])
  const [designationDetails, setDesignationDetails] = useState<IDesignation | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [presenceFilter, setPresenceFilter] = useState<"todos" | "presente" | "ausente">("todos")
  const { selectedGroupId } = useGroupStore()

  // Get user token and extract groupId
  const fetchData = useCallback(async () => {
    const loadingToast = toast.loading("Carregando designações...")
    try {
      setLoading(true)
      const user = getUserFromToken()

      if (!user) {
        console.error("User not found in token")
        setLoading(false)
        return
      }

      // Use selectedGroupId from Zustand store
      const groupId = selectedGroupId || user.groupId

      if (!groupId || groupId === "todos") {
        toast.dismiss(loadingToast)
        toast("Selecione um grupo para visualizar as designações.", {
          icon: "⚠️",
        })
        setLoading(false)
        return
      }

      // Fetch designation details
      const designationData = await apiClient.get<IDesignation>(`/groups/${groupId}/designations/week-details`)
      setDesignationDetails(designationData)

      // Fetch participants
      const participantsData = await apiClient.get<IParticipants[]>(`/participants?groupId=${groupId}`)
      setParticipants(participantsData)
      toast.dismiss(loadingToast)
      toast.success("Designações carregadas com sucesso!")
    } catch (error) {
      toast.dismiss(loadingToast)
      toast.error("Erro ao carregar designações. Tente novamente.")
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }, [selectedGroupId]) // Adicione selectedGroupId como dependência

  useEffect(() => {
    fetchData()
  }, [fetchData]) // Use fetchData como dependência ao invés de selectedGroupId

  // Handle participant status change (absence added or removed)
  const handleParticipantStatusChange = useCallback(() => {
    fetchData() // Refresh the data
  }, [fetchData])

  // Filter participants based on search term
  const filteredParticipants = participants
    .filter((participant) => participant.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((participant: any) => {
      if (presenceFilter === "ausente") {
        return participant.isAbsent === true
      }
      if (presenceFilter === "presente") {
        // Assumes isAbsent is false or undefined if present
        return participant.isAbsent === false || participant.isAbsent === undefined
      }
      return true // "todos"
    })

  // Add the getStatusText function inside the component
  const getStatusText = (status: string) => {
    switch (status) {
      case "OPEN":
        return "Em aberto"
      case "IN_PROGRESS":
        return "Em progresso"
      case "COMPLETED":
        return "Concluído"
      case "ARCHIVED":
        return "Arquivado"
      case "CANCELLED":
        return "Cancelado"
      default:
        return "Desconhecido"
    }
  }

  // Add the getStatusColor function inside the component
  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "text-yellow-600 font-semibold"
      case "IN_PROGRESS":
        return "text-purple-600 font-semibold"
      case "COMPLETED":
        return "text-green-600 font-semibold"
      case "ARCHIVED":
        return "text-blue-600 font-semibold"
      case "CANCELLED":
        return "text-red-600 font-semibold"
      default:
        return "text-gray-600 font-semibold"
    }
  }

  // If "todos" is selected, show a message
  if (selectedGroupId === "todos") {
    return (
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#F8F8F8]">
              <ClipboardList className="h-8 w-8 text-[#929BD2]" />
            </div>
            <p className="text-[#333333] font-medium">Selecione um grupo específico</p>
            <p className="text-sm text-[#666666]">Escolha um grupo para visualizar as designações</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Countdown timer component */}
      <DesignationCountdown
        endDate={designationDetails?.designation?.designationEndDate || null}
        className="md:-mt-[3rem] mb-4 md:mb-0"
      />

      {/* Main content box */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-8">
        <div className="space-y-8">
          {/* Status and Designate button */}
          <div className="flex flex-col gap-6 lg:flex-row lg:justify-between lg:items-center">
            <div className="bg-[#F8F8F8] rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#374192] rounded-full"></div>
                <span className="text-sm font-medium text-[#666666]">Status da Designação:</span>
                <span
                  className={
                    designationDetails?.designation?.status
                      ? getStatusColor(designationDetails.designation.status)
                      : "text-[#666666] font-medium"
                  }
                >
                  {designationDetails?.designation?.status
                    ? getStatusText(designationDetails.designation.status)
                    : "Carregando..."}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Link href="/lista-designacao/chamada">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-[#929BD2] text-[#374192] hover:bg-[#929BD2] hover:text-white transition-colors font-medium"
                >
                  Chamada
                </Button>
              </Link>
              <Link href="/lista-designacao/designar">
                <Button
                  className="w-full sm:w-auto bg-[#374192] hover:bg-[#46607F] text-white font-medium transition-colors"
                >
                  {designationDetails?.designation?.status === "OPEN" ? "Designar" : "Consultar Designação"}
                </Button>
              </Link>
            </div>
          </div>

          {/* Search and filters */}
          <div className="flex flex-col gap-6 lg:flex-row lg:justify-between lg:items-center">
            <div className="relative flex-1 max-w-md">
              <label htmlFor="participant-search" className="sr-only">
                Pesquisar participantes
              </label>
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" aria-hidden="true" />
              <Input
                id="participant-search"
                type="search"
                placeholder="Pesquisar Voluntário..."
                className="pl-10 h-10 border-gray-200 focus:border-[#374192] focus:ring-[#374192] rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-describedby="search-help"
              />
              <div id="search-help" className="sr-only">
                Digite o nome do participante para filtrar a lista
              </div>
            </div>

            <div className="flex flex-wrap gap-4 items-center justify-between lg:justify-start">
              {/* Presence Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-gray-300 text-[#666666] hover:bg-gray-50 font-medium"
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Filtrar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="text-[#333333] font-medium">Filtro Presença</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => setPresenceFilter("ausente")}>Ausente</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setPresenceFilter("presente")}>Presente</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setPresenceFilter("todos")}>Todos</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* View Mode Buttons */}
              <div className="flex items-center bg-[#F8F8F8] rounded-lg p-1" role="tablist" aria-label="Opções de visualização">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`rounded-md transition-all font-medium ${viewMode === "list"
                    ? 'bg-[#374192] text-white shadow-sm hover:bg-[#46607F]'
                    : 'text-[#666666] hover:bg-white hover:text-[#374192]'
                    }`}
                  onClick={() => setViewMode("list")}
                  aria-pressed={viewMode === "list"}
                  role="tab"
                  aria-selected={viewMode === "list"}
                  aria-controls="participants-content"
                  title="Visualizar em lista"
                >
                  <List className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`rounded-md transition-all font-medium ${viewMode === "grid"
                    ? 'bg-[#374192] text-white shadow-sm hover:bg-[#46607F]'
                    : 'text-[#666666] hover:bg-white hover:text-[#374192]'
                    }`}
                  onClick={() => setViewMode("grid")}
                  aria-pressed={viewMode === "grid"}
                  role="tab"
                  aria-selected={viewMode === "grid"}
                  aria-controls="participants-content"
                  title="Visualizar em grade"
                >
                  <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>

              {/* Participant Count */}
              <div className="bg-[#F8F8F8] px-4 py-2 rounded-lg">
                <span className="text-sm font-medium text-[#666666]">
                  <span className="text-[#374192] font-semibold">{filteredParticipants.length}</span> participantes
                </span>
              </div>
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex justify-center items-center h-64" role="status" aria-live="polite">
              <div className="text-center space-y-4">
                <div
                  className="w-8 h-8 border-4 border-[#374192] border-t-transparent rounded-full animate-spin mx-auto"
                  aria-hidden="true"
                ></div>
                <p className="text-[#666666] font-medium">Carregando participantes...</p>
                <span className="sr-only">Carregando dados dos participantes</span>
              </div>
            </div>
          )}

          {/* Participants grid */}
          {!loading && (
            <div
              id="participants-content"
              role="tabpanel"
              aria-label={`Participantes em visualização de ${viewMode === "grid" ? 'grade' : 'lista'}`}
              className={`
                grid gap-6
                ${viewMode === "list"
                  ? "grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                }
              `}
            >
              {filteredParticipants.map((participant) =>
                viewMode === "list" ? (
                  <ParticipantCard
                    key={participant.id}
                    participant={participant}
                    designationId={designationId || designationDetails?.designation?.id}
                    onStatusChange={handleParticipantStatusChange}
                  />
                ) : (
                  <ParticipantCardLarge
                    key={participant.id}
                    participant={participant}
                    designationId={designationId || designationDetails?.designation?.id}
                    onStatusChange={handleParticipantStatusChange}
                  />
                ),
              )}
            </div>
          )}

          {/* No results */}
          {!loading && filteredParticipants.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#F8F8F8]">
                <Search className="h-8 w-8 text-[#929BD2]" aria-hidden="true" />
              </div>
              <p className="mt-4 text-[#333333] font-medium">Nenhum participante encontrado</p>
              <p className="text-sm text-[#666666] mt-1">Tente ajustar os filtros de busca ou verifique os critérios</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
