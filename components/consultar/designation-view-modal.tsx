"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { apiClient } from "@/lib/api-client"
import { getUserFromToken } from "@/lib/auth-utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, User, MapPin } from "lucide-react"
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
        return "bg-yellow-100 text-yellow-800"
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800"
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      case "ARCHIVED":
        return "bg-gray-100 text-gray-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const isAbsent = (participant: Incident) =>
    participant.incident_history?.status === "OPEN" || participant.incident_history?.status === "ACTIVE"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes da Designação</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-md">
            <p>{error}</p>
          </div>
        ) : designationData ? (
          <div className="space-y-4">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row justify-between gap-2">
              <div>
                <h3 className="text-lg font-medium">{designationData.group?.name || "Designação"}</h3>
                <p className="text-sm text-muted-foreground">
                  {designationData.createdAt && formatDate(designationData.createdAt)}
                </p>
              </div>
              <Badge className={getStatusColor(designationData.status)}>{getStatusText(designationData.status)}</Badge>
            </div>

            {/* Stats */}
            <div className="flex gap-4 justify-center bg-gray-50 p-3 rounded-md">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <span className="font-medium">{designationData.total?.participants || 0}</span>
                <span className="text-sm text-muted-foreground">Participantes</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="font-medium">{designationData.total?.vacancies || 0}</span>
                <span className="text-sm text-muted-foreground">Vagas</span>
              </div>
            </div>

            {/* Points */}
            <div className="space-y-2">
              <h3 className="text-md font-medium">Pontos de Designação</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {designationData.assignments?.map((assignment: Assignment) => (
                  <Card key={assignment.point.id} className={!assignment.point.status ? "opacity-70" : ""}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">{assignment.point.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant={assignment.point.status ? "default" : "outline"}>
                            {assignment.point.status ? "Ativo" : "Inativo"}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs">
                            <User className="h-3 w-3" />
                            <span>
                              {assignment.participants?.length || 0}/{assignment.config?.max || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Carrinhos: {assignment.publication_carts?.map((cart) => cart.name).join(", ") || "Nenhum"}
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-2">
                        {assignment.participants?.map((participant) => (
                          <div key={participant.id} className="flex items-center gap-2 p-1 border rounded-md">
                            <div
                              className={`h-7 w-7 rounded-full ${isAbsent(participant) ? "bg-red-100" : "bg-primary/10"} flex items-center justify-center flex-shrink-0`}
                            >
                              {participant.profile_photo ? (
                                <img
                                  src={participant.profile_photo || "/placeholder.svg"}
                                  alt={participant.name}
                                  className="h-full w-full rounded-full object-cover"
                                />
                              ) : (
                                <span
                                  className={`${isAbsent(participant) ? "text-red-500" : "text-primary"} text-xs font-medium`}
                                >
                                  {participant.name.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-sm flex items-center gap-1 truncate">
                                {participant.name}
                                {isAbsent(participant) && (
                                  <AlertCircle
                                    className="h-3 w-3 text-red-500 flex-shrink-0"
                                    title="Participante ausente"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                        {(!assignment.participants || assignment.participants.length === 0) && (
                          <p className="text-sm text-muted-foreground text-center py-2">
                            Nenhum participante designado
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {(!designationData.assignments || designationData.assignments.length === 0) && (
                  <p className="text-sm text-muted-foreground col-span-2 text-center py-4">
                    Nenhum ponto de designação disponível
                  </p>
                )}
              </div>
            </div>

            {/* Participants */}
            <div className="space-y-2">
              <h3 className="text-md font-medium">Participantes</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {designationData.participants?.map((participant) => (
                  <div key={participant.id} className="flex items-center gap-2 p-2 border rounded-md">
                    <div
                      className={`h-8 w-8 rounded-full ${isAbsent(participant) ? "bg-red-100" : "bg-primary/10"} flex items-center justify-center flex-shrink-0`}
                    >
                      {participant.profile_photo ? (
                        <img
                          src={participant.profile_photo || "/placeholder.svg"}
                          alt={participant.name}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <span
                          className={`${isAbsent(participant) ? "text-red-500" : "text-primary"} text-sm font-medium`}
                        >
                          {participant.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-sm flex items-center gap-1 truncate">
                        {participant.name}
                        {isAbsent(participant) && (
                          <AlertCircle className="h-3 w-3 text-red-500 flex-shrink-0" title="Participante ausente" />
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{participant.phone}</div>
                    </div>
                  </div>
                ))}

                {(!designationData.participants || designationData.participants.length === 0) && (
                  <p className="text-sm text-muted-foreground col-span-3 text-center py-4">
                    Nenhum participante disponível
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">Nenhum dado disponível</div>
        )}
      </DialogContent>
    </Dialog>
  )
}
