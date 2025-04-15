import { ProtectedLayout } from "@/app/layout-protected"
import { GroupParticipants } from "@/components/group-participants"

interface GroupParticipantsPageProps {
  params: {
    id: string
  }
}

export default function GroupParticipantsPage({ params }: GroupParticipantsPageProps) {
  return (
    <ProtectedLayout
      title="Participantes do Grupo"
      breadcrumbs={[{ label: "Início", href: "/" }, { label: "Grupos", href: "/grupos" }, { label: "Participantes" }]}
    >
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Participantes do Grupo</h1>
        <GroupParticipants groupId={params.id} />
      </div>
    </ProtectedLayout>
  )
}
