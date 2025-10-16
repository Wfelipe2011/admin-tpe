"use client"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Search, LayoutGrid, List, Filter } from "lucide-react"
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
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mx-auto">
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground text-center">
            Selecione um grupo específico para visualizar as designações.
          </p>
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
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mx-auto">
        <div className="space-y-4">
          {/* Status and Designate button */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-3">
            <div className="text-sm text-muted-foreground">
              Status:{" "}
              <span
                className={
                  designationDetails?.designation?.status
                    ? getStatusColor(designationDetails.designation.status)
                    : "text-gray-600"
                }
              >
                {designationDetails?.designation?.status
                  ? getStatusText(designationDetails.designation.status)
                  : "Carregando..."}
              </span>
            </div>
            <div className="flex flex-col xs:flex-row gap-2 w-full md:w-auto">
              <Link href="/lista-designacao/chamada" className="w-full xs:w-auto">
                <Button variant="outline" size="sm" className="px-4 w-full">
                  Chamada
                </Button>
              </Link>
              <Link href="/lista-designacao/designar" className="w-full xs:w-auto">
                <Button size="sm" className="px-4 w-full">
                  {designationDetails?.designation?.status === "OPEN" ? "Designar" : "Consultar Designação"}
                </Button>
              </Link>
            </div>
          </div>

          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar Voluntário"
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2 items-center justify-between sm:justify-start w-full sm:w-auto">
              {/* Presence Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filtrar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filtro Presença</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => setPresenceFilter("ausente")}>Ausente</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setPresenceFilter("presente")}>Presente</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setPresenceFilter("todos")}>Todos</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* View Mode Buttons */}
              <div className="flex border rounded-md overflow-hidden">
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  className="rounded-none"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  className="rounded-none"
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
              {/* Participant Count */}
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span className="font-medium text-primary">{filteredParticipants.length}</span> participantes
              </div>
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
          )}

          {/* Participants grid */}
          {!loading && (
            <div
              className={`
                grid gap-4
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
            <Card className="p-8 text-center max-w-3xl mx-auto">
              <p className="text-muted-foreground">Nenhum participante encontrado.</p>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
