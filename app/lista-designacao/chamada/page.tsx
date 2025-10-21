"use client"

import { ProtectedLayout } from "@/app/layout-protected"
import { ParticipantsTab } from "@/components/designation/participants-tab"
import { useDesignation } from "@/hooks/use-designation"
import { Users } from "lucide-react"

export default function ChamadaPage() {
  const { loading, participants, groupId, designationId, isAbsent, registerAbsence } = useDesignation()

  return (
    <ProtectedLayout
      title="Chamada de Voluntários"
      breadcrumbs={[{ label: "Lista para Designação", href: "/lista-designacao" }, { label: "Chamada" }]}
    >
      <div className="space-y-4 sm:space-y-8">
        {/* Header Section - Mobile optimized */}
        <div className="bg-gradient-to-r from-[#181C43] to-[#374192] rounded-lg p-4 sm:p-8 text-white">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-white/20 rounded-lg">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-semibold mb-1 sm:mb-2">Chamada de Voluntários</h1>
              <p className="text-blue-100 text-xs sm:text-sm">
                Registre a presença dos participantes para as designações da semana
              </p>
            </div>
          </div>
        </div>

        {/* Content Section - Mobile optimized */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-3 sm:p-8">
          <ParticipantsTab
            participants={participants || []}
            isAbsent={(participant: any) => isAbsent(participant)}
            onRegisterAbsence={registerAbsence}
            loading={loading}
            groupId={groupId}
            designationId={designationId}
          />
        </div>
      </div>
    </ProtectedLayout>
  )
}
