import { ProtectedLayout } from "@/app/layout-protected"
import { GroupList } from "@/components/group-list"
import { Users } from "lucide-react"

export default function GroupsPage() {
  return (
    <ProtectedLayout title="Gerenciamento de Grupos" breadcrumbs={[{ label: "Grupos" }]}>
      <div className="space-y-4 sm:space-y-8">
        {/* Header Section - Mobile optimized */}
        <div className="bg-gradient-to-r from-[#181C43] to-[#374192] rounded-lg p-4 sm:p-8 text-white">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-white/20 rounded-lg">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-semibold mb-1 sm:mb-2">Gerenciamento de Grupos</h1>
              <p className="text-blue-100 text-xs sm:text-sm">
                Organize e gerencie todos os grupos da congregação de forma eficiente
              </p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
          <GroupList />
        </div>
      </div>
    </ProtectedLayout>
  )
}
