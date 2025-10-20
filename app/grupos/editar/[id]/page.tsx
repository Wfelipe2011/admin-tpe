"use client"

import { ProtectedLayout } from "@/app/layout-protected"
import { GroupForm } from "@/components/group-form"
import { useParams } from "next/navigation"
import { Edit } from "lucide-react"

export default function EditGroupPage() {
  const params = useParams()
  const groupId = params.id as string

  return (
    <ProtectedLayout
      title="Editar Grupo"
      breadcrumbs={[{ label: "Início", href: "/" }, { label: "Grupos", href: "/grupos" }, { label: "Editar Grupo" }]}
    >
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#181C43] to-[#374192] rounded-lg p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Edit className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold mb-2">Editar Grupo</h1>
              <p className="text-blue-100 text-sm">
                Modifique as configurações e informações do grupo
              </p>
            </div>
          </div>
        </div>
        
        {/* Form Section */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
          <GroupForm groupId={groupId} isEditing />
        </div>
      </div>
    </ProtectedLayout>
  )
}
