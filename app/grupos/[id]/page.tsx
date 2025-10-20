import { ProtectedLayout } from "@/app/layout-protected"
import { GroupParticipants } from "@/components/group-participants"
import { Users } from "lucide-react"

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
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#181C43] to-[#374192] rounded-lg p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold mb-2">Participantes do Grupo</h1>
              <p className="text-blue-100 text-sm">
                Gerencie os membros deste grupo e suas informações
              </p>
            </div>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
          <GroupParticipants groupId={params.id} />
        </div>
      </div>
    </ProtectedLayout>
  )
}
