"use client"

import { ProtectedLayout } from "@/app/layout-protected"
import { GroupForm } from "@/components/group-form"

export default function NewGroupPage() {
  return (
    <ProtectedLayout
      title="Criar Novo Grupo"
      breadcrumbs={[
        { label: "Início", href: "/" },
        { label: "Grupos", href: "/grupos" },
        { label: "Criar Novo Grupo" },
      ]}
    >
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Criar Novo Grupo</h1>
        <GroupForm />
      </div>
    </ProtectedLayout>
  )
}
