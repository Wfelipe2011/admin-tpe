import { ProtectedLayout } from "@/app/layout-protected"
import { PointsList } from "@/components/points/points-list"
import { MapPin } from "lucide-react"

export default function PointsPage() {
  return (
    <ProtectedLayout
      title="Pontos"
      breadcrumbs={[{ label: "Início", href: "/" }, { label: "Pontos" }]}
    >
      {/* Header Section - Mobile optimized */}
      <div className="bg-gradient-to-r from-[#181C43] to-[#374192] rounded-lg p-4 sm:p-8 text-white mb-4 sm:mb-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2 sm:p-3 bg-white/20 rounded-lg">
            <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-semibold mb-1 sm:mb-2">Gerenciamento de Pontos</h1>
            <p className="text-blue-100 text-xs sm:text-sm">
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