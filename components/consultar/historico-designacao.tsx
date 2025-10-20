"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { apiClient } from "@/lib/api-client"
import { getUserFromToken } from "@/lib/auth-utils"
import type { IDesignationHistory } from "@/types/designation-history"
import { DesignationViewModal } from "./designation-view-modal"
import { useGroupStore } from "@/lib/stores/use-group-store"

export function HistoricoDesignacao() {
  const [designations, setDesignations] = useState<IDesignationHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined)
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedDesignationId, setSelectedDesignationId] = useState<string | null>(null)

  // Use the Zustand store instead of cookies
  const { selectedGroupId } = useGroupStore()

  const fetchDesignations = async () => {
    setLoading(true)
    try {
      const user = getUserFromToken()
      if (!user) {
        console.error("User not found in token")
        setLoading(false)
        return
      }

      // If selectedGroupId is "todos", don't fetch any designations
      if (selectedGroupId === "todos") {
        setDesignations([])
        setLoading(false)
        return
      }

      // Use the selectedGroupId from Zustand store
      const groupId = selectedGroupId
      let url = `/groups/${groupId}/designations`

      // Add date filters if they exist
      if (dateFrom || dateTo) {
        const params = new URLSearchParams()
        if (dateFrom) {
          // Ensure date is in YYYY-MM-DD format for API
          const formattedDateFrom = format(dateFrom, "yyyy-MM-dd")
          params.append("dateFrom", formattedDateFrom)
          console.log("Filtering from date:", formattedDateFrom)
        }
        if (dateTo) {
          // Ensure date is in YYYY-MM-DD format for API
          const formattedDateTo = format(dateTo, "yyyy-MM-dd")
          params.append("dateTo", formattedDateTo)
          console.log("Filtering to date:", formattedDateTo)
        }
        url += `?${params.toString()}`
      }

      console.log("Fetching designations with URL:", url)
      const response = await apiClient.get<IDesignationHistory[]>(url)
      console.log(`Fetched ${response.length} designations`)
      setDesignations(response)
    } catch (error) {
      console.error("Error fetching designations:", error)
    } finally {
      setLoading(false)
    }
  }

  // Update useEffect to watch for changes in selectedGroupId
  useEffect(() => {
    fetchDesignations()
  }, [dateFrom, dateTo, selectedGroupId])

  const filteredDesignations = designations

  const getStatusText = (status: string) => {
    switch (status) {
      case "OPEN":
        return "Em Aberto"
      case "IN_PROGRESS":
        return "Em Andamento"
      case "COMPLETED":
        return "Concluído"
      case "ARCHIVED":
        return "Arquivado"
      case "CANCELLED":
        return "Cancelado"
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-yellow-50 text-yellow-700 border border-yellow-200"
      case "IN_PROGRESS":
        return "bg-blue-50 text-blue-700 border border-blue-200"
      case "COMPLETED":
        return "bg-green-50 text-green-700 border border-green-200"
      case "ARCHIVED":
        return "bg-gray-50 text-gray-700 border border-gray-200"
      case "CANCELLED":
        return "bg-red-50 text-red-700 border border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200"
    }
  }

  const getPresenceText = (mandatory: boolean, cancelled: boolean) => {
    if (cancelled) return "-"
    if (mandatory) return "Obrigatória"
    return "Não Obrigatória"
  }

  const formatDate = (date: Date) => {
    const dateObj = new Date(date)
    const weekday = format(dateObj, "EEEE", { locale: ptBR })
    const formattedDate = format(dateObj, "dd/MM/yyyy")
    return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${formattedDate}`
  }

  const handleViewDesignation = (id: string) => {
    setSelectedDesignationId(id)
    setViewModalOpen(true)
  }

  const handleDateReset = () => {
    setDateFrom(undefined)
    setDateTo(undefined)
    // Explicitly call fetchDesignations after clearing dates
    setTimeout(() => fetchDesignations(), 0)
  }

  // If selectedGroupId is "todos", show a message instead of the table
  if (selectedGroupId === "todos") {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-lg border border-gray-100 shadow-sm">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#374192]/10 mb-6">
          <Eye className="h-8 w-8 text-[#374192]" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-semibold text-[#333333] mb-2">Selecione um Grupo</h3>
        <p className="text-[#666666] max-w-md">
          Para visualizar o histórico de designações, é necessário selecionar um grupo específico no seletor acima.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros Section */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-[#333333] mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-[#374192] rounded-full"></div>
          Filtros de Busca
        </h3>
        <div className="flex flex-col md:flex-row justify-start gap-4">
          <div className="flex flex-wrap gap-3 items-center">
            <DatePicker
              selected={dateFrom}
              onSelect={setDateFrom}
              mode="single"
              locale={ptBR}
              placeholder="Data inicial"
              className="w-[180px]"
            />
            <span className="text-sm text-[#666666] font-medium">até</span>
            <DatePicker
              selected={dateTo}
              onSelect={setDateTo}
              mode="single"
              locale={ptBR}
              placeholder="Data final"
              className="w-[180px]"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleDateReset}
              disabled={!dateFrom && !dateTo}
              className="h-9 border-[#929BD2] text-[#374192] hover:bg-[#374192]/10"
            >
              Limpar
            </Button>
            <Button
              size="sm"
              onClick={fetchDesignations}
              className="h-9 bg-[#374192] hover:bg-[#46607F] text-white"
            >
              Filtrar
            </Button>
          </div>
        </div>
      </div>

      {/* Tabela Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-[#333333] flex items-center gap-2">
            <div className="w-2 h-2 bg-[#929BD2] rounded-full"></div>
            Histórico de Designações
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8F8F8] border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#333333]">Data da Designação</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#333333]">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#333333]">Presença</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-[#333333]">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-8 h-8 border-4 border-[#374192] border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-[#666666] font-medium">Carregando histórico...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredDesignations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#929BD2]/10">
                        <Eye className="h-6 w-6 text-[#929BD2]" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-[#333333] font-medium">Nenhuma designação encontrada</p>
                        <p className="text-sm text-[#666666] mt-1">
                          Tente ajustar os filtros ou verificar se há designações para este período
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDesignations.map((designation) => (
                  <tr key={designation.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 text-sm text-[#333333] font-medium">
                      {formatDate(designation.designationDate)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(designation.status)}`}>
                        {getStatusText(designation.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#666666]">
                      {getPresenceText(designation.mandatoryPresence, designation.status === "CANCELLED")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDesignation(designation.id)}
                        className="text-[#374192] hover:bg-[#374192]/10 h-8 w-8 p-0"
                        title="Visualizar detalhes da designação"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DesignationViewModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        designationId={selectedDesignationId}
      />
    </div>
  )
}
