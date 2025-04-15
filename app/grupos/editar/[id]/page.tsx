"use client"

import { ProtectedLayout } from "@/app/layout-protected"
import { GroupForm } from "@/components/group-form"
import { useParams } from "next/navigation"

export default function EditGroupPage() {
  const params = useParams()
  const groupId = params.id as string

  return (
    <ProtectedLayout
      title="Editar Grupo"
      breadcrumbs={[{ label: "Início", href: "/" }, { label: "Grupos", href: "/grupos" }, { label: "Editar Grupo" }]}
    >
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Editar Grupo</h1>
        <GroupForm groupId={groupId} isEditing />
      </div>
    </ProtectedLayout>
  )
}
