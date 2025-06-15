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
      <div className="flex flex-col min-h-screen">
        <DesignationHeader />

        {/* Content */}
        <div className="flex-1 px-4 pt-4 pb-6">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold mb-2">Designações da Semana</h2>
            {designations.length > 0 && (
              <div>
                <strong>{designations[0].event}</strong>
              </div>
            )}
          </div>

          <Card className="w-full max-w-md mx-auto">
            <CardContent className="p-4 pb-16">
              {designations.map((designation, index) => (
                <DesignationItem
                  key={index}
                  designation={designation}
                  isLast={index === designations.length - 1}
                  onRefuse={() => {}}
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
