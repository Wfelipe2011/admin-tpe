"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Edit } from "lucide-react"
import { AlertAbsentParticipant } from "./alert-absent-participant"
import type { IncidentHistory } from "@/types/week-designation"

interface IncidentCardProps {
  incident: IncidentHistory
  onUpdateIncident: (reason: string, incidentId: string) => Promise<void>
}

export function IncidentCard({ incident, onUpdateIncident }: IncidentCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)

  const handleUpdateIncident = async (reason: string) => {
    await onUpdateIncident(reason, incident.id)
    setShowEditDialog(false)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Data não disponível"

    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4 text-amber-600">
          <AlertCircle size={20} />
          <h3 className="font-semibold">Designação Recusada</h3>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Motivo da Recusa</h4>
            <p className="mt-1">{incident.reason}</p>
          </div>

          {incident.createdAt && (
            <div>
              <h4 className="text-sm font-medium text-gray-500">Data da Recusa</h4>
              <p className="mt-1">{formatDate(incident.createdAt)}</p>
            </div>
          )}

          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => setShowEditDialog(true)}
            >
              <Edit size={16} />
              Atualizar Motivo
            </Button>
          </div>
        </div>
      </CardContent>

      <AlertAbsentParticipant
        showButton={showEditDialog}
        close={() => setShowEditDialog(false)}
        submit={handleUpdateIncident}
        initialReason={incident.reason}
        isEditing={true}
      />
    </Card>
  )
}
