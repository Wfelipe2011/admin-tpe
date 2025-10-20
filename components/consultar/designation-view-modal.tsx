"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { apiClient } from "@/lib/api-client"
import { getUserFromToken } from "@/lib/auth-utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, User, MapPin, Eye } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { IDesignationParticipants, Assignment, Incident } from "@/types/designation-participants"

interface DesignationViewModalProps {
  isOpen: boolean
  onClose: () => void
  designationId: string | null
}

export function DesignationViewModal({ isOpen, onClose, designationId }: DesignationViewModalProps) {
  const [loading, setLoading] = useState(false)
  const [designationData, setDesignationData] = useState<IDesignationParticipants | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDesignationData = async () => {
      if (!designationId || !isOpen) return

      setLoading(true)
      setError(null)

      try {
        const user = getUserFromToken()
        if (!user || !user.groupId) {
          setError("Usuário ou grupo não encontrado")
          setLoading(false)
          return
        }

        const groupId = user.groupId
        const response = await apiClient.get<IDesignationParticipants>(
          `/designations/${designationId}?groupId=${groupId}`,
        )

        setDesignationData(response)
      } catch (error) {
        console.error("Error fetching designation data:", error)
        setError("Erro ao carregar dados da designação")
      } finally {
        setLoading(false)
      }
    }

    fetchDesignationData()
  }, [designationId, isOpen])

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString)
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  }

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

  const isAbsent = (participant: Incident) =>
    participant.incident_history?.status === "OPEN" || participant.incident_history?.status === "ACTIVE"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="pb-4 border-b border-gray-100">
          <DialogTitle className="text-xl font-semibold text-[#333333] flex items-center gap-3">
            <div className="p-2 bg-[#374192]/10 rounded-lg">
              <Eye className="w-5 h-5 text-[#374192]" />
            </div>
            Detalhes da Designação
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-[#374192] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[#666666] font-medium">Carregando detalhes...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            <p className="font-medium">{error}</p>
          </div>
        ) : designationData ? (
          <div className="space-y-6 pt-4">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-[#333333]">{designationData.group?.name || "Designação"}</h3>
                <p className="text-sm text-[#666666] mt-1">
                  {designationData.createdAt && formatDate(designationData.createdAt)}
                </p>
              </div>
              <Badge className={`${getStatusColor(designationData.status)} font-medium`}>
                {getStatusText(designationData.status)}
              </Badge>
            </div>

            {/* Stats */}
            <div className="bg-white border border-gray-100 rounded-lg p-6">
              <h4 className="text-base font-semibold text-[#333333] mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-[#374192] rounded-full"></div>
                Estatísticas
              </h4>
              <div className="flex gap-8 justify-center">
                <div className="flex items-center gap-3 p-4 bg-[#374192]/5 rounded-lg border border-[#374192]/20">
                  <div className="p-2 bg-[#374192] rounded-lg">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-[#333333]">{designationData.total?.participants || 0}</span>
                    <p className="text-sm text-[#666666] font-medium">Participantes</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-[#929BD2]/5 rounded-lg border border-[#929BD2]/20">
                  <div className="p-2 bg-[#929BD2] rounded-lg">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-[#333333]">{designationData.total?.vacancies || 0}</span>
                    <p className="text-sm text-[#666666] font-medium">Vagas</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Points */}
            <div className="space-y-4">
              <h4 className="text-base font-semibold text-[#333333] flex items-center gap-2">
                <div className="w-2 h-2 bg-[#929BD2] rounded-full"></div>
                Pontos de Designação
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {designationData.assignments?.map((assignment: Assignment) => (
                  <Card key={assignment.point.id} className={`border border-gray-200 shadow-sm ${!assignment.point.status ? "opacity-70" : ""}`}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-base font-semibold text-[#333333]">{assignment.point.name}</CardTitle>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge
                            variant={assignment.point.status ? "default" : "outline"}
                            className={assignment.point.status ? "bg-[#2ECC71] text-white" : "border-gray-300 text-[#666666]"}
                          >
                            {assignment.point.status ? "Ativo" : "Inativo"}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs bg-gray-50 px-2 py-1 rounded-md">
                            <User className="h-3 w-3 text-[#666666]" />
                            <span className="text-[#666666] font-medium">
                              {assignment.participants?.length || 0}/{assignment.config?.max || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-[#666666] bg-gray-50 p-2 rounded border">
                        <strong>Carrinhos:</strong> {assignment.publication_carts?.map((cart) => cart.name).join(", ") || "Nenhum"}
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-3">
                        {assignment.participants?.map((participant) => (
                          <div key={participant.id} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                            <div
                              className={`h-8 w-8 rounded-full ${isAbsent(participant) ? "bg-red-100 border border-red-200" : "bg-[#374192]/10 border border-[#374192]/20"} flex items-center justify-center flex-shrink-0`}
                            >
                              {participant.profile_photo ? (
                                <img
                                  src={participant.profile_photo || "/placeholder.svg"}
                                  alt={participant.name}
                                  className="h-full w-full rounded-full object-cover"
                                />
                              ) : (
                                <span
                                  className={`${isAbsent(participant) ? "text-red-600" : "text-[#374192]"} text-xs font-semibold`}
                                >
                                  {participant.name.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-sm flex items-center gap-2 truncate">
                                <span className="text-[#333333]">{participant.name}</span>
                                {isAbsent(participant) && (
                                  <div className="flex items-center" title="Participante ausente">
                                    <AlertCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                        {(!assignment.participants || assignment.participants.length === 0) && (
                          <div className="text-center py-6 text-[#666666] bg-gray-50 rounded-lg border border-gray-200">
                            <User className="h-6 w-6 mx-auto mb-2 text-[#929BD2]" />
                            <p className="text-sm font-medium">Nenhum participante designado</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {(!designationData.assignments || designationData.assignments.length === 0) && (
                  <div className="col-span-2 text-center py-8 text-[#666666] bg-gray-50 rounded-lg border border-gray-200">
                    <MapPin className="h-8 w-8 mx-auto mb-3 text-[#929BD2]" />
                    <p className="text-base font-medium">Nenhum ponto de designação disponível</p>
                  </div>
                )}
              </div>
            </div>

            {/* Participants */}
            <div className="space-y-4">
              <h4 className="text-base font-semibold text-[#333333] flex items-center gap-2">
                <div className="w-2 h-2 bg-[#E74C3C] rounded-full"></div>
                Todos os Participantes
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {designationData.participants?.map((participant) => (
                  <div key={participant.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                    <div
                      className={`h-10 w-10 rounded-full ${isAbsent(participant) ? "bg-red-100 border border-red-200" : "bg-[#374192]/10 border border-[#374192]/20"} flex items-center justify-center flex-shrink-0`}
                    >
                      {participant.profile_photo ? (
                        <img
                          src={participant.profile_photo || "/placeholder.svg"}
                          alt={participant.name}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <span
                          className={`${isAbsent(participant) ? "text-red-600" : "text-[#374192]"} text-sm font-semibold`}
                        >
                          {participant.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm flex items-center gap-2 truncate">
                        <span className="text-[#333333]">{participant.name}</span>
                        {isAbsent(participant) && (
                          <div className="flex items-center" title="Participante ausente">
                            <AlertCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-[#666666] mt-1">{participant.phone}</div>
                    </div>
                  </div>
                ))}

                {(!designationData.participants || designationData.participants.length === 0) && (
                  <div className="col-span-3 text-center py-8 text-[#666666] bg-gray-50 rounded-lg border border-gray-200">
                    <User className="h-8 w-8 mx-auto mb-3 text-[#929BD2]" />
                    <p className="text-base font-medium">Nenhum participante disponível</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-[#666666]">
            <Eye className="h-12 w-12 mx-auto mb-4 text-[#929BD2]" />
            <p className="text-base font-medium">Nenhum dado disponível</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
