"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import type { WeekDesignation, IncidentHistory } from "@/types/week-designation"
import { Card, CardContent } from "@/components/ui/card"
import { DesignationItem } from "@/components/public/designation-item"
import { AlertAbsentParticipant } from "@/components/public/alert-absent-participant"
import { LinkNotFound } from "@/components/public/link-not-found"
import { DesignationHeader } from "@/components/public/designation-header"
import { MobileOnlyWrapper } from "@/components/public/mobile-only-wrapper"
import { DesignationLoading } from "@/components/public/designation-loading"
import { IncidentCard } from "@/components/public/incident-card"

export default function ParticipantDesignationPage() {
  const params = useParams()
  const [designations, setDesignations] = useState<WeekDesignation[]>([])
  const [incident, setIncident] = useState<IncidentHistory | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAlert, setShowAlert] = useState(false)
  const [page, setPage] = useState<"loading" | "screen" | "not-found">("loading")

  const designationId = params.designationId as string
  const participantId = params.participantId as string

  const fetchDesignations = async () => {
    try {
      setLoading(true)
      const data = await apiClient.get<WeekDesignation[]>(
        `/designations/${designationId}/participants/${participantId}`,
        { endpoint: "legacy" },
      )

      setDesignations(data || [])

      if (!data || data.length === 0) {
        setPage("not-found")
        return
      }

      // Check if there's an incident
      if (data[0]?.incident_history && data[0].incident_history.status === "OPEN") {
        setIncident(data[0].incident_history)
      } else {
        setIncident(null)
      }

      setPage("screen")
    } catch (err) {
      console.error("Error fetching designations:", err)
      setPage("not-found")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (designationId && participantId) {
      fetchDesignations()
    }
  }, [designationId, participantId])

  const handleAbsent = async (reason: string) => {
    try {
      await apiClient.post(`/designations/${designationId}/participants/${participantId}/incidences`, { reason }, { endpoint: "legacy" })
      await fetchDesignations()
      return Promise.resolve()
    } catch (error) {
      console.error("Error submitting absence:", error)
      return Promise.reject(error)
    }
  }

  const handleUpdateIncident = async (reason: string, incidentId: string) => {
    try {
      await apiClient.put(`/designations/${designationId}/participants/${participantId}/incidences/${incidentId}`, { reason }, { endpoint: "legacy" })
      await fetchDesignations()
      return Promise.resolve()
    } catch (error) {
      console.error("Error updating incident:", error)
      return Promise.reject(error)
    }
  }

  if (page === "loading") {
    return <DesignationLoading />
  }

  if (page === "not-found") {
    return <LinkNotFound />
  }

  return (
    <MobileOnlyWrapper>
      <div className="flex flex-col min-h-screen">
        <DesignationHeader />

        {/* Content */}
        <div className="flex-1 px-6 pt-6 pb-8 bg-gray-50">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-[#333333] mb-3">
              Designação da Semana
            </h2>
            {designations.length > 0 && (
              <div className="bg-[#374192]/10 px-4 py-2 rounded-xl inline-block mb-4">
                <span className="text-[#374192] font-medium">{designations[0].event}</span>
              </div>
            )}
            <div className="bg-white p-4 rounded-xl border border-gray-200 max-w-md mx-auto">
              <p className="text-sm text-[#666666] leading-relaxed">
                {incident
                  ? "Você recusou esta designação. Você pode atualizar o motivo da recusa abaixo."
                  : "Caso não esteja presente, recuse a designação. Qualquer dúvida entre em contato com o capitão do seu grupo."}
              </p>
            </div>
          </div>

          {/* Main Content */}
          {incident ? (
            <IncidentCard incident={incident} onUpdateIncident={handleUpdateIncident} />
          ) : (
            <Card className="w-full max-w-md mx-auto bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                {designations.map((designation, index) => (
                  <DesignationItem
                    key={index}
                    designation={designation}
                    isLast={index === designations.length - 1}
                    participantId={participantId}
                    onRefuse={() => {
                      if (designation?.incident_history?.status === "OPEN") return
                      setShowAlert(true)
                    }}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          <AlertAbsentParticipant showButton={showAlert} close={() => setShowAlert(false)} submit={handleAbsent} />
        </div>
      </div>
    </MobileOnlyWrapper>
  )
}
