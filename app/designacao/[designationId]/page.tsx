"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import type { WeekDesignation } from "@/types/week-designation"
import { Card, CardContent } from "@/components/ui/card"
import { DesignationItem } from "@/components/public/designation-item"
import { LinkNotFound } from "@/components/public/link-not-found"
import { DesignationHeader } from "@/components/public/designation-header"
import { MobileOnlyWrapper } from "@/components/public/mobile-only-wrapper"
import { DesignationLoading } from "@/components/public/designation-loading"
import toast from "react-hot-toast"

export default function DesignationListPage() {
  const params = useParams()
  const [designations, setDesignations] = useState<WeekDesignation[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState<"loading" | "screen" | "not-found">("loading")

  const designationId = params.designationId as string

  const fetchDesignations = async () => {
    const loadingToast = toast.loading('Carregando designações...')
    try {
      setLoading(true)
      const data = await apiClient.get<WeekDesignation[]>(`/designations/${designationId}/participants`, {
        endpoint: "legacy",
      })
      toast.dismiss(loadingToast)

      setDesignations(data || [])

      if (!data || data.length === 0) {
        setPage("not-found")
        toast.error("Nenhuma designação encontrada para este link.")
        return
      }

      setPage("screen")
      toast.success("Designações carregadas com sucesso!")
    } catch (err) {
      console.error("Error fetching designations:", err)
      toast.dismiss(loadingToast)
      setPage("not-found")
      toast.error("Erro ao carregar designações. Tente novamente")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (designationId) {
      fetchDesignations()
    }
  }, [designationId])

  if (page === "loading") {
    return <DesignationLoading />
  }

  if (page === "not-found") {
    return <LinkNotFound />
  }

  return (
    <MobileOnlyWrapper>
      <div className="min-h-screen bg-gray-50">
        <DesignationHeader />

        {/* Content */}
        <div className="pt-2 pb-8">
          {/* Header Section */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-[#333333] mb-3">
              Designações da Semana
            </h2>
            {designations.length > 0 && (
              <div className="bg-[#374192]/10 px-4 py-2 rounded-xl inline-block">
                <span className="text-[#374192] font-medium">{designations[0].event}</span>
              </div>
            )}
          </div>

          {/* Designations Card */}
          <Card className="w-full max-w-md mx-auto bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              {designations.map((designation, index) => (
                <DesignationItem
                  key={index}
                  designation={designation}
                  isLast={index === designations.length - 1}
                  onRefuse={() => { }}
                  showRefuseButton={false}
                />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileOnlyWrapper>
  )
}
