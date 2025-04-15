"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProtectedLayout } from "@/app/layout-protected"
import { Button } from "@/components/ui/button"
import { EnhancedPDFViewer } from "@/components/petition/enhanced-pdf-viewer"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"

interface PetitionResponse {
  id: string
  name: string
  protocol: string
  status: string
  publicUrl: string
  privateUrl: string
  createdAt: Date
  updatedAt: Date
}

export default function VisualizarPeticaoPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [petition, setPetition] = useState<PetitionResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchPetition = async () => {
      try {
        setLoading(true)
        const id = params.id as string
        const data = await apiClient.get<PetitionResponse>(`/petitions/${id}`, { endpoint: "new" })
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

  const handleSave = async () => {
    if (!petition || !isConfirmed) return

    try {
      setIsSaving(true)
      await apiClient.patch(`/petitions/waiting-information/${petition.id}`, {}, { endpoint: "new" })

      toast({
        title: "Sucesso",
        description: "Petição atualizada com sucesso",
      })

      // Redirect to petitions list
      router.push("/peticoes")
    } catch (error) {
      console.error("Error updating petition:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a petição",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <ProtectedLayout
      title="Visualizar Petição"
      breadcrumbs={[
        { label: "Início", href: "/" },
        { label: "Petições", href: "/peticoes" },
        { label: "Visualizar Petição" },
      ]}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-8">
          <EnhancedPDFViewer urls={[petition?.publicUrl]} />
          <EnhancedPDFViewer urls={[petition?.privateUrl]} />
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="confirm-checkbox"
              checked={isConfirmed}
              onCheckedChange={(checked) => setIsConfirmed(checked === true)}
            />
            <label
              htmlFor="confirm-checkbox"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Todas as informações sigilosas foram devidamente preenchidas*
            </label>
          </div>

          <Button onClick={handleSave} disabled={!isConfirmed || isSaving} className="sm:w-auto">
            {isSaving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
    </ProtectedLayout>
  )
}
