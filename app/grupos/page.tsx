import { ProtectedLayout } from "@/app/layout-protected"
import { GroupList } from "@/components/group-list"

export default function GroupsPage() {
  return (
    <ProtectedLayout title="Gerenciamento de Grupos" breadcrumbs={[{ label: "Grupos" }]}>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Gerenciamento de Grupos</h1>
        <GroupList />
      </div>
    </ProtectedLayout>
  )
}
