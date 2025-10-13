"use client"

import { useEffect, useState } from "react"
import { ProtectedLayout } from "@/app/layout-protected"
import { ParticipantsTab } from "@/components/designation/participants-tab"
import { useDesignation } from "@/hooks/use-designation"

export default function ChamadaPage() {
  const { loading, participants, isAbsent, registerAbsence } = useDesignation()

  const [groupIdFromCookie, setGroupIdFromCookie] = useState<string | undefined>(undefined)

  useEffect(() => {
    // Helper to get cookie by name
    const getCookie = (name: string): string | undefined => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop()?.split(";").shift()
      return undefined
    }

    const gdId = getCookie("groupId")
    setGroupIdFromCookie(gdId)
  }, [])

  return (
    <ProtectedLayout
      title="Chamada de Voluntários"
      breadcrumbs={[{ label: "Lista para Designação", href: "/lista-designacao" }, { label: "Chamada" }]}
    >
      <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 md:px-6">
        <ParticipantsTab
          participants={participants}
          isAbsent={isAbsent}
          onRegisterAbsence={registerAbsence}
          loading={loading}
          groupId={groupIdFromCookie}
        />
      </div>
    </ProtectedLayout>
  )
}
