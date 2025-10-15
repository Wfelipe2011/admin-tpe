"use client"

import { ProtectedLayout } from "@/app/layout-protected"
import { ParticipantsTab } from "@/components/designation/participants-tab"
import { useDesignation } from "@/hooks/use-designation"

export default function ChamadaPage() {
  const { loading, participants, groupId, designationId, isAbsent, registerAbsence } = useDesignation()

  return (
    <ProtectedLayout
      title="Chamada de Voluntários"
      breadcrumbs={[{ label: "Lista para Designação", href: "/lista-designacao" }, { label: "Chamada" }]}
    >
      <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 md:px-6">
        <ParticipantsTab
          participants={participants || []}
          isAbsent={(participant: any) => isAbsent(participant)}
          onRegisterAbsence={registerAbsence}
          loading={loading}
          groupId={groupId}
          designationId={designationId}
        />
      </div>
    </ProtectedLayout>
  )
}
