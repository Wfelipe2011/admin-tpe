"use client"

import { ProtectedLayout } from "@/app/layout-protected"
import { ParticipantsTab } from "@/components/designation/participants-tab"
import { useDesignation } from "@/hooks/use-designation"

export default function ChamadaPage() {
  const { loading, participants, groupId, isAbsent, registerAbsence } = useDesignation()

  return (
    <ProtectedLayout
      title="Chamada de Voluntários"
      breadcrumbs={[{ label: "Lista para Designação", href: "/lista-designacao" }, { label: "Chamada" }]}
    >
      <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 md:px-6">
        <ParticipantsTab
          participants={participants || []}
          isAbsent={isAbsent}
          onRegisterAbsence={registerAbsence}
          loading={loading}
          groupId={groupId}
        />
      </div>
    </ProtectedLayout>
  )
}
