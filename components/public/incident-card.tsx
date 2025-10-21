"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Edit3 } from "lucide-react"
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

  return (
    <Card className="w-full max-w-md mx-auto bg-white border border-gray-200 shadow-sm">
      <CardContent className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="p-1.5 sm:p-2 bg-[#F1C40F]/20 rounded-lg">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-[#F1C40F]" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-[#333333]">Designação Recusada</h3>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {/* Reason */}
          <div className="bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-100">
            <h4 className="text-xs sm:text-sm font-semibold text-[#333333] mb-2">Motivo da Recusa</h4>
            <p className="text-[#666666] leading-relaxed text-sm sm:text-base">{incident.reason}</p>
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-1 sm:pt-2">
            <Button
              variant="outline"
              className="flex items-center gap-1 sm:gap-2 border-[#929BD2] text-[#374192] hover:bg-[#374192]/10 h-8 sm:h-10 text-xs sm:text-sm"
              onClick={() => setShowEditDialog(true)}
            >
              <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
              Atualizar Motivo
            </Button>
          </div>
        </div>
      </CardContent>

      <AlertAbsentParticipant
        showButton={showEditDialog}
        close={() => setShowEditDialog(false)}
        submit={handleUpdateIncident}
      />
    </Card>
  )
}
