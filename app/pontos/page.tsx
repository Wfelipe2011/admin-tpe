import { ProtectedLayout } from "@/app/layout-protected"
import { PointsList } from "@/components/points/points-list"
import { MapPin } from "lucide-react"

export default function PointsPage() {
  return (
    <ProtectedLayout
      title="Pontos"
      breadcrumbs={[{ label: "Início", href: "/" }, { label: "Pontos" }]}
    >
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#181C43] to-[#374192] rounded-lg p-8 text-white mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold mb-2">Gerenciamento de Pontos</h1>
            <p className="text-blue-100 text-sm">
              Configure e gerencie os pontos de designação para cada grupo
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <PointsList />
      </div>
    </ProtectedLayout>
  )
}