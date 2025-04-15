"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ProtectedLayout } from "@/app/layout-protected"
import { PetitionForm } from "@/components/petition/petition-form"
import { EnhancedPDFViewer } from "@/components/petition/enhanced-pdf-viewer"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import type { PetitionDetail } from "@/types/petition-form"

export default function CompletarPeticaoPage() {
  const params = useParams()
  const { toast } = useToast()
  const [petition, setPetition] = useState<PetitionDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPetition = async () => {
      try {
        setLoading(true)
        const id = params.id as string
        const data = await apiClient.get<PetitionDetail>(`/petitions/${id}`, { endpoint: "new" })
        setPetition(data)
      } catch (error) {
        console.error("Error fetching petition:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os detalhes da petição",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchPetition()
    }
  }, [params.id, toast])

  return (
    <ProtectedLayout
      title="Completar Petição"
      breadcrumbs={[
        { label: "Início", href: "/" },
        { label: "Petições", href: "/peticoes" },
        { label: "Completar Petição" },
      ]}
    >
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="order-2 lg:order-1">
            <PetitionForm petitionId={params.id as string} petitionData={petition || undefined} />
          </div>
          <div className="order-1 lg:order-2">
            {petition?.publicUrl ? (
              <EnhancedPDFViewer urls={[petition.publicUrl]} />
            ) : (
              <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg">
                <p className="text-muted-foreground">Documento não disponível</p>
              </div>
            )}
          </div>
        </div>
      )}
    </ProtectedLayout>
  )
}
