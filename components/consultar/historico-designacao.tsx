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
import Cookies from "js-cookie"

export function HistoricoDesignacao() {
  const [designations, setDesignations] = useState<IDesignationHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined)
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedDesignationId, setSelectedDesignationId] = useState<string | null>(null)

  const fetchDesignations = async () => {
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

  useEffect(() => {
    fetchDesignations()
  }, [dateFrom, dateTo])

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
        return "text-yellow-600"
      case "IN_PROGRESS":
        return "text-blue-600"
      case "COMPLETED":
        return "text-green-600"
      case "ARCHIVED":
        return "text-gray-600"
      case "CANCELLED":
        return "text-red-600"
      default:
        return "text-gray-600"
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-start gap-4">
        <div className="flex gap-2 items-center">
          <DatePicker
            selected={dateFrom}
            onSelect={setDateFrom}
            mode="single"
            locale={ptBR}
            placeholder="Data inicial"
            className="w-[180px]"
          />
          <span className="text-sm text-muted-foreground">até</span>
          <DatePicker
            selected={dateTo}
            onSelect={setDateTo}
            mode="single"
            locale={ptBR}
            placeholder="Data final"
            className="w-[180px]"
          />
          <Button variant="outline" size="sm" onClick={handleDateReset} disabled={!dateFrom && !dateTo} className="h-9">
            Limpar
          </Button>
          <Button size="sm" onClick={fetchDesignations} className="h-9">
            Filtrar
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Data Da Designação</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Presença</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Visualizar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center text-sm text-gray-500">
                    <div className="flex justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredDesignations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center text-sm text-gray-500">
                    Nenhuma designação encontrada
                  </td>
                </tr>
              ) : (
                filteredDesignations.map((designation) => (
                  <tr key={designation.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{formatDate(designation.designationDate)}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={getStatusColor(designation.status)}>{getStatusText(designation.status)}</span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {getPresenceText(designation.mandatoryPresence, designation.status === "CANCELLED")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDesignation(designation.id)}
                        title="Visualizar"
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
