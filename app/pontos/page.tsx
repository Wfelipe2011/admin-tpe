import { ProtectedLayout } from "@/app/layout-protected"
import { PointsList } from "@/components/points/points-list"

export default function PointsPage() {
  return (
    <ProtectedLayout
      title="Pontos"
      breadcrumbs={[{ label: "Início", href: "/" }, { label: "Pontos" }]}
    >
      <div className="space-y-4">
        <PointsList />
      </div>
    </ProtectedLayout>
  )
}